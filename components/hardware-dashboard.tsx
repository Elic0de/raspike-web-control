"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  CircleStop,
  Gauge,
  Gamepad2,
  Power,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PortId = "A" | "B" | "C" | "D" | "E" | "F"
type WsState = "connecting" | "connected" | "disconnected"

type MotorTelemetry = {
  port?: number
  count?: number
  speed?: number
  power?: number
  stalled?: boolean
}

type ForceTelemetry = {
  port?: number
  touched?: boolean
}

type Telemetry = {
  commands?: {
    left_power?: number
    right_power?: number
  }
  control?: {
    safe_mode?: boolean
    emergency?: boolean
    power_limit?: number
    throttle?: number
    steering?: number
    arm?: number
  }
  drive_motors?: {
    left_port?: number
    right_port?: number
    left?: MotorTelemetry | null
    right?: MotorTelemetry | null
  }
  motors?: Record<string, MotorTelemetry>
  force_sensors?: Record<string, ForceTelemetry>
  imu?: {
    acceleration?: number[]
    angular_velocity?: number[]
  }
  battery?: {
    voltage_mv?: number
    current_ma?: number
  }
}

type GatewayStatus = {
  control_connected?: boolean
  telemetry_count?: number
  telemetry_age_sec?: number | null
  telemetry_peer?: string | null
}

type Drive = {
  throttle: number
  steering: number
  arm: number
}

const portLayouts: Record<
  Exclude<PortId, "C">,
  {
    fallbackIcon: string
    fallbackValue: string
    fallbackUnit?: string
    position: string
    bracket: string
    compact: string
  }
> = {
  A: {
    fallbackIcon: "/SensorMotor.svg",
    fallbackValue: "-",
    position: "left-[2%] top-[18%]",
    bracket:
      "left-[17%] top-[23%] h-[16%] w-[8%] rounded-l-2xl border-y-2 border-l-2",
    compact: "left-[2%]",
  },
  B: {
    fallbackIcon: "/SensorMotor.svg",
    fallbackValue: "-",
    position: "right-[2%] top-[18%]",
    bracket:
      "right-[17%] top-[23%] h-[16%] w-[8%] rounded-r-2xl border-y-2 border-r-2",
    compact: "left-[18%]",
  },
  D: {
    fallbackIcon: "/SensorTouch.svg",
    fallbackValue: "-",
    fallbackUnit: "N",
    position: "right-[3%] top-[50%]",
    bracket: "right-[22%] top-[52%] h-0 w-[12%] border-t-2",
    compact: "left-[37%]",
  },
  E: {
    fallbackIcon: "/SensorColor.svg",
    fallbackValue: "-",
    position: "left-[3%] bottom-[9%]",
    bracket:
      "left-[17%] bottom-[18%] h-[16%] w-[8%] rounded-l-2xl border-y-2 border-l-2",
    compact: "left-[55%]",
  },
  F: {
    fallbackIcon: "/SensorDistance.svg",
    fallbackValue: "-",
    fallbackUnit: "cm",
    position: "right-[3%] bottom-[8%]",
    bracket:
      "right-[17%] bottom-[18%] h-[16%] w-[8%] rounded-r-2xl border-y-2 border-r-2",
    compact: "left-[73%]",
  },
}

const shownPorts = ["A", "B", "D", "E", "F"] as const

function getGatewayWsUrl() {
  const configured = process.env.NEXT_PUBLIC_GATEWAY_WS_URL
  if (configured) {
    return configured
  }

  const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${proto}//${window.location.host}/ws`
}

function portName(port: number | undefined): PortId | undefined {
  if (!Number.isInteger(port) || port === undefined || port < 0 || port > 5) {
    return undefined
  }
  return String.fromCharCode(65 + port) as PortId
}

function valueOrDash(value: unknown, digits = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-"
}

function numberOrDash(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : "-"
}

function estimateTilt(accel: number[] | undefined) {
  if (!accel || accel.length < 3 || accel.some((v) => !Number.isFinite(v))) {
    return { pitch: "-", roll: "-" }
  }
  const [x, y, z] = accel
  const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
  const roll = Math.atan2(y, z) * (180 / Math.PI)
  return {
    pitch: valueOrDash(pitch),
    roll: valueOrDash(roll),
  }
}

function getAxis(keys: Set<string>): Drive {
  return {
    throttle: (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0),
    steering: (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0),
    arm: (keys.has("arrowup") ? 1 : 0) - (keys.has("arrowdown") ? 1 : 0),
  }
}

function StatusPill({
  children,
  active,
}: {
  children: React.ReactNode
  active: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {children}
    </span>
  )
}

function SensorGraphic({
  icon,
  size = "large",
}: {
  icon: string
  size?: "large" | "small"
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center",
        size === "large" ? "size-14" : "size-8"
      )}
    >
      <Image
        src={icon}
        alt=""
        width={size === "large" ? 56 : 32}
        height={size === "large" ? 56 : 32}
        className="h-full w-full object-contain opacity-75"
      />
    </div>
  )
}

function SensorReadout({
  port,
  icon,
  value,
  unit,
  active,
  compact = false,
}: {
  port: PortId
  icon: string
  value: string
  unit?: string
  active?: boolean
  compact?: boolean
}) {
  const suffix = unit ?? (value === "-" ? "" : "°")

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[#9b9b9b]",
        compact ? "gap-1.5" : "flex-col"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{port}</span>
        <SensorGraphic icon={icon} size={compact ? "small" : "large"} />
      </div>
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          "h-6 gap-1 px-1 text-[13px] font-medium text-[#0087ff] hover:bg-[#eaf4ff] hover:text-[#0087ff]",
          compact && "h-5 text-[11px]"
        )}
      >
        {active !== undefined ? (
          <span
            className={cn(
              "size-2 rounded-full ring-1 ring-white",
              active ? "bg-emerald-500" : "bg-red-500"
            )}
          />
        ) : null}
        <span>
          {value}
          {suffix ? ` ${suffix.toUpperCase()}` : ""}
        </span>
        <ChevronDown className={compact ? "size-3" : "size-4"} />
      </Button>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-[#e8e8e8] bg-white/75 px-3 py-2">
      <div className="truncate text-[11px] font-medium text-[#aaa] uppercase">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-[#555]">
        {value}
      </div>
    </div>
  )
}

export function HardwareDashboard() {
  const [wsState, setWsState] = useState<WsState>("connecting")
  const [gateway, setGateway] = useState<GatewayStatus>({})
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [drive, setDrive] = useState<Drive>({
    throttle: 0,
    steering: 0,
    arm: 0,
  })
  const [wsUrl, setWsUrl] = useState("")

  const wsRef = useRef<WebSocket | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const enabledRef = useRef(false)

  const send = (payload: object) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let closed = false

    const connect = () => {
      const url = getGatewayWsUrl()
      setWsUrl(url)
      setWsState("connecting")
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.addEventListener("open", () => setWsState("connected"))
      ws.addEventListener("close", () => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }
        setWsState("disconnected")
        if (!closed) {
          reconnectTimer = setTimeout(connect, 800)
        }
      })
      ws.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === "telemetry") {
            setTelemetry(msg.payload)
          } else if (msg.type === "gateway_status") {
            setGateway(msg.payload)
          }
        } catch {
          // Ignore malformed gateway frames.
        }
      })
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      wsRef.current?.close()
    }
  }, [])

  useEffect(() => {
    const updateDrive = () => {
      const next = getAxis(keysRef.current)
      setDrive(next)
      if (enabledRef.current) {
        send({ type: "drive", ...next })
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (["w", "a", "s", "d", "arrowup", "arrowdown", " "].includes(key)) {
        event.preventDefault()
      }
      if (key === " ") {
        send({ type: "action", action: "emergency_stop" })
        return
      }
      keysRef.current.add(key)
      updateDrive()
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase())
      updateDrive()
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    const interval = setInterval(updateDrive, 50)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      clearInterval(interval)
    }
  }, [])

  const motorsByPort = useMemo(() => {
    const map = new Map<PortId, MotorTelemetry>()
    Object.values(telemetry?.motors ?? {}).forEach((motor) => {
      const name = portName(motor.port)
      if (name) {
        map.set(name, motor)
      }
    })
    const leftPort = portName(telemetry?.drive_motors?.left_port)
    const rightPort = portName(telemetry?.drive_motors?.right_port)
    if (leftPort && telemetry?.drive_motors?.left) {
      map.set(leftPort, telemetry.drive_motors.left)
    }
    if (rightPort && telemetry?.drive_motors?.right) {
      map.set(rightPort, telemetry.drive_motors.right)
    }
    return map
  }, [telemetry])

  const forcesByPort = useMemo(() => {
    const map = new Map<PortId, ForceTelemetry>()
    Object.values(telemetry?.force_sensors ?? {}).forEach((force) => {
      const name = portName(force.port)
      if (name) {
        map.set(name, force)
      }
    })
    return map
  }, [telemetry])

  const ports = shownPorts.map((id) => {
    const layout = portLayouts[id]
    const motor = motorsByPort.get(id)
    const force = forcesByPort.get(id)
    if (motor) {
      return {
        ...layout,
        id,
        icon: "/SensorMotor.svg",
        value: valueOrDash(motor.count),
        unit: undefined,
        active: motor.stalled === undefined ? undefined : !motor.stalled,
      }
    }
    if (force) {
      return {
        ...layout,
        id,
        icon: "/SensorTouch.svg",
        value: force.touched ? "1" : "0",
        unit: "N",
        active: force.touched,
      }
    }
    return {
      ...layout,
      id,
      icon: layout.fallbackIcon,
      value: layout.fallbackValue,
      unit: layout.fallbackUnit,
      active: undefined,
    }
  })

  const gyro = telemetry?.imu?.angular_velocity ?? []
  const accel = telemetry?.imu?.acceleration ?? []
  const tilt = estimateTilt(accel)
  const orientation = [
    { label: "Yaw", value: valueOrDash(gyro[2]) },
    { label: "Pitch", value: tilt.pitch },
    { label: "Roll", value: tilt.roll },
  ]
  const leftPort = portName(telemetry?.drive_motors?.left_port)
  const rightPort = portName(telemetry?.drive_motors?.right_port)
  const leftMotor =
    telemetry?.drive_motors?.left ??
    (leftPort ? motorsByPort.get(leftPort) : undefined)
  const rightMotor =
    telemetry?.drive_motors?.right ??
    (rightPort ? motorsByPort.get(rightPort) : undefined)
  const hasTelemetry =
    Boolean(gateway.telemetry_count && gateway.telemetry_count > 0) &&
    (gateway.telemetry_age_sec ?? 999) < 2

  const toggleEnabled = () => {
    const next = !enabled
    setEnabled(next)
    send({ type: "enable", enabled: next })
  }

  const sendAction = (action: string) => {
    send({ type: "action", action })
  }

  return (
    <main className="min-h-svh bg-[#f7f7f7] text-[#777]">
      <section className="mx-auto flex min-h-svh w-full max-w-[760px] flex-col justify-between px-4 py-6 sm:px-8 lg:px-12">
        <header className="mx-auto flex w-full max-w-[620px] flex-col gap-3 border-b border-[#e3e3e3] pb-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-5">
              {orientation.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="font-medium text-[#9a9a9a]">
                    {item.label}:
                  </span>
                  <span className="min-w-8 text-center font-medium text-[#999]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-1 text-sm font-medium text-[#0087ff] hover:bg-[#eaf4ff] hover:text-[#0087ff]"
            >
              TILT ANGLE
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <StatusPill active={wsState === "connected"}>
                ws {wsState}
              </StatusPill>
              <StatusPill active={Boolean(gateway.control_connected)}>
                {gateway.control_connected
                  ? "control connected"
                  : "control waiting"}
              </StatusPill>
              <StatusPill active={hasTelemetry}>
                {hasTelemetry
                  ? `telemetry ${gateway.telemetry_age_sec}s`
                  : "telemetry waiting"}
              </StatusPill>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={enabled ? "secondary" : "outline"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={toggleEnabled}
              >
                <Power className="size-4" />
                {enabled ? "Disable" : "Enable"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => sendAction("emergency_stop")}
              >
                <CircleStop className="size-4" />
                Stop
              </Button>
            </div>
          </div>
        </header>

        <div className="relative mx-auto hidden aspect-[1.38] w-full max-w-[640px] sm:block">
          {ports.map((port) => (
            <div
              key={`${port.id}-bracket`}
              className={cn(
                "absolute border-dashed border-[#9c9c9c]",
                port.bracket
              )}
            />
          ))}

          <div className="absolute top-[8%] left-1/2 w-[47%] -translate-x-1/2 drop-shadow-[0_18px_22px_rgba(0,0,0,0.08)]">
            <Image
              src="/hub-spike-bluetooth-hardware-page.9d0a04be.png"
              alt="LEGO SPIKE Prime hub"
              width={450}
              height={510}
              priority
              className="h-auto w-full"
            />
          </div>

          {ports.map((port) => (
            <div key={port.id} className={cn("absolute", port.position)}>
              <SensorReadout
                port={port.id}
                icon={port.icon}
                value={port.value}
                unit={port.unit}
                active={port.active}
              />
            </div>
          ))}
        </div>

        <div className="mx-auto grid w-full max-w-sm gap-6 py-8 sm:hidden">
          <div className="mx-auto w-[72%] drop-shadow-[0_18px_22px_rgba(0,0,0,0.08)]">
            <Image
              src="/hub-spike-bluetooth-hardware-page.9d0a04be.png"
              alt="LEGO SPIKE Prime hub"
              width={450}
              height={510}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>

        <footer className="mx-auto grid w-full max-w-[640px] gap-3 border-t border-[#e7e7e7] pt-3">
          <div className="relative h-12 w-full">
            {ports.map((port) => (
              <div
                key={`${port.id}-compact`}
                className={cn("absolute top-1", port.compact)}
              >
                <SensorReadout
                  port={port.id}
                  icon={port.icon}
                  value={port.value}
                  unit={port.unit}
                  active={port.active}
                  compact
                />
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
            <section className="grid gap-2 rounded-lg border border-[#e3e3e3] bg-white/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#666]">
                  <Gamepad2 className="size-4 text-[#0087ff]" />
                  Drive
                </div>
                <div className="text-xs text-[#aaa]">WASD / Arrow Up Down</div>
              </div>
              <div className="relative mx-auto size-24 rounded-full border border-[#e1e1e1] bg-[#fafafa]">
                <div className="absolute top-1/2 right-3 left-3 border-t border-dashed border-[#d2d2d2]" />
                <div className="absolute top-3 bottom-3 left-1/2 border-l border-dashed border-[#d2d2d2]" />
                <div
                  className="absolute top-1/2 left-1/2 size-4 rounded-full bg-[#0087ff] shadow-sm transition-transform"
                  style={{
                    transform: `translate(calc(-50% + ${drive.steering * 32}px), calc(-50% + ${drive.throttle * -32}px))`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Metric label="Throttle" value={drive.throttle.toFixed(2)} />
                <Metric label="Steering" value={drive.steering.toFixed(2)} />
                <Metric label="Arm" value={drive.arm.toFixed(2)} />
              </div>
            </section>

            <section className="grid gap-2 rounded-lg border border-[#e3e3e3] bg-white/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#666]">
                  <Gauge className="size-4 text-[#0087ff]" />
                  Motors / System
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Gyro reset"
                    onClick={() => sendAction("gyro_reset")}
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => sendAction("start")}
                  >
                    Start
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Metric
                  label={`Left ${leftPort ? `Port ${leftPort}` : "Port -"}`}
                  value={`cmd ${numberOrDash(telemetry?.commands?.left_power)} / enc ${numberOrDash(leftMotor?.count)}`}
                />
                <Metric
                  label={`Right ${rightPort ? `Port ${rightPort}` : "Port -"}`}
                  value={`cmd ${numberOrDash(telemetry?.commands?.right_power)} / enc ${numberOrDash(rightMotor?.count)}`}
                />
                <Metric
                  label="Left speed / power"
                  value={`${numberOrDash(leftMotor?.speed)} / ${numberOrDash(leftMotor?.power)}`}
                />
                <Metric
                  label="Right speed / power"
                  value={`${numberOrDash(rightMotor?.speed)} / ${numberOrDash(rightMotor?.power)}`}
                />
                <Metric
                  label="Battery"
                  value={
                    telemetry?.battery?.voltage_mv
                      ? `${telemetry.battery.voltage_mv} mV`
                      : "-"
                  }
                />
                <Metric
                  label="Current"
                  value={
                    telemetry?.battery?.current_ma
                      ? `${telemetry.battery.current_ma} mA`
                      : "-"
                  }
                />
              </div>
            </section>
          </div>

          <div className="truncate text-center text-[11px] text-[#aaa]">
            gateway: {wsUrl || "-"}
            {gateway.telemetry_peer
              ? ` / telemetry from ${gateway.telemetry_peer}`
              : ""}
          </div>
        </footer>
      </section>
    </main>
  )
}
