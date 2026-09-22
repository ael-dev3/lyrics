# Translation and semantic correspondence review

## Scope and status

**Current revision: `preview-v3-duration-focus`, under review.** This record covers 33 cue instances with ten distinct line patterns, 147 Russian events and 169 English words. LM-002 and LM-013 receive revised duration wording and finer display anchors; Russian wording is preserved. Four model-supported exclusive-end corrections are recorded separately from these semantic decisions. Editorial rationale and semantic regression checks support this revision, but they do not establish actual-audio synchronization or authorize production.

The earlier v1 films and their human review, decoded-focus checks and delivery receipts remain historical evidence for their frozen inputs and exact bytes. They do not certify the changed preview. No v3 film or replacement Desktop kit is reported here.

Method: model-assisted Russian/English editorial review followed by independent semantic expectations in [`tests/semantic.test.ts`](../tests/semantic.test.ts). The expectations are authored from the selected meanings, not calculated from the generator's correspondence indices. The tests exercise both language lanes with deliberately separated synthetic source intervals. Synthetic intervals are display test fixtures, not sung timing evidence.

Historical editorial checkpoint inputs, retained for provenance rather than as the current v3 identity:

| Input | SHA-256 |
| --- | --- |
| `scripts/prepare-text.ts` | `d50db336ad7f4f3cbb06f7a61013560391952c02494b7f160b8af06cfbe4c158` |
| `source/text-and-mapping.json` | `c3f6bf374c8d4c16d383c23868b4967dbcae805b9dc9aefd7156f56f7b92a2d4` |

Any change to lyric text, translation or correspondence requires an affected semantic recheck. Changes to performed repetitions also require a revised cue inventory and independent recording evidence.

The [preview identity](preview-identity.json) binds the current generated preview inputs. The historical hashes above and earlier test totals must not be used to certify this revision.

## Selected wording and complete cue inventory

| Pattern | Russian | English | Reviewed planned cue IDs |
| --- | --- | --- | --- |
| `v1` | Непокорная моя любовь | My untamed love | LM-001, LM-012 |
| `v2` | Любит не меня уже который год | Has loved, but not me, for years now | LM-002, LM-013 |
| `v3a` | Те же стены и цветы | Those same walls and flowers | LM-003, LM-014 |
| `v3b` | Те же люди и стихи | Those same people and poems | LM-004, LM-015 |
| `v4` | Те же мысли и слова вслух | Those same thoughts and words out loud | LM-005, LM-016 |
| `c1` | Люби меня, люби жарким огнём | Love me, love with blazing fire | LM-006, LM-017, LM-025, LM-029 |
| `c2` | Ночью и днём, сердце сжигая | Night and day, burning the heart | LM-007, LM-018, LM-026, LM-030 |
| `c3` | Люби меня, люби, не улетай | Love me, love, don't fly away | LM-008, LM-019, LM-027, LM-031 |
| `c4` | Не исчезай, я умоляю | Don't disappear, I am begging | LM-009, LM-020, LM-028, LM-032 |
| `r1` | Люби меня, люби | Love me, love | LM-010, LM-011, LM-021, LM-022, LM-023, LM-024, LM-033 |

The two clauses beginning “Те же” are separate display cues. Annotation links and unrelated recommendations are excluded. Repeated wording shares editorial expectations, but each performed occurrence needs its own timing evidence.

## Editorial decisions

- **Untamed love:** preserve personification and the explicit possessive without selecting a beloved's gender. English keeps natural “My untamed love” word order while its focus follows the reversed source correspondence.
- **Has loved, but not me:** use the present perfect in the duration context to express loving that has continued through preceding years into the present. “Has loved” is the complete target span for «Любит»; it does not add an independently sung auxiliary. Preserve the contrast expressed by «не меня» without introducing an unstated alternative lover. English “but” expresses that contrast and shares the negation event with “not.” Explicit “me” remains independent.
- **For years now:** the complete construction «который год» supplies the lexical meaning **for years**; «уже» supplies **now**. Preserve the full construction in the lexical correspondence, while using the finer display anchors detailed below. This supersedes the v1 “year after year” display grouping in LM-002 and LM-013. The earlier rendering and its checks remain identified as v1 evidence.
- **Those same:** the revised English retains the source demonstrative explicitly, allowing **Те → Those** and **же → same** to follow their own sung events. This replaces the earlier “The same” wording and shared determiner display span across all six verse cues. Nouns and conjunctions remain independent; no acoustic boundaries change.
- **Poems:** preserve the literary noun “стихи”; do not reinterpret it as song lyrics.
- **Love me, love:** keep the explicitly sung object “меня” separate from both imperative verbs. Do not add another “me” after the repeated imperative or generalize another song's complete-phrase presentation exception to this line.
- **With blazing fire:** instrumental case is marked on both the adjective and noun. English “with” is a grammatical completion of that construction, introduced at its first spoken word: “жарким” activates **with blazing**, followed by “огнём” activating **fire**. This preserves natural forward reading without inventing a sung preposition, moving any acoustic boundary or grouping both Russian words. The earlier split “with + fire” focus returned to the front of the phrase and is superseded.
- **Burning the heart:** preserve the unspecified ownership of “сердце.” Its grammatical article shares the noun event. “Burning” follows “сжигая,” even though English places it earlier in the displayed phrase. No “my” or “your” is introduced.
- **Complete expansions:** “вслух” covers both “out loud”; “улетай” covers both “fly away”; “умоляю” covers both “am begging.” Keep explicit “не” and “я” independent. Do not add an unstated addressee to “begging.”

## Display contract and verification

Every Russian word has a target meaning, and every English word has a source correspondence. There are no intentionally neutral grammar words in this edition. Acoustic source events, lexical meaning and performed display anchoring remain distinct.

### Duration construction: lexical coverage and narrower focus

| Russian performed event | English focus | Basis |
| --- | --- | --- |
| Любит | Has loved | Complete verb expression in the continuing-duration context |
| не | but not | Negation and its contrasting completion |
| меня | me | Explicit object |
| уже | now | Independent temporal particle; English places it at the end |
| который | for | Onset anchor for the complete «который год / for years» construction |
| год | years | Following anchor within the same duration construction |

For **for** and **years**, lexical `sourceIds` retain both participants of «который год». Narrower `focusSourceIds` select «который» for **for**, and «год» for **years**. These display anchors are not standalone dictionary glosses: in particular, «который» is not claimed to mean “for.” The full construction supplies the duration meaning, including the English plural. Keep independently performed Russian words distinct in the displayed source lane instead of propagating their shared lexical relationship into a broad highlight.

Display anchoring does not itself require moving source boundaries, and no English acoustic timestamp is invented. Any correction to a held source release or following consonant onset requires its own recording-based evidence. English reading order is natural even though the focus moves from final **now** back to **for years**. For multi-source display groups that remain elsewhere, use the union of their documented focus intervals and release in real gaps. A narrower display anchor must stay within its lexical contributors and have an explicit semantic rationale; it is not a general shortcut for arbitrary word splitting.

### Separate acoustic release corrections

Fresh unforced MMS observations of the original mix and vocal stem, supported by signal inspection, indicate held vocal continuation after the earlier selected releases. The selected v3 corrections extend four exclusive ends:

| Source event | Word | Revised exclusive end |
| --- | --- | --- |
| LM-002-s04 | уже | 11.880 s |
| LM-013-s04 | уже | 79.120 s |
| LM-002-s05 | который | 13.560 s |
| LM-013-s05 | который | 80.800 s |

All onsets, the other 143 word intervals, and cue/visibility clocks remain unchanged. The evidence supports holding the existing word rather than assigning the intervening vowel to an earlier next-word consonant. Endpoints retain 32–57 ms gaps before the following word events. [Signal evidence](../analysis/duration-focus-v3-signal.json) and the [revision record](duration-focus-refinement.json) document the basis; these are model/signal observations, not human listening evidence. Review the affected releases and bilingual handoffs in both performances before production.

The established semantic suite covers complete target coverage, independent pronouns/negation/conjunctions, reversed English order, forward instrumental completion, independent demonstrative and particle focus, paired source display, onset, last-active frame, exclusive release and gap behavior. For v3, the affected expectations must additionally check complete lexical coverage for **for years**, distinct «уже», «который» and «год» display events, complete **Has loved** focus, both repeated occurrences and rejection of the former broad duration group. Verify the new expectations against current generated inputs before recording a passing result.

Run from the project directory:

```sh
node --test tests/semantic.test.ts
```

Historical result at the editorial checkpoint above: **36 tests passed, zero failed**, covering 33 per-cue semantic checks, inventory/coverage and deliberate regression fixtures. This is not a v3 test result. Current results belong with the generated revision's evidence.

These checks support the mandatory cross-language gate. They do not certify actual-audio synchronization, complete vocal coverage, native/mobile readability, or completed listening review, and they do not authorize a production render.
