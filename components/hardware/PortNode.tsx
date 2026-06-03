import Image from "next/image"
import { ChevronDown } from "lucide-react"

import type { PortStatus } from "@/components/hardware/types"
import { cn } from "@/lib/utils"

function sensorIcon(type: PortStatus["type"]) {
  if (type === "motor") {
    return "/SensorMotor.svg"
  }
  if (type === "force") {
    return "/SensorTouch.svg"
  }
  if (type === "color") {
    return "/SensorColor.svg"
  }
  if (type === "distance") {
    return "/SensorDistance.svg"
  }
  return undefined
}

export function PortNode({
  status,
  className,
}: {
  status: PortStatus
  className?: string
}) {
  const icon = sensorIcon(status.type)

  return (
    <div
      className={cn(
        "absolute z-10 grid min-w-24 justify-items-center gap-1 text-center",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-16 place-items-center">
          {icon ? (
            <Image
              src={icon}
              alt=""
              width={48}
              height={48}
              className="size-12 object-contain opacity-75"
            />
          ) : (
            <span className="size-11 rounded-full border border-dashed border-neutral-300 bg-neutral-50" />
          )}
        </div>
        <span className="text-sm font-semibold text-neutral-400">
          {status.port}
        </span>
      </div>
      <button
        type="button"
        className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-sm font-medium text-blue-500 transition hover:bg-blue-50"
      >
        {status.value || "-"}
        <ChevronDown className="size-4" />
      </button>
    </div>
  )
}
