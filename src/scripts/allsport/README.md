# AllSport Data Parser

A real-time data parser for Daktronics AllSport CG serial TV feeds. This app reads data from the serial port, allows you to configure field mappings (which character positions correspond to which data fields), and broadcasts the parsed data via WebSocket for use in graphics overlays.

## Features

- **Serial Port Reading**: Connect to any serial port to read the AllSport TV feed
- **Configurable Line Terminator**: Support for various line terminators (CRLF, LF, CR, ETX, EOT, or custom)
- **Profile Management**: Create, edit, and save multiple profiles for different sports
- **Visual Field Mapping**: Define which character positions map to specific data keys
- **Real-time Data Monitor**: View raw incoming data with character position hints
- **Parsed Data Display**: See the extracted data fields in real-time
- **WebSocket Broadcast**: Parsed data is pushed to all connected clients
- **Object Store Integration**: Data is automatically pushed to the live data hub

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- A Daktronics AllSport CG connected via serial port

### Installation

Make sure dependencies are installed:

```bash
bun install
```

Note: The `serialport` package requires native bindings. Bun should handle this automatically.

### Running the Server

```bash
bun src/scripts/allsport/server.ts
```

The server will start on `http://localhost:3003`. Open this URL in your browser to access the configuration UI.

## Usage

### 1. Connect to Serial Port

1. Go to the **Connection** tab
2. Select your serial port from the dropdown (click ↻ to refresh)
3. Configure baud rate (typically 9600 for AllSport)
4. Click **Connect**

### 2. Create a Profile

1. Go to the **Profile** tab
2. Click **+ New Profile**
3. Enter a name and sport type
4. Select the appropriate line terminator

### 3. Configure Field Mappings

1. Go to the **Mappings** tab
2. You'll see raw data with character positions on hover
3. Click **+ Add Field** to create a mapping
4. For each field:
   - **Key**: The name of the data field (e.g., `gameClock`, `homeScore`)
   - **Start Index**: The starting character position (0-based)
   - **End Index**: The ending character position (inclusive)
   - **Description**: Optional description

5. Click **Save** to save the profile

### 4. View Parsed Data

1. Go to the **Data** tab to see parsed fields
2. Go to the **Monitor** tab to see raw incoming data

## Example: Basketball Profile

For a typical basketball feed, you might configure:

| Key | Start | End | Description |
|-----|-------|-----|-------------|
| gameClock | 0 | 5 | Game clock (MM:SS) |
| homeScore | 6 | 9 | Home team score |
| awayScore | 10 | 13 | Away team score |
| period | 14 | 15 | Current period |
| shotClock | 16 | 18 | Shot clock |
| homeFouls | 19 | 20 | Home team fouls |
| awayFouls | 21 | 22 | Away team fouls |

## Data Output

Parsed data is:

1. **Broadcast via WebSocket** to all connected UI clients
2. **Pushed to Object Store** at `https://live-data.dragonstv.io/set` with key `allsport-data`

The data format is:

```json
{
  "raw": "12:34 045 038 2 24 03 02",
  "timestamp": "2024-01-15T18:30:00.000Z",
  "fields": {
    "gameClock": "12:34",
    "homeScore": "045",
    "awayScore": "038",
    "period": "2",
    "shotClock": "24",
    "homeFouls": "03",
    "awayFouls": "02"
  }
}
```

## Technical Details

- **Framework**: Bun runtime with React and Tailwind CSS
- **Serial Port**: Uses the `serialport` npm package
- **WebSocket**: Real-time bidirectional communication
- **Storage**: Profiles are saved to `allsport-profiles.json`
- **Port**: Runs on port 3003 by default

## Line Terminators

AllSport feeds may use different line terminators depending on configuration:

| Terminator | Escape Sequence | Description |
|------------|-----------------|-------------|
| CRLF | `\r\n` | Most common (Windows-style) |
| LF | `\n` | Unix-style |
| CR | `\r` | Old Mac-style |
| ETX | `\x03` | End of Text control character |
| EOT | `\x04` | End of Transmission |

## Troubleshooting

### No serial ports found
- Make sure your AllSport is connected and powered on
- Check that you have the necessary drivers installed
- On Linux, you may need to add your user to the `dialout` group

### Data appears garbled
- Verify the baud rate matches your AllSport configuration
- Check data bits, stop bits, and parity settings
- Make sure the line terminator is correct

### Connection drops frequently
- Check your cable connections
- Try a different USB port
- Verify the AllSport is continuously transmitting

## File Structure

```
src/scripts/allsport/
├── server.ts       # Main server with serial port and WebSocket
├── frontend.tsx    # React UI for configuration
├── index.html      # HTML entry point
├── types.ts        # TypeScript type definitions
└── README.md       # This file
```
