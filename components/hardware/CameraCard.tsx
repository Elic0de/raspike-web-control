import { Camera } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/hardware/StatusBadge"

export function CameraCard({
  streamUrl,
  cameraOk,
  onLoad,
  onError,
}: {
  streamUrl: string
  cameraOk: boolean
  onLoad: () => void
  onError: () => void
}) {
  return (
    <Card className="flex min-h-0 gap-3 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
          <Camera className="size-5 text-neutral-500" />
          Camera
        </CardTitle>
        <CardAction>
          <StatusBadge tone={cameraOk ? "ok" : "waiting"}>
            {cameraOk ? "stream live" : "stream waiting"}
          </StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] px-4 pb-4">
        <div className="relative min-h-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950">
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              LIVE
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              640x480
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              30fps
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={streamUrl}
            alt="RasPi camera stream"
            className="h-full w-full object-contain"
            onLoad={onLoad}
            onError={onError}
          />
        </div>
        <div className="mt-2 truncate text-xs text-neutral-400">
          {streamUrl}
        </div>
      </CardContent>
    </Card>
  )
}
