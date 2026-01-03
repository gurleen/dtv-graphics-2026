# StatCrew XML Watcher

A real-time basketball statistics viewer that watches NCAA StatCrew XML files and displays live player statistics in a native webview window.

## Features

- Real-time file watching for NCAA StatCrew XML files
- Live statistics updates via WebSocket
- Tabbed interface for Settings, Visitor Team, and Home Team
- Compact UI optimized for small windows (700x450)
- Team totals calculation
- Color-coded statistics (points, fouls, turnovers)
- Native webview window (no browser required)

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime installed

### Running in Development

**Option 1: Use the launcher (recommended)**
```bash
# Run the launcher (will start server and open webview window)
bun src/scripts/statcrew/launcher.ts
```

**Option 2: Run server and webview separately**
```bash
# Terminal 1 - Start the server
bun src/scripts/statcrew/server.ts

# Terminal 2 - Open the webview
bun src/scripts/statcrew/webview.ts 3000
```

The application will:
1. Start a web server on port 3000
2. Open a webview window automatically
3. Connect to the server via WebSocket
4. Display the settings panel where you can configure the XML file path

### Project Structure

- `launcher.ts` - Main entry point that spawns server and webview processes (for development)
- `app.ts` - Single-file application for compiled executables
- `server.ts` - Web server with WebSocket support and static file serving
- `webview.ts` - Webview window configuration (runs as separate process)
- `frontend.tsx` - React UI with Tailwind CSS
- `index.html` - HTML entry point
- `statcrew-xml.ts` - XML parser and file watcher
- `build.ts` - Build script for creating platform-specific executables

## Building Executables

To build standalone executables for macOS and Windows:

```bash
bun src/scripts/statcrew/build.ts
```

This will create executables in `src/scripts/statcrew/dist/`:
- `statcrew-darwin-x64` - macOS Intel
- `statcrew-darwin-arm64` - macOS Apple Silicon
- `statcrew-windows-x64.exe` - Windows 64-bit

### Running the Executables

**macOS:**
```bash
./dist/statcrew-darwin-arm64
```

**Windows:**
```cmd
.\dist\statcrew-windows-x64.exe
```

The executable includes everything needed to run the application - no additional dependencies required.

**Note:** Due to webview blocking limitations, the compiled executable currently runs the server and webview in a single process. For the best experience during development, use the launcher which runs them in separate processes. A future update may resolve this for compiled builds.

## Usage

1. Launch the application (either via `bun server.ts` or the executable)
2. A webview window will open automatically
3. In the Settings tab:
   - Enter the path to your StatCrew XML file
   - Click "Start Watching" to begin monitoring the file
4. Switch to the Visitor or Home team tabs to view live statistics
5. Stats will update automatically when the XML file changes

## Features Detail

### Statistics Tracked

Per player:
- Points (PTS)
- Field Goals (FG, FG%)
- 3-Pointers (3PT, 3P%)
- Free Throws (FT, FT%)
- Rebounds (REB, OREB, DREB)
- Assists (AST)
- Steals (STL)
- Blocks (BLK)
- Turnovers (TO)
- Personal Fouls (PF)
- Minutes (MIN)

### Team Totals

Automatically calculated and displayed at the bottom of each team's statistics table.

## Technical Details

- **Framework:** Bun runtime with React and Tailwind CSS
- **WebSocket:** Real-time bidirectional communication
- **File Watching:** Node.js `fs.watch()` API
- **XML Parsing:** `xml2js` library
- **UI:** Compact design with Berkeley Mono font
- **Window Size:** 700x450 pixels
- **Process Management:** Server and webview run in separate processes
