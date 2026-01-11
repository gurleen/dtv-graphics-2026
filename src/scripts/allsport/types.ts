/**
 * Allsport Data Types
 * Types for parsing and processing Daktronics AllSport CG serial data
 */

/**
 * A field mapping defines which character positions in the input line
 * correspond to a specific data field
 */
export interface FieldMapping {
  id: string;
  key: string;
  startIndex: number;
  endIndex: number;
  description?: string;
}

/**
 * A profile is a collection of field mappings for a specific sport
 */
export interface Profile {
  id: string;
  name: string;
  sport: string;
  lineTerminator: string;
  fields: FieldMapping[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parsed data from a single line of input
 */
export interface ParsedData {
  raw: string;
  timestamp: string;
  fields: Record<string, string>;
}

/**
 * Serial port configuration
 */
export interface SerialConfig {
  port: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
}

/**
 * Connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * WebSocket message types from server to client
 */
export type ServerMessage =
  | { type: 'connection_status'; status: ConnectionStatus; port?: string; error?: string }
  | { type: 'data_update'; data: ParsedData }
  | { type: 'raw_data'; line: string; timestamp: string }
  | { type: 'profiles_list'; profiles: Profile[] }
  | { type: 'profile_loaded'; profile: Profile }
  | { type: 'available_ports'; ports: string[] }
  | { type: 'error'; message: string };

/**
 * WebSocket message types from client to server
 */
export type ClientMessage =
  | { type: 'connect'; config: SerialConfig }
  | { type: 'disconnect' }
  | { type: 'set_profile'; profile: Profile }
  | { type: 'save_profile'; profile: Profile }
  | { type: 'delete_profile'; profileId: string }
  | { type: 'list_profiles' }
  | { type: 'list_ports' }
  | { type: 'set_line_terminator'; terminator: string };

/**
 * Default basketball profile as an example
 */
export const DEFAULT_BASKETBALL_PROFILE: Profile = {
  id: 'basketball-default',
  name: 'Basketball (Default)',
  sport: 'basketball',
  lineTerminator: '\\r\\n',
  fields: [
    { id: '1', key: 'gameClock', startIndex: 0, endIndex: 5, description: 'Game clock (MM:SS)' },
    { id: '2', key: 'homeScore', startIndex: 6, endIndex: 9, description: 'Home team score' },
    { id: '3', key: 'awayScore', startIndex: 10, endIndex: 13, description: 'Away team score' },
    { id: '4', key: 'period', startIndex: 14, endIndex: 15, description: 'Current period' },
    { id: '5', key: 'shotClock', startIndex: 16, endIndex: 18, description: 'Shot clock' },
    { id: '6', key: 'homeFouls', startIndex: 19, endIndex: 20, description: 'Home team fouls' },
    { id: '7', key: 'awayFouls', startIndex: 21, endIndex: 22, description: 'Away team fouls' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Common line terminators
 */
export const LINE_TERMINATORS = [
  { value: '\\r\\n', label: 'CRLF (\\r\\n)' },
  { value: '\\n', label: 'LF (\\n)' },
  { value: '\\r', label: 'CR (\\r)' },
  { value: '\\x03', label: 'ETX (0x03)' },
  { value: '\\x04', label: 'EOT (0x04)' },
] as const;

/**
 * Common baud rates
 */
export const BAUD_RATES = [
  300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200
] as const;

/**
 * Convert escaped line terminator string to actual characters
 */
export function parseLineTerminator(terminator: string): string {
  return terminator
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Convert actual characters to escaped string for display
 */
export function escapeLineTerminator(terminator: string): string {
  return terminator
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/[\x00-\x1F]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`);
}
