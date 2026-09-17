import {assertProductionGate} from './production-contract.ts';
try{
 assertProductionGate();
 if(process.argv.includes('--production')||process.argv.includes('--diagnostic'))await import('./render.ts');
 else console.log('Current approved preview and production adapter verified. Render with --production --format landscape|portrait.');
}catch(e){console.error('PRODUCTION BLOCKED: '+(e instanceof Error?e.message:String(e)));process.exitCode=1;}
