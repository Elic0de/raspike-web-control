import { Gamepad2 } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Drive } from "@/components/hardware/types"

function DriveMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
      <div className="text-xs font-semibold text-neutral-400">{label}</div>
      <div className="mt-2 text-base font-semibold text-neutral-900">
        {value}
      </div>
    </div>
  )
}

export function DriveCard({ drive }: { drive: Drive }) {
  return (
    <Card className="gap-3 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
          <Gamepad2 className="size-5 text-blue-500" />
          Drive
        </CardTitle>
        <CardAction className="text-xs font-medium text-neutral-400">
          WASD / Arrows
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="relative mx-auto mb-4 size-20 rounded-full border border-neutral-200 bg-neutral-50">
          <div className="absolute top-1/2 right-4 left-4 border-t border-dashed border-neutral-300" />
          <div className="absolute top-4 bottom-4 left-1/2 border-l border-dashed border-neutral-300" />
          <div
            className="absolute top-1/2 left-1/2 size-4 rounded-full bg-blue-500 shadow-sm transition-transform"
            style={{
              transform: `translate(calc(-50% + ${drive.steering * 28}px), calc(-50% + ${drive.throttle * -28}px))`,
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <DriveMetric label="THROTTLE" value={drive.throttle.toFixed(2)} />
          <DriveMetric label="STEERING" value={drive.steering.toFixed(2)} />
          <DriveMetric label="ARM" value={drive.arm.toFixed(2)} />
        </div>
      </CardContent>
    </Card>
  )
}
