# Translation and semantic correspondence review

## Scope and status

**Text and semantic correspondence reviewed; acoustic and audiovisual review remain separate.** This record covers the 33 planned cue instances built from the supplied lyric reference, with ten distinct line patterns. It does not establish that the supplied reference covers every performed vocal, that the planned sequence matches the recording, or that any word boundary has passed listening review. Recording-specific coverage work may change the inventory.

Method: model-assisted Russian/English editorial review followed by independent semantic expectations in [`tests/semantic.test.ts`](../tests/semantic.test.ts). The expectations are authored from the selected meanings, not calculated from the generator's correspondence indices. The tests exercise both language lanes with deliberately separated synthetic source intervals. Synthetic intervals are display test fixtures, not sung timing evidence.

Reviewed inputs:

| Input | SHA-256 |
| --- | --- |
| `scripts/prepare-text.ts` | `b779959058136b192550aa00fb32f3462d60b04410898dfc99e949a0bf3d7fa4` |
| `source/text-and-mapping.json` | `50ac55c6d965f59966dd88d3caf6e404af19e1b144bce2f4e47f7415cba27553` |

Any change to lyric text, translation or correspondence requires an affected semantic recheck. Changes to performed repetitions also require a revised cue inventory and independent recording evidence.

## Selected wording and complete cue inventory

| Pattern | Russian | English | Reviewed planned cue IDs |
| --- | --- | --- | --- |
| `v1` | Непокорная моя любовь | My untamed love | LM-001, LM-012 |
| `v2` | Любит не меня уже который год | Loves, but not me, year after year | LM-002, LM-013 |
| `v3a` | Те же стены и цветы | The same walls and flowers | LM-003, LM-014 |
| `v3b` | Те же люди и стихи | The same people and poems | LM-004, LM-015 |
| `v4` | Те же мысли и слова вслух | The same thoughts and words out loud | LM-005, LM-016 |
| `c1` | Люби меня, люби жарким огнём | Love me, love with blazing fire | LM-006, LM-017, LM-025, LM-029 |
| `c2` | Ночью и днём, сердце сжигая | Night and day, burning the heart | LM-007, LM-018, LM-026, LM-030 |
| `c3` | Люби меня, люби, не улетай | Love me, love, don't fly away | LM-008, LM-019, LM-027, LM-031 |
| `c4` | Не исчезай, я умоляю | Don't disappear, I am begging | LM-009, LM-020, LM-028, LM-032 |
| `r1` | Люби меня, люби | Love me, love | LM-010, LM-011, LM-021, LM-022, LM-023, LM-024, LM-033 |

The two clauses beginning “Те же” are separate display cues. Annotation links and unrelated recommendations are excluded. Repeated wording shares editorial expectations, but each performed occurrence needs its own timing evidence.

## Editorial decisions

- **Untamed love:** preserve personification and the explicit possessive without selecting a beloved's gender. English keeps natural “My untamed love” word order while its focus follows the reversed source correspondence.
- **Loves, but not me:** preserve present-tense loving and the contrast expressed by “не меня.” Do not replace it with a broader denial of loving or introduce an unstated alternative lover. English “but” expresses the source contrast and shares the negation event with “not.” Explicit “me” remains independent.
- **Year after year:** the temporal construction “уже который год” becomes an idiomatic expression of continuing years. Its three participating source events jointly support the three English words. This is a documented idiom rather than a claim that each English word has an independent sung equivalent.
- **The same:** “те же” is a compound determiner. Both English words and both Russian words receive the paired display focus of the participating intervals. Keep the nouns and conjunction independent.
- **Poems:** preserve the literary noun “стихи”; do not reinterpret it as song lyrics.
- **Love me, love:** keep the explicitly sung object “меня” separate from both imperative verbs. Do not add another “me” after the repeated imperative or generalize another song's complete-phrase presentation exception to this line.
- **With blazing fire:** instrumental case is marked on both the adjective and noun. English “with” is a grammatical completion of that construction, introduced at its first spoken word: “жарким” activates **with blazing**, followed by “огнём” activating **fire**. This preserves natural forward reading without inventing a sung preposition, moving any acoustic boundary or grouping both Russian words. The earlier split “with + fire” focus returned to the front of the phrase and is superseded.
- **Burning the heart:** preserve the unspecified ownership of “сердце.” Its grammatical article shares the noun event. “Burning” follows “сжигая,” even though English places it earlier in the displayed phrase. No “my” or “your” is introduced.
- **Complete expansions:** “вслух” covers both “out loud”; “улетай” covers both “fly away”; “умоляю” covers both “am begging.” Keep explicit “не” and “я” independent. Do not add an unstated addressee to “begging.”

## Display contract and verification

Every Russian word has a target meaning, and every English word has a source correspondence. There are no intentionally neutral grammar words in this edition. Multi-source phrases use the union of participating source intervals, with focus released in real gaps. Acoustic source events remain distinct from paired display grouping.

The semantic suite checks every planned cue and repeated occurrence for complete target coverage, independent pronouns/negation/conjunctions, reversed English order, forward instrumental completion, matching Russian display groups, onset, last-active frame, exclusive release and gap behavior. Deliberately defective fixtures establish that the expectations reject missing “loud,” “away” or “am,” swallowed explicit subjects/objects, an over-broad fire highlight, the previous disconnected with/fire focus, invented heart ownership, and reversed possessive correspondence.

Run from the project directory:

```sh
node --test tests/semantic.test.ts
```

Recorded result for the identities above: **36 tests passed, zero failed**. This includes 33 per-cue semantic checks, inventory and coverage checks, and deliberate regression fixtures.

These checks support the mandatory cross-language gate. They do not certify actual-audio synchronization, complete vocal coverage, native/mobile readability, or completed listening review, and they do not authorize a production render.
