import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HardwarePort } from "@/components/hardware/types"
import { cn } from "@/lib/utils"

export function HardwarePortBar({ ports }: { ports: HardwarePort[] }) {
  return (
    <Card className="gap-0 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
      <CardContent className="px-0 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {ports.map((port, index) => (
            <div
              key={port.id}
              className="grid min-h-20 grid-cols-[1fr_auto] items-center"
            >
              <div
                className={cn(
                  "grid justify-items-center gap-1.5 px-4",
                  !port.connected && "text-neutral-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      port.connected ? "text-neutral-700" : "text-neutral-300"
                    )}
                  >
                    {port.id}
                  </span>
                  {port.icon ? (
                    <Image
                      src={port.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 object-contain opacity-70"
                    />
                  ) : (
                    <span className="size-8 rounded-full border border-dashed border-neutral-300 bg-neutral-50" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    port.connected ? "text-blue-500" : "text-neutral-300"
                  )}
                >
                  {port.active !== undefined ? (
                    <span
                      className={
                        port.active
                          ? "size-2 rounded-full bg-green-500"
                          : "size-2 rounded-full bg-red-500"
                      }
                    />
                  ) : null}
                  {port.value}
                </div>
              </div>
              {index < ports.length - 1 ? (
                <Separator
                  orientation="vertical"
                  className="hidden h-12 bg-neutral-200 lg:block"
                />
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
