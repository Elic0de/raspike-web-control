import { createServer } from "node:http"
import dgram from "node:dgram"
import net from "node:net"
import next from "next"
import { WebSocketServer, WebSocket } from "ws"

const host = process.env.HOST || process.env.RASPIKE_WEBUI_HOST || "0.0.0.0"
const port = Number.parseInt(process.env.PORT || "3000", 10)
const telemetryHost =
  process.env.TELEMETRY_HOST ||
  process.env.RASPIKE_TELEMETRY_LISTEN_HOST ||
  "0.0.0.0"
const telemetryPort = Number.parseInt(
  process.env.TELEMETRY_PORT || process.env.RASPIKE_TELEMETRY_PORT || "8765",
  10
)
const bridgeHost =
  process.env.BRIDGE_HOST ||
  process.env.RASPIKE_BRIDGE_HOST ||
  process.env.RASPIKE_HOST ||
  "127.0.0.1"
const bridgePort = Number.parseInt(
  process.env.BRIDGE_PORT || process.env.RASPIKE_WEB_CONTROL_PORT || "8766",
  10
)
const bridgeRetrySec = Number.parseFloat(process.env.BRIDGE_RETRY_SEC || "1")
const dev = process.env.NODE_ENV !== "production"

class Gateway {
  constructor() {
    this.clients = new Set()
    this.latestTelemetry = null
    this.telemetryCount = 0
    this.lastTelemetryAt = 0
    this.lastTelemetryPeer = null
    this.bridge = null
    this.bridgeConnecting = false
    this.nextBridgeRetryAt = 0
    this.lastControlLog = ""
    this.lastTelemetryBroadcastAt = 0

    this.udp = dgram.createSocket("udp4")
    this.udp.on("message", (data, rinfo) => this.readTelemetry(data, rinfo))
    this.udp.on("error", (error) => {
      console.error(`telemetry udp error: ${error.message}`)
    })
  }

  listen() {
    this.udp.bind(telemetryPort, telemetryHost, () => {
      console.log(`telemetry udp <- ${telemetryHost}:${telemetryPort}`)
    })

    this.statusTimer = setInterval(() => {
      this.ensureBridgeConnected()
      this.broadcastStatus()
    }, 1000)
  }

  close() {
    clearInterval(this.statusTimer)
    for (const client of this.clients) {
      client.close()
    }
    this.udp.close()
    this.bridge?.destroy()
  }

  addClient(ws) {
    this.clients.add(ws)
    ws.on("message", (data) => this.sendBridge(data.toString("utf8")))
    ws.on("close", () => this.clients.delete(ws))
    ws.on("error", () => this.clients.delete(ws))

    if (this.latestTelemetry) {
      this.send(ws, { type: "telemetry", payload: this.latestTelemetry })
    }
    this.sendStatus(ws)
  }

  readTelemetry(data, rinfo) {
    try {
      this.latestTelemetry = JSON.parse(data.toString("utf8"))
      this.telemetryCount += 1
      this.lastTelemetryAt = Date.now()
      const peer = `${rinfo.address}:${rinfo.port}`
      if (this.lastTelemetryPeer !== peer) {
        this.lastTelemetryPeer = peer
        console.log(`telemetry received from ${peer}`)
      }

      const now = Date.now()
      if (now - this.lastTelemetryBroadcastAt >= 50) {
        this.broadcast({ type: "telemetry", payload: this.latestTelemetry })
        this.lastTelemetryBroadcastAt = now
      }
    } catch {
      // Ignore malformed telemetry datagrams.
    }
  }

  ensureBridgeConnected() {
    if (
      this.bridge ||
      this.bridgeConnecting ||
      Date.now() < this.nextBridgeRetryAt
    ) {
      return
    }

    this.bridgeConnecting = true
    const sock = net.createConnection(
      { host: bridgeHost, port: bridgePort },
      () => {
        this.bridge = sock
        this.bridgeConnecting = false
        console.log(`control connected: ${bridgeHost}:${bridgePort}`)
        this.broadcastStatus()
      }
    )

    sock.setNoDelay(true)
    sock.on("error", () => {
      this.bridgeConnecting = false
      this.nextBridgeRetryAt = Date.now() + bridgeRetrySec * 1000
    })
    sock.on("close", () => {
      if (this.bridge === sock) {
        this.bridge = null
      }
      this.bridgeConnecting = false
      this.nextBridgeRetryAt = Date.now() + bridgeRetrySec * 1000
      this.broadcastStatus()
    })
  }

  sendBridge(message) {
    let payload
    try {
      payload = JSON.parse(message)
    } catch {
      return
    }

    if (!this.bridge) {
      this.ensureBridgeConnected()
    }
    if (!this.bridge) {
      return
    }

    this.bridge.write(`${message}\n`, "utf8", (error) => {
      if (error) {
        this.bridge?.destroy()
        this.bridge = null
        this.nextBridgeRetryAt = Date.now() + bridgeRetrySec * 1000
      }
    })
    this.logControl(payload)
  }

  logControl(payload) {
    let summary = ""
    if (payload.type === "drive") {
      const throttle = payload.throttle ?? 0
      const steering = payload.steering ?? 0
      const arm = payload.arm ?? 0
      if (![throttle, steering, arm].some((value) => Math.abs(value) > 0.01)) {
        return
      }
      summary = `drive throttle=${throttle} steering=${steering} arm=${arm}`
    } else if (payload.type === "enable") {
      summary = `enable=${payload.enabled}`
    } else if (payload.type === "action") {
      summary = `action=${payload.action}`
    }

    if (summary && summary !== this.lastControlLog) {
      console.log(`control forwarded: ${summary}`)
      this.lastControlLog = summary
    }
  }

  broadcastStatus() {
    this.broadcast(this.statusPayload())
  }

  sendStatus(ws) {
    this.send(ws, this.statusPayload())
  }

  statusPayload() {
    const telemetryAgeSec =
      this.lastTelemetryAt === 0
        ? null
        : Math.round(((Date.now() - this.lastTelemetryAt) / 1000) * 1000) / 1000

    return {
      type: "gateway_status",
      payload: {
        control_connected: Boolean(this.bridge),
        telemetry_count: this.telemetryCount,
        telemetry_age_sec: telemetryAgeSec,
        telemetry_peer: this.lastTelemetryPeer,
      },
    }
  }

  broadcast(payload) {
    for (const client of this.clients) {
      this.send(client, payload)
    }
  }

  send(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }
}

const app = next({ dev, hostname: host, port })
const handle = app.getRequestHandler()
const gateway = new Gateway()

await app.prepare()

const server = createServer((req, res) => {
  handle(req, res)
})
const wss = new WebSocketServer({ noServer: true })

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      gateway.addClient(ws)
    })
    return
  }

  socket.destroy()
})

server.listen(port, host, () => {
  gateway.listen()
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host
  console.log(`WebUI: http://${displayHost}:${port}`)
  console.log(`control tcp -> ${bridgeHost}:${bridgePort}`)
})

const shutdown = () => {
  gateway.close()
  wss.close()
  server.close(() => process.exit(0))
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
