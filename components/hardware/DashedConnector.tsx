import { cn } from "@/lib/utils"

const connectorPaths = [
  "M 18 18 H 24 C 29 18 30 22 35 22 H 40",
  "M 82 18 H 76 C 71 18 70 21 65 21 H 60",
  "M 38 28 H 30 C 25 28 24 37 19 37 H 17",
  "M 62 28 H 70 C 75 28 76 37 81 37 H 83",
  "M 18 60 H 22 C 26 60 29 57 29 53 V 41 C 29 37 32 34 36 34 H 40",
  "M 82 60 H 78 C 74 60 71 57 71 53 V 41 C 71 37 68 34 64 34 H 60",
]

export function DashedConnector({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute text-neutral-400", className)}
      viewBox="0 0 100 72.5"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {connectorPaths.map((path) => (
        <path
          key={path}
          d={path}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray="3.6 4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
