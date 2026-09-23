import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
export const canvasApi=require(process.env.CANVAS_MODULE_PATH||'@napi-rs/canvas');
