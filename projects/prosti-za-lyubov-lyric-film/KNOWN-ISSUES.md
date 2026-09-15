# Known highlighting gaps — Прости за любовь v1.2

**Disposition: accepted for this song; keep the existing delivery.** These are documented examples of incomplete English highlighting, not a request for another render. They are required regression cases for the next song’s [cross-language sync review](../../docs/cross-language-sync-gate.md).

## PZL-01 — the full English cold-feelings statement is not highlighted

When Russian **«Остыла»** is active, v1.2 highlights only **“grown cold.”** In the selected English reading, the complete span **“I have grown cold”** should share that event’s focus. “I have” should not remain neutral just because it has no separately timed Russian token.

The same mapping occurs in four independently timed chorus cues:

| Cue | Source word interval in the delivered timeline |
| --- | --- |
| `L07b` / `L07-w07` | 00:56.336–00:57.878 |
| `L09b` / `L09-w07` | 01:20.317–01:21.499 |
| `L29b` / `L29-w07` | 02:38.309–02:39.310 |
| `L31b` / `L31-w07` | 03:02.357–03:03.198 |

**Future resolution criterion:** the full chosen English span activates and releases with the corresponding Russian event in every occurrence and format, without including the preceding apology or inventing English word timestamps. This concerns highlight coverage within the chosen reading; the broader chorus interpretation remains documented as ambiguous.

## PZL-02 — the English apology leaves “me” behind

At **«прости»**, the English line ends **“forgive me,”** but only **“forgive”** lights up. In this adopted elliptical English apology, **“forgive me”** should highlight together.

The reported line is `L28` / `L28-w06`, **02:29.298–02:29.860**. The same neutral-“me” policy also appears in the chorus/title apologies (`L07b`, `L09b`, `L12`, `L29b`, `L31b`); review those occurrences as well in any future revision. These times identify the existing data, not newly measured or certified vocal boundaries.

**Future resolution criterion:** the complete adopted apology shares the «прости» interval. “Me” is part of the reviewed English realization, not a claim of an additional sung Russian word. Do not generalize this into permission to add an unsupported “you” after «любила».

## Lesson for the next song

Source-word coverage and precise timing of a chosen map do not establish complete target-language highlighting. Review **every English/translated word as well as every source word**, and check for omitted grammatical parts. Preserve individual matches where appropriate, while highlighting full grammatical expansions and idiomatic meanings when necessary. Do not optimize for the smallest number of grouped words.

Finish this semantic review and the full actual-audio synchronization review in **all displayed languages before production rendering starts**. Missing review or fixable sync defects block the next song’s render. Acceptance of v1.2 is an edition-specific delivery decision, not a reusable waiver.
