import tailwind from "bun-plugin-tailwind"
import { rm } from 'node:fs/promises'

const outDir = "./build-controls";

await rm(outDir, {
  recursive: true,
  force: true
})

const CONTROLS = [
  'text-slider',
  'wrestling'
]

CONTROLS.forEach(async controlName => {
  console.log(`Building ${controlName}...`);
  await Bun.build({
    plugins: [tailwind],
    outdir: `build-controls/${controlName}`,
    entrypoints: [`src/controls/${controlName}/index.html`],
    target: "browser",
    sourcemap: "linked",
    minify: true
  })
});