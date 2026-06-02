# RasPike Web Control v2

Next.js + shadcn/ui WebUI for `raspike-bridge-ps5`.

The app uses a custom Node server, so the UI and gateway run on the same port:

```text
RasPi UDP telemetry -> server.mjs -> Browser WebSocket
Browser control -> server.mjs -> RasPi TCP control
```

## Run

```bash
pnpm dev
```

Open:

```text
http://127.0.0.1:3000
```

When opening from another machine, use the PC address instead of `127.0.0.1`.

## Configuration

Set environment variables when needed:

```bash
RASPIKE_BRIDGE_HOST=<RASPI_IP_ADDRESS> pnpm dev
```

By default, the server listens on `0.0.0.0:3000`, receives telemetry on UDP
`0.0.0.0:8765`, and connects control TCP to
`RASPIKE_BRIDGE_HOST:8766`.

On the RasPi side, telemetry must point to the PC running this app:

```bash
RASPIKE_TELEMETRY_HOST=<PC_IP_ADDRESS> ./start.sh
```

Optional environment variables:

```bash
HOST=0.0.0.0
PORT=3000
TELEMETRY_HOST=0.0.0.0
TELEMETRY_PORT=8765
BRIDGE_HOST=<RASPI_IP_ADDRESS>
BRIDGE_PORT=8766
CAMERA_STREAM_URL=http://<RASPI_IP_ADDRESS>:8080/stream.mjpg
```

The camera panel uses `/camera/stream.mjpg` by default. The Web UI server
proxies that path to the RasPi Control API, using `CAMERA_STREAM_URL` when set
or `http://${BRIDGE_HOST}:8080/stream.mjpg` otherwise. This avoids relying on
the browser resolving `raspi.local`.

For production:

```bash
pnpm build
BRIDGE_HOST=<RASPI_IP_ADDRESS> pnpm start
```

`pnpm dev:next` and `pnpm start:next` are kept for running plain Next.js
without the gateway.
