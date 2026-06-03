import Image from "next/image"
import type { ReactNode } from "react"
import { Battery, Bluetooth, Power, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HeaderStatus } from "@/components/hardware/types"
import { StatusBadge } from "@/components/hardware/StatusBadge"

export function Header({
  gatewayUrl,
  status,
  hardwareInfo,
  onToggleEnabled,
  onStop,
}: {
  gatewayUrl: string
  status: HeaderStatus
  hardwareInfo: ReactNode
  onToggleEnabled: () => void
  onStop: () => void
}) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative grid size-14 shrink-0 place-items-center rounded-full border-2 border-blue-500 bg-white shadow-sm transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              title="Hardware information"
            >
              <Image
                src="/HubSmall.svg"
                alt=""
                width={34}
                height={34}
                className="size-9"
                priority
              />
              <span className="absolute right-0 bottom-0 size-4 rounded-full border-2 border-white bg-green-500" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Hardware information</DialogTitle>
              <DialogDescription>
                Hub connection and A-F port telemetry.
              </DialogDescription>
            </DialogHeader>
            {hardwareInfo}
          </DialogContent>
        </Dialog>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-normal text-neutral-900">
            Hardware
          </h1>
          <p className="mt-1 truncate text-sm text-neutral-500">
            gateway: {gatewayUrl || "-"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={status.wsState === "connected" ? "ok" : "waiting"}>
          <Bluetooth className="size-3.5" />
          ws {status.wsState}
        </StatusBadge>
        <StatusBadge tone={status.controlConnected ? "ok" : "waiting"}>
          {status.controlConnected ? "control connected" : "control waiting"}
        </StatusBadge>
        <StatusBadge tone={status.telemetryReady ? "ok" : "waiting"}>
          {status.telemetryReady
            ? `telemetry ${status.telemetryAgeSec}s`
            : "telemetry waiting"}
        </StatusBadge>
        <StatusBadge tone="neutral">
          <Battery className="size-3.5 text-green-500" />
          {status.batteryText}
        </StatusBadge>
        <Button
          variant={status.enabled ? "secondary" : "outline"}
          size="sm"
          className="h-9 rounded-full border-neutral-200 bg-white px-4 text-neutral-900 hover:bg-neutral-100"
          onClick={onToggleEnabled}
        >
          <Power className="size-4" />
          {status.enabled ? "Disable" : "Enable"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-9 rounded-full px-4 text-red-600"
          onClick={onStop}
        >
          <StopCircle className="size-4" />
          Stop
        </Button>
      </div>
    </header>
  )
}
