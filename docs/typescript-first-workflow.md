# TypeScript-first workflow

## Policy

All authored application, analysis, rendering, and reusable component code in this repository uses TypeScript. React and Remotion components use `.tsx`; non-JSX modules use `.ts`. New `.js` or `.jsx` source files are not accepted.

This policy applies to the current Tanisea project and every future lyric-film workflow. JSON manifests, Markdown documentation, shell commands, shader source, generated bundles, and third-party dependencies keep their native formats; they are not substitutes for authored TypeScript modules.

## Stable compiler baseline

On 2026-08-30, the npm registry's stable `latest` tag resolves to **TypeScript `7.0.2`**. The project pins that exact version in both `package.json` and `package-lock.json`. Beta, release-candidate, `next`, and nightly channels are excluded from production unless a separate experiment explicitly records the reason and never changes the release lock.

“Use the latest TypeScript” means:

1. inspect the registry's stable tags at the start of a project or planned toolchain upgrade;
2. read the applicable official release notes and migration guidance;
3. install the stable release exactly, not from a floating global compiler;
4. regenerate and commit the lockfile;
5. pass the full type, composition, fixture, and render checks before adopting it.

```sh
npm view typescript version dist-tags --json
npm install --save-dev --save-exact typescript@latest
npm exec tsc -- --version
```

Never use `next`, `beta`, or `rc` merely because its version number is higher. Never rely on a globally installed `tsc`; all local and CI checks run the compiler frozen by the lockfile.

## Required project structure

```text
src/
  index.ts
  Root.tsx
  LyricFilm.tsx
  timed-lyrics.ts
tsconfig.json
package.json
package-lock.json
```

File rules:

- `.tsx` only when the module contains JSX;
- `.ts` for cue maps, schemas, audio-analysis code, motion-envelope generators, validation, and utilities;
- `import type` for type-only dependencies;
- stable exported types for lyrics, cue events, analysis frames, motion frames, manifests, and component props;
- no implicit `any`, unbounded casts, `@ts-ignore`, or non-null assertions used to hide uncertain data;
- external JSON is `unknown` until validated at runtime; a TypeScript type alone does not validate imported or generated data;
- historical data kept for provenance is clearly named and typed so it cannot be mistaken for the production source of truth.

## Strict compiler contract

Every project starts with strict checking and no JavaScript fallback:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Do not weaken these checks to make a migration pass. Fix the uncertain boundary, narrow the value, or add a real schema. `skipLibCheck` applies only to third-party declaration files; it does not relax authored source.

## Typed production data

Timing and motion files are executable production data, so they need explicit contracts:

```ts
export type LyricCue = Readonly<{
  text: string;
  start: number;
  end: number;
}>;

export type LyricLine = Readonly<{
  id: string;
  vocalStart: number;
  vocalEnd: number;
  cues: readonly LyricCue[];
}>;

export const line = {
  id: 'V1-01',
  vocalStart: 64.06,
  vocalEnd: 67,
  cues: [{text: 'Night', start: 64.06, end: 64.83}],
} satisfies LyricLine;
```

Use `satisfies` when an object should be checked without discarding useful literal types. Prefer discriminated unions for section-specific states and branded or schema-validated identifiers where mixing milliseconds, seconds, samples, frames, or pixels would be dangerous.

## Required commands

Each project exposes the same minimum scripts:

```json
{
  "scripts": {
    "compositions": "remotion compositions src/index.ts",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run compositions",
    "prerender": "npm run typecheck"
  }
}
```

Run from a clean dependency install:

```sh
npm ci
npm run check
```

The typecheck is a blocking pre-render gate, not an optional editor convenience. Scientific fixtures, timing validators, deterministic render checks, and codec QA remain additional gates; successful compilation does not prove that lyrics are correct or visuals are synchronized.

## Upgrade procedure

When the stable `latest` tag changes:

1. record the previous and proposed compiler versions;
2. review official TypeScript release and breaking-change notes;
3. install the proposed stable version with `--save-exact`;
4. run `npm ci` from the regenerated lockfile in a clean environment;
5. run `npm run typecheck` and the composition-discovery check;
6. run timing, audio-analysis, motion-envelope, and deterministic fixture suites;
7. render representative intro, verse, chorus, analyzer, and outro windows;
8. compare those frames and clips against the frozen references;
9. adopt the upgrade only when every blocking gate passes;
10. record the compiler, Node.js, package-manager, Remotion, and lockfile identity in the release manifest.

An upgrade is deliberate even when the compiler is “latest.” Exact pins keep an older release reproducible; planned checks decide when the repository moves forward.

## Current migration record

The Tanisea source was migrated in place on 2026-08-30:

| Before | TypeScript source |
| --- | --- |
| `src/index.jsx` | `src/index.ts` |
| `src/Root.jsx` | `src/Root.tsx` |
| `src/LyricFilm.jsx` | `src/LyricFilm.tsx` |
| `src/timed-lyrics.js` | `src/timed-lyrics.ts` |
| `src/lyrics.js` | `src/lyrics.ts` |

The migration adds typed component props, readonly lyric and cue contracts, checked array access, strict compiler settings, a local `typecheck` command, and a combined `check` gate. It does not change the film's intended timing, animation, audio, or rendered design.

## Exceptions

If a production tool genuinely requires a JavaScript configuration file and cannot load TypeScript, document the tool, required filename, owner, and removal condition next to the exception. Keep it declarative and minimal. Generated JavaScript belongs in ignored build output and is never edited by hand.

## Definition of done

- [ ] The stable TypeScript version was verified and exactly pinned.
- [ ] The lockfile records the same compiler version.
- [ ] Authored source contains no `.js` or `.jsx` modules.
- [ ] `strict` typechecking passes with no suppression used to conceal uncertain data.
- [ ] Remotion discovers every expected composition from the `.ts` entry point.
- [ ] Typed timing, analysis, and motion data also pass their runtime validators.
- [ ] Representative source renders remain visually and temporally equivalent after migration or upgrade.
- [ ] The release manifest records the compiler and complete toolchain identity.

## Primary references

- [TypeScript project](https://github.com/microsoft/TypeScript)
- [TypeScript release process](https://github.com/microsoft/TypeScript/wiki/TypeScript%27s-Release-Process)
- [TypeScript 7.0.2 release](https://github.com/microsoft/typescript-go/releases/tag/typescript%2Fv7.0.2)
