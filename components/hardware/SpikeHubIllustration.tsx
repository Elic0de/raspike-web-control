import Image from "next/image"

export function SpikeHubIllustration() {
  return (
    <div className="relative h-[400px] w-[280px] drop-shadow-[0_24px_45px_rgb(15_23_42/0.16)]">
      <Image
        src="/hub-spike-bluetooth-hardware-page.9d0a04be.png"
        alt="SPIKE Prime hub"
        width={450}
        height={510}
        priority
        className="h-full w-full object-contain"
      />
    </div>
  )
}
