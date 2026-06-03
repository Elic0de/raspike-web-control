import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionButton } from "@/components/hardware/types"

export function ActionsCard({ actions }: { actions: ActionButton[] }) {
  return (
    <Card className="gap-3 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
          <Zap className="size-5 text-blue-500" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 px-4 pb-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-20 flex-col rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
              onClick={action.onClick}
            >
              <Icon className="size-5" />
              <span className="text-xs font-semibold text-neutral-500">
                {action.label}
              </span>
              <span className="text-sm font-semibold">{action.detail}</span>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
