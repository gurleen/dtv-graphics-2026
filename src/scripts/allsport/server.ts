import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import indexHtml from './index.html';
import type {
  Profile,
  ParsedData,
  SerialConfig,
  ClientMessage,
  ServerMessage,
  ConnectionStatus,
} from './types';
import { parseLineTerminator, DEFAULT_BASKETBALL_PROFILE } from './types';

const ObjectStoreSetUrl = 'https://live-data.dragonstv.io/set';
const PROFILES_FILE = './allsport-profiles.json';

interface Client {
  ws: any;
}

// State
const clients = new Set<Client>();
let serialPort: SerialPort | null = null;
let currentProfile: Profile | null = null;
let connectionStatus: ConnectionStatus = 'disconnected';
let profiles: Profile[] = [];
let lastRawLine: string = '';
let lastParsedData: ParsedData | null = null;

/**
 * Load profiles from disk
 */
async function loadProfiles(): Promise<void> {
  try {
    const file = Bun.file(PROFILES_FILE);
    if (await file.exists()) {
      profiles = await file.json();
      console.log(`Loaded ${profiles.length} profiles from disk`);
    } else {
      // Initialize with default basketball profile
      profiles = [DEFAULT_BASKETBALL_PROFILE];
      await saveProfilesToDisk();
      console.log('Created default profiles file');
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
    profiles = [DEFAULT_BASKETBALL_PROFILE];
  }
}

/**
 * Save profiles to disk
 */
async function saveProfilesToDisk(): Promise<void> {
  try {
    await Bun.write(PROFILES_FILE, JSON.stringify(profiles, null, 2));
    console.log(`Saved ${profiles.length} profiles to disk`);
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

/**
 * Broadcast a message to all connected WebSocket clients
 */
function broadcastToClients(message: ServerMessage): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    try {
      client.ws.send(messageStr);
    } catch (error) {
      console.error('Error sending to client:', error);
      clients.delete(client);
    }
  });
}

/**
 * Parse a line of data using the current profile's field mappings
 */
function parseLine(line: string): ParsedData {
  const fields: Record<string, string> = {};

  if (currentProfile) {
    for (const field of currentProfile.fields) {
      const value = line.substring(field.startIndex, field.endIndex + 1).trim();
      fields[field.key] = value;
    }
  }

  return {
    raw: line,
    timestamp: new Date().toISOString(),
    fields,
  };
}

/**
 * Push parsed data to the object store for graphics consumption
 */
async function pushDataToObjectStore(data: ParsedData): Promise<void> {
  try {
    await fetch(ObjectStoreSetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'allsport-data', value: data }),
    });
  } catch (error) {
    console.error('Error pushing to object store:', error);
  }
}

/**
 * Handle incoming serial data
 */
function handleSerialData(line: string): void {
  lastRawLine = line;
  const timestamp = new Date().toISOString();

  console.log(`[${new Date().toLocaleTimeString()}] Received: ${line}`);

  // Broadcast raw data
  broadcastToClients({
    type: 'raw_data',
    line,
    timestamp,
  });

  // Parse and broadcast parsed data
  const parsedData = parseLine(line);
  lastParsedData = parsedData;

  broadcastToClients({
    type: 'data_update',
    data: parsedData,
  });

  // Push to object store
  pushDataToObjectStore(parsedData);
}

/**
 * List available serial ports
 */
async function listSerialPorts(): Promise<string[]> {
  try {
    const ports = await SerialPort.list();
    return ports.map((p) => p.path);
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
}

/**
 * Connect to a serial port
 */
async function connectToSerialPort(config: SerialConfig): Promise<void> {
  // Disconnect if already connected
  if (serialPort && serialPort.isOpen) {
    await disconnectSerialPort();
  }

  connectionStatus = 'connecting';
  broadcastToClients({
    type: 'connection_status',
    status: 'connecting',
    port: config.port,
  });

  try {
    serialPort = new SerialPort({
      path: config.port,
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity,
      autoOpen: false,
    });

    // Set up the line parser with the configured terminator
    const terminator = currentProfile
      ? parseLineTerminator(currentProfile.lineTerminator)
      : '\r\n';

    const parser = serialPort.pipe(
      new ReadlineParser({ delimiter: terminator })
    );

    parser.on('data', handleSerialData);

    serialPort.on('error', (error) => {
      console.error('Serial port error:', error);
      connectionStatus = 'error';
      broadcastToClients({
        type: 'connection_status',
        status: 'error',
        error: error.message,
      });
    });

    serialPort.on('close', () => {
      console.log('Serial port closed');
      connectionStatus = 'disconnected';
      broadcastToClients({
        type: 'connection_status',
        status: 'disconnected',
      });
    });

    // Open the port
    await new Promise<void>((resolve, reject) => {
      serialPort!.open((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    connectionStatus = 'connected';
    broadcastToClients({
      type: 'connection_status',
      status: 'connected',
      port: config.port,
    });

    console.log(`Connected to serial port: ${config.port} at ${config.baudRate} baud`);
  } catch (error: any) {
    console.error('Failed to connect to serial port:', error);
    connectionStatus = 'error';
    broadcastToClients({
      type: 'connection_status',
      status: 'error',
      error: error.message || 'Unknown error',
    });
    throw error;
  }
}

/**
 * Disconnect from the serial port
 */
async function disconnectSerialPort(): Promise<void> {
  if (serialPort && serialPort.isOpen) {
    await new Promise<void>((resolve, reject) => {
      serialPort!.close((error) => {
        if (error) {
          console.error('Error closing serial port:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  serialPort = null;
  connectionStatus = 'disconnected';
  broadcastToClients({
    type: 'connection_status',
    status: 'disconnected',
  });

  console.log('Disconnected from serial port');
}

/**
 * Save or update a profile
 */
async function saveProfile(profile: Profile): Promise<void> {
  const index = profiles.findIndex((p) => p.id === profile.id);
  profile.updatedAt = new Date().toISOString();

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profile.createdAt = new Date().toISOString();
    profiles.push(profile);
  }

  await saveProfilesToDisk();
  broadcastToClients({ type: 'profiles_list', profiles });
}

/**
 * Delete a profile
 */
async function deleteProfile(profileId: string): Promise<void> {
  profiles = profiles.filter((p) => p.id !== profileId);
  await saveProfilesToDisk();
  broadcastToClients({ type: 'profiles_list', profiles });
}

/**
 * Handle WebSocket messages from clients
 */
async function handleClientMessage(ws: any, message: ClientMessage): Promise<void> {
  try {
    switch (message.type) {
      case 'connect':
        await connectToSerialPort(message.config);
        break;

      case 'disconnect':
        await disconnectSerialPort();
        break;

      case 'set_profile':
        currentProfile = message.profile;
        broadcastToClients({ type: 'profile_loaded', profile: message.profile });
        console.log(`Profile set: ${message.profile.name}`);
        break;

      case 'save_profile':
        await saveProfile(message.profile);
        break;

      case 'delete_profile':
        await deleteProfile(message.profileId);
        break;

      case 'list_profiles':
        ws.send(JSON.stringify({ type: 'profiles_list', profiles }));
        break;

      case 'list_ports':
        const ports = await listSerialPorts();
        ws.send(JSON.stringify({ type: 'available_ports', ports }));
        break;

      case 'set_line_terminator':
        if (currentProfile) {
          currentProfile.lineTerminator = message.terminator;
          broadcastToClients({ type: 'profile_loaded', profile: currentProfile });
        }
        break;

      default:
        console.log('Unknown message type:', (message as any).type);
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: error.message || 'Unknown error',
      })
    );
  }
}

// Initialize profiles on startup
await loadProfiles();

// Start the server
const server = Bun.serve({
  port: 3003,
  routes: {
    '/': indexHtml,
  },
  async fetch(req, server) {
    // Upgrade WebSocket connections
    if (server.upgrade(req)) {
      return undefined;
    }

    return new Response('Not found', { status: 404 });
  },
  websocket: {
    open: (ws) => {
      const client: Client = { ws };
      clients.add(client);
      console.log('Client connected. Total clients:', clients.size);

      // Send current status to new client
      ws.send(
        JSON.stringify({
          type: 'connection_status',
          status: connectionStatus,
        })
      );

      // Send profiles list
      ws.send(JSON.stringify({ type: 'profiles_list', profiles }));

      // Send current profile if set
      if (currentProfile) {
        ws.send(JSON.stringify({ type: 'profile_loaded', profile: currentProfile }));
      }

      // Send last parsed data if available
      if (lastParsedData) {
        ws.send(JSON.stringify({ type: 'data_update', data: lastParsedData }));
      }

      // Send last raw line if available
      if (lastRawLine) {
        ws.send(
          JSON.stringify({
            type: 'raw_data',
            line: lastRawLine,
            timestamp: lastParsedData?.timestamp || new Date().toISOString(),
          })
        );
      }
    },
    message: async (ws, message) => {
      try {
        const data = JSON.parse(message as string) as ClientMessage;
        await handleClientMessage(ws, data);
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
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
      console.log('Client disconnected. Total clients:', clients.size);
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`AllSport Data Server running at http://localhost:${server.port}`);
