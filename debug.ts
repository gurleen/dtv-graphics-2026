import { readdir, readdirSync } from "fs";
import { $ } from "bun";


const graphicsDirectory = "./src/graphics";
const graphicIndex = Bun.argv[2];
const graphicPath = readdirSync(graphicsDirectory).find(x => x.startsWith(`${graphicIndex}_`));

await $`bun --watch run ${graphicsDirectory}/${graphicPath}/${graphicPath}.html`;