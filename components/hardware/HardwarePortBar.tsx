import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HardwarePort } from "@/components/hardware/types"

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
              <div className="grid justify-items-center gap-1.5 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-neutral-700">
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
                <div className="flex items-center gap-1.5 text-sm font-medium text-blue-500">
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
