import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const projectRootFromScriptDirectory = (scriptDirectory: string): string => {
  const normalized = resolve(scriptDirectory);
  const parent = normalized.endsWith('scripts') ? dirname(normalized) : normalized;
  return parent.endsWith('.tools-dist') ? dirname(parent) : parent;
};

export const PROJECT_ROOT = projectRootFromScriptDirectory(dirname(fileURLToPath(import.meta.url)));
