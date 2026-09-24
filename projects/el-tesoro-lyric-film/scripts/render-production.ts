import {assertRenderGate} from './render-gate.ts';

// The preview is the deliverable for this stage. Any future production capture
// must call this gate before its first frame and implement renderer parity.
await assertRenderGate();
throw Error('Production renderer is not installed in this preview-only project');
