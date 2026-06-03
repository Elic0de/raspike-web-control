# RasPike Web Control v2

Next.js + shadcn/ui WebUI for `raspike-bridge-ps5`.

The app uses a custom Node server, so the UI and gateway run on the same port.
By default, the app is intended to run on the remote RasPi and talk to local
services on that same host:

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

Default remote mode:

```bash
RASPIKE_TARGET=remote
pnpm dev
```

In remote mode, leave `BRIDGE_HOST` and `CAMERA_STREAM_URL` unset. The server
listens on `0.0.0.0:3000`, receives telemetry on UDP `0.0.0.0:8765`, connects
control TCP to `127.0.0.1:8766`, and proxies camera from
`http://127.0.0.1:8080/stream.mjpg`.

Optional local PC mode:

```bash
RASPIKE_TARGET=local RASPIKE_REMOTE_HOST=<RASPI_IP_ADDRESS> pnpm dev
```

In local mode, the server still listens on the PC but connects control TCP and
camera to `RASPIKE_REMOTE_HOST`.

On the RasPi side, telemetry must point to the machine running this app:

```bash
RASPIKE_TELEMETRY_HOST=<PC_IP_ADDRESS> ./start.sh
```

Optional environment variables:

```bash
HOST=0.0.0.0
PORT=3000
RASPIKE_TARGET=remote
RASPIKE_REMOTE_HOST=<RASPI_IP_ADDRESS>
TELEMETRY_HOST=0.0.0.0
TELEMETRY_PORT=8765
BRIDGE_HOST=<OVERRIDE_HOST>
BRIDGE_PORT=8766
CAMERA_STREAM_URL=http://<OVERRIDE_HOST>:8080/stream.mjpg
```

The camera panel uses `/camera/stream.mjpg` by default. The Web UI server
proxies that path to the RasPi Control API, using `CAMERA_STREAM_URL` when set
or the current target mode default otherwise. This avoids relying on the
browser resolving `raspi.local`.

For production:

```bash
pnpm build
RASPIKE_TARGET=remote pnpm start
```

`pnpm dev:next` and `pnpm start:next` are kept for running plain Next.js
without the gateway.
