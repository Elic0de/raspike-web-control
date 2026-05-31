import type { NextConfig } from "next"

const extraDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", ...extraDevOrigins],
}

export default nextConfig
