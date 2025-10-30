import tailwind from "bun-plugin-tailwind"
import { rm } from 'node:fs/promises'

const outDir = "./build";

await rm(outDir, {
  recursive: true,
  force: true
})

const GRAPHICS = [
  '0_lower_third',
  '1_basketball_scorebug',
  '2_score_to_break',
  '3_matchup',
  '4_starting_lineups_lower'
]

GRAPHICS.forEach(async graphicName => {
  await Bun.build({
    plugins: [tailwind],
    outdir: `build/${graphicName}`,
    entrypoints: [`src/graphics/${graphicName}/${graphicName}.html`],
    target: "browser",
    sourcemap: "linked",
    minify: true
  })
});