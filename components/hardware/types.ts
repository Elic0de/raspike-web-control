import type { ComponentType, SVGProps } from "react"

export type PortId = "A" | "B" | "C" | "D" | "E" | "F"
export type WsState = "connecting" | "connected" | "disconnected"

export type HeaderStatus = {
  wsState: WsState
  controlConnected: boolean
  telemetryReady: boolean
  telemetryAgeSec?: number | null
  batteryText: string
  enabled: boolean
}

export type HardwarePort = {
  id: PortId
  icon: string
  value: string
  active?: boolean
  kind: "motor" | "force" | "color" | "distance" | "empty"
  details: {
    label: string
    value: string
  }[]
}

export type Drive = {
  throttle: number
  steering: number
  arm: number
}

export type ActionButton = {
  label: string
  detail: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  onClick: () => void
}
