import {basename, resolve} from 'node:path';

export const projectRootFromScriptDirectory = (
  scriptDirectory: string,
): string => {
  const parent = resolve(scriptDirectory, '..');
  return basename(parent) === '.tools-dist' ? resolve(parent, '..') : parent;
};
