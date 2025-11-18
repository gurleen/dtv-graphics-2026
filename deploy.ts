import { $ } from "bun";

const BUILD_DIR = 'build'
const REMOTE_USER = 'gsingh';
const REMOTE_HOST = '198.74.57.54';
const REMOTE_DIR = '/home/gsingh/SPX-GC/ASSETS/templates/dtv-graphics-2026'

await $`scp -r ${BUILD_DIR}/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}`