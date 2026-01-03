#!/usr/bin/env bun
import { Command } from "commander";
import { Webview, SizeHint } from "webview-bun";

const program = new Command();

program
  .name("webview")
  .description("Launch a webview window")
  .argument("[url]", "URL to load", "http://localhost:3000")
  .option("-w, --width <number>", "Window width", "600")
  .option("-h, --height <number>", "Window height", "600")
  .option("-t, --title <string>", "Window title", "Webview")
  .option("-d, --debug", "Enable debug mode", false)
  .action((url, options) => {
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    const title = options.title;
    const debug = options.debug;

    if (isNaN(width) || width <= 0) {
      console.error("Error: width must be a positive number");
      process.exit(1);
    }

    if (isNaN(height) || height <= 0) {
      console.error("Error: height must be a positive number");
      process.exit(1);
    }

    // Launch webview
    console.log(`Starting webview...`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);
    console.log(`Size: ${width}x${height}`);
    console.log(`Debug: ${debug ? "enabled" : "disabled"}`);

    const webview = new Webview(debug, {
      width,
      height,
      hint: SizeHint.NONE,
    });

    webview.title = title;
    webview.navigate(url);
    webview.run();
  });

program.parse();