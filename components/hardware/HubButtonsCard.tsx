import { ChevronLeft, ChevronRight, CircleDot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HubButtonsCard({
  onLeft,
  onCenter,
  onRight,
}: {
  onLeft: () => void
  onCenter: () => void
  onRight: () => void
}) {
  return (
    <Card className="gap-3 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
          <CircleDot className="size-5 text-blue-500" />
          Hub buttons
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 px-4 pb-4">
        <Button
          variant="outline"
          className="h-10 rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          onClick={onLeft}
        >
          <ChevronLeft className="size-4" />
          Left
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          onClick={onCenter}
        >
          <CircleDot className="size-4" />
          Center
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          onClick={onRight}
        >
          Right
          <ChevronRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
