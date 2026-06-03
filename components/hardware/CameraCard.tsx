import { Camera, VideoOff } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
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
    <Card className="self-start rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
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
      <CardContent className="grid min-h-0 flex-1 grid-rows-[auto_auto] px-4 pb-4">
        <AspectRatio
          ratio={16 / 9}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950"
        >
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            <span
              className={
                cameraOk
                  ? "rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-semibold text-white"
                  : "rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white"
              }
            >
              {cameraOk ? "LIVE" : "WAITING"}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              16:9
            </span>
            {cameraOk ? (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                30fps
              </span>
            ) : null}
          </div>
          {!cameraOk ? (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div className="grid justify-items-center gap-3 text-neutral-400">
                <VideoOff className="size-9" />
                <div>
                  <div className="text-sm font-medium text-neutral-300">
                    Camera stream unavailable
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Waiting for MJPEG frames from the Raspberry Pi.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={streamUrl}
            alt="RasPi camera stream"
            className={
              cameraOk
                ? "h-full w-full object-contain"
                : "h-full w-full object-contain opacity-0"
            }
            onLoad={onLoad}
            onError={onError}
          />
        </AspectRatio>
        <div className="mt-2 truncate text-xs text-neutral-400">
          {streamUrl}
        </div>
      </CardContent>
    </Card>
  )
}
