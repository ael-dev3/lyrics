import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const path=process.argv[2];assert(path);
const files=execFileSync('unzip',['-Z1',path],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split('\n');
assert(files.length>10);assert(files.every(p=>!p.startsWith('/')&&!p.split('/').includes('..')));
assert(files.every(p=>!/(node_modules|\.venv|\.git\/|codex-clipboard|Screenshot|hqBBM7ioil8\.info\.json|\.DS_Store|\.log$)/i.test(p)));
execFileSync('unzip',['-tq',path],{stdio:'inherit'});console.log('ARCHIVE_PASS',files.length);
