import { watch, type FSWatcher } from "node:fs";
import { parseXmlFile, getStats, resetStats } from "./statcrew-xml";
import indexHtml from "./index.html";
import type { GameLiveStats } from "@/types/basketball";

const ObjectStoreSetUrl = "https://live-data.dragonstv.io/set";

interface Client {
  ws: any;
}

const clients = new Set<Client>();
let fileWatcher: FSWatcher | null = null;
let currentFilePath: string | null = null;
let isWatching = false;

function broadcastToClients(message: any) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    try {
      client.ws.send(messageStr);
    } catch (error) {
      console.error("Error sending to client:", error);
      clients.delete(client);
    }
  });
}

async function pushToObjectStore(stats: GameLiveStats) {
  const req = await fetch(ObjectStoreSetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ key: "basketball-live-stats", value: stats })
  });
}

async function startWatching(filePath: string) {
  if (fileWatcher) {
    stopWatching();
  }

  currentFilePath = filePath;
  isWatching = true;

  // Parse initial file
  try {
    await parseXmlFile(filePath);
    const stats = getStats();
    await pushToObjectStore(stats);
    broadcastToClients({
      type: "stats_update",
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    broadcastToClients({
      type: "error",
      message: `Error parsing file: ${error}`,
    });
    isWatching = false;
    return;
  }

  // Start watching
  fileWatcher = watch(filePath, async (eventType) => {
    if (eventType === "change") {
      console.log(`[${new Date().toLocaleTimeString()}] File changed, re-parsing...`);

      try {
        const changes = await parseXmlFile(filePath);
        const stats = getStats();

        await pushToObjectStore(stats);

        broadcastToClients({
          type: "stats_update",
          data: stats,
          changes,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        broadcastToClients({
          type: "error",
          message: `Error parsing file: ${error}`,
        });
      }
    }
  });

  broadcastToClients({
    type: "watcher_status",
    isWatching: true,
    filePath,
  });

  console.log(`Started watching: ${filePath}`);
}

function stopWatching() {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  isWatching = false;
  currentFilePath = null;

  broadcastToClients({
    type: "watcher_status",
    isWatching: false,
    filePath: null,
  });

  console.log("Stopped watching");
}

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": indexHtml,
  },
  async fetch(req, server) {
    // Upgrade WebSocket connections
    if (server.upgrade(req)) {
      return undefined; // WebSocket upgrade successful
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open: (ws) => {
      const client: Client = { ws };
      clients.add(client);
      console.log("Client connected. Total clients:", clients.size);

      // Send current status to new client
      ws.send(
        JSON.stringify({
          type: "watcher_status",
          isWatching,
          filePath: currentFilePath,
        })
      );

      // Send current stats if available
      if (isWatching) {
        const stats = getStats();
        ws.send(
          JSON.stringify({
            type: "stats_update",
            data: stats,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    message: async (ws, message) => {
      try {
        const data = JSON.parse(message as string);

        switch (data.type) {
          case "start_watching":
            if (data.filePath) {
              await startWatching(data.filePath);
            }
            break;

          case "stop_watching":
            stopWatching();
            break;

          case "reset_stats":
            resetStats();
            broadcastToClients({
              type: "stats_update",
              data: getStats(),
              timestamp: new Date().toISOString(),
            });
            break;

          case "get_stats":
            ws.send(
              JSON.stringify({
                type: "stats_update",
                data: getStats(),
                timestamp: new Date().toISOString(),
              })
            );
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Error: ${error}`,
          })
        );
      }
    },
    close: (ws) => {
      const client = Array.from(clients).find((c) => c.ws === ws);
      if (client) {
        clients.delete(client);
      }
      console.log("Client disconnected. Total clients:", clients.size);
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at http://localhost:${server.port}`);