import {assertProductionGate} from './production-contract.ts';

try {
  assertProductionGate();
  console.log('Current-song synchronization and render authorization are complete.');
} catch (error) {
  console.error('PRODUCTION BLOCKED: ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
