import Image from "next/image"
import { Cpu } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HardwarePort, HeaderStatus } from "@/components/hardware/types"
import { StatusBadge } from "@/components/hardware/StatusBadge"

export function HardwareInfoDialog({
  ports,
  gatewayUrl,
  status,
}: {
  ports: HardwarePort[]
  gatewayUrl: string
  status: HeaderStatus
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
          <Image
            src="/HubSmall.svg"
            alt=""
            width={42}
            height={42}
            className="size-11"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-base font-semibold text-neutral-900">
            <Cpu className="size-5 text-blue-500" />
            Hub
          </div>
          <div className="mt-1 truncate text-sm text-neutral-500">
            gateway: {gatewayUrl || "-"}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge
              tone={status.wsState === "connected" ? "ok" : "waiting"}
            >
              ws {status.wsState}
            </StatusBadge>
            <StatusBadge tone={status.controlConnected ? "ok" : "waiting"}>
              {status.controlConnected
                ? "control connected"
                : "control waiting"}
            </StatusBadge>
            <StatusBadge tone={status.telemetryReady ? "ok" : "waiting"}>
              {status.telemetryReady ? "telemetry live" : "telemetry waiting"}
            </StatusBadge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ports.map((port) => (
          <Card
            key={port.id}
            className="gap-3 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
                    {port.id}
                  </span>
                  <Image
                    src={port.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 object-contain opacity-70"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-500">
                    {port.value}
                  </div>
                  <div className="text-xs text-neutral-400 capitalize">
                    {port.kind}
                  </div>
                </div>
              </div>

              <Separator className="my-3 bg-neutral-200" />

              <div className="grid gap-2">
                {port.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-neutral-500">{detail.label}</span>
                    <span className="font-medium text-neutral-900">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
