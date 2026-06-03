import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone = "ok" | "waiting" | "neutral" | "danger"

const toneClass: Record<StatusTone, string> = {
  ok: "border-green-200 bg-green-50 text-green-700",
  waiting: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-neutral-200 bg-white text-neutral-600",
  danger: "border-red-200 bg-red-50 text-red-600",
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: StatusTone
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 rounded-full px-3 text-xs font-medium shadow-none",
        toneClass[tone],
        className
      )}
    >
      {children}
    </Badge>
  )
}
