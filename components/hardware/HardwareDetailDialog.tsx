import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type {
  HardwareTelemetry,
  PortId,
  PortStatus,
} from "@/components/hardware/types"
import { DashedConnector } from "@/components/hardware/DashedConnector"
import { PortNode } from "@/components/hardware/PortNode"
import { SpikeHubIllustration } from "@/components/hardware/SpikeHubIllustration"

const fallbackPort = (port: PortId): PortStatus => ({
  port,
  type: "empty",
  value: "-",
})

function valueOrDash(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(0)
    : "-"
}

function portOf(telemetry: HardwareTelemetry, port: PortId) {
  return (
    telemetry.ports.find((item) => item.port === port) ?? fallbackPort(port)
  )
}

export function HardwareDetailDialog({
  trigger,
  telemetry,
}: {
  trigger: ReactNode
  telemetry: HardwareTelemetry
}) {
  const a = portOf(telemetry, "A")
  const b = portOf(telemetry, "B")
  const c = portOf(telemetry, "C")
  const d = portOf(telemetry, "D")
  const e = portOf(telemetry, "E")
  const f = portOf(telemetry, "F")

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-[1040px] overflow-hidden border-neutral-200 bg-white p-0 shadow-2xl sm:max-w-[1040px]">
        <DialogTitle className="sr-only">Hardware detail</DialogTitle>
        <div className="grid gap-0 px-8 pt-8 pb-6">
          <div className="mx-auto flex w-full max-w-[760px] items-center justify-between border-b border-neutral-200 pb-4 text-sm">
            <div className="flex items-center gap-5 text-neutral-400">
              <span>
                Yaw:
                <span className="ml-2 text-neutral-500">
                  {valueOrDash(telemetry.yaw)}
                </span>
              </span>
              <span>
                Pitch:
                <span className="ml-2 text-neutral-500">
                  {valueOrDash(telemetry.pitch)}
                </span>
              </span>
              <span>
                Roll:
                <span className="ml-2 text-neutral-500">
                  {valueOrDash(telemetry.roll)}
                </span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-full px-2 text-sm font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            >
              TILT ANGLE
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <div className="relative mx-auto h-[540px] w-full max-w-[940px] overflow-hidden">
            <div className="absolute top-[70px] left-1/2 z-10 -translate-x-1/2">
              <SpikeHubIllustration />
            </div>

            <DashedConnector className="top-[78px] left-1/2 h-[420px] w-[820px] -translate-x-1/2 opacity-90" />

            <PortNode status={a} className="top-[106px] left-0" />
            <PortNode status={b} className="top-[106px] right-0" />
            <PortNode status={c} className="top-[255px] left-0 opacity-60" />
            <PortNode status={d} className="top-[232px] right-0" />
            <PortNode status={e} className="bottom-[22px] left-0" />
            <PortNode status={f} className="right-0 bottom-[22px]" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
