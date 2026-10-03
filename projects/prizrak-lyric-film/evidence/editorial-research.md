# Japanese and Russian editorial evidence — «призрак»

## Scope and evidence limits

The recording is the authority for performed words, repeats, omissions and acoustic boundaries. This research identifies classical text and meaning; it does not establish that an entire referenced poem is sung. Preserve `source/user-reference.txt` unchanged and reconcile every instance against the original mix. The paired source/translation templates are in `source/japanese-editorial.json`. Their source indices are local editorial units; all selected sample boundaries and performed occurrences remain unset.

The translations below are original editorial work. Modern institutional translations inform grammar and interpretation, but their wording is not copied. Original-language text has no pronunciation aid or phonetic respelling.

## Classical stanza: Hyakunin Isshu 59

The [All-Japan Karuta Association](https://www.karuta.or.jp/karuta-everyday/2911/) identifies **赤染衛門 (Akazome Emon)** and **後拾遺集 恋二 680**. The [Saga-Arashiyama Museum’s poem 59 entry](https://www.samac.jp/search/poems_detail.php?id=59) independently identifies the same poet, collection and poem number. These are current institutional editions, not an inspection of the original manuscript.

> やすらはで 寝なましものを
> 小夜更けて 傾くまでの
> 月を見しかな

The historical poem is public-domain text. The museum displays equivalent orthography, including さ夜更けて and かたぶく. The kanji-bearing supplied form may be retained. Variant spelling does not establish an additional performed occurrence. In particular, the supplied passage contains both kanji and hiragana forms; the recording must establish whether either is repeated.

### Grammar that changes the meaning

[Sanseido’s classical-dictionary editors](https://dictionary.sanseido-publ.co.jp/column/waka27) explicitly analyze な as the perfective/assertive auxiliary ぬ, まし as counterfactual, and ものを as adversative. The dictionary-publisher page was obtained through its indexed official-domain result after direct retrieval failed. Therefore 寝なまし must not become “did not sleep.” The clause regrets a sleep that could have happened instead.

やすらはで conveys not lingering or hesitating. It does not mean peaceful, restless, or unable to sleep. 小夜 is “night”; the first element is a prefix, not the adjective “little.” The [Shogakukan dictionary entry reproduced by Kotobank](https://kotobank.jp/word/%E5%B0%8F%E5%A4%9C-512170) supports this distinction.

The moon lowers or inclines toward setting; it does not become dim. The [Nagoya Sword Museum’s Akazome Emon entry](https://www.meihaku.jp/hyakunin-isshu-kajin/kajin-akazomeemon/) retains the classical verb represented by 傾く. Its supplied reading confirms that the written verb should not automatically be modernized. The first-person predicate is past; classical かな expresses emotion/exclamation here. Its later conversational “I wonder” use is not the relevant reading. See the [Shogakukan dictionary’s かな entry](https://kotobank.jp/word/%E3%81%8B%E3%81%AA-464996).

The historical headnote concerns a promised visitor who did not arrive, but the poem’s explicit words do not name the visitor, add a direct “you,” or state “west.” Those contextual additions are excluded from the default film translation. The English paraphrase on the museum page is loose; its sleep wording should not substitute for the dictionary’s explicit counterfactual grammar.

### Own full-meaning translations

**Russian:** Без промедления стоило бы уснуть — но… Ночь стала глубокой; ах, я смотрел на луну, пока она не склонилась низко.

**English:** I should have gone to sleep without delay—but… The night grew late; ah, I watched the moon until it sank low.

“Should have” renders retrospective regret, not a moral demand. “Sank low” avoids asserting a completed disappearance below the horizon. The Russian masculine past follows the contemporary song’s explicit исчез / пропавший voice convention; the Japanese sentence itself is not gendered. It is not inferred from the historical author’s gender.

### Cue and unit proposals

| Template | Original phrase | Key ownership |
| --- | --- | --- |
| JP59-01 | やすらはで 寝なましものを | Negation owns without / без; sleep plus completion owns sleep / уснуть; counterfactual and adversative own should have / стоило бы and continuation. |
| JP59-02 | 小夜更けて | Night is independent; “grew late” / “стала глубокой” is the inflected change of state. |
| JP59-03 | 傾くまでの | The lowering event and the until construction remain distinct. Russian пока не is grammatical until, not source lexical negation. |
| JP59-04 | 月を見しかな | Moon/object, past watching, and exclamation remain distinct; かな supplies Ah / Ах. |

These divisions are suitable for independent timing jobs. They need not force separate reading screens. The optional `japaneseCompositeTemplates` entry JP59-03-04 joins the last two phrases into one stable reading group with the natural full translation and complete remapped contributor indices. Reserve the whole translated geometry and retain the independently timed original units. Natural English order can focus backward across a stable line. Do not rewrite the meaning or flatten all source units just to achieve a left-to-right sweep.

Japanese source units include lexical stems, particles and auxiliaries. This is a grammatical proposal, not proof that each suffix has a separately audible word entrance. If the recording only supports an indivisible inflected word, merge adjacent units, document why, and remap all three lanes together. Whisper characters or syllable outputs are not automatically words.

## Additional sampled fragments: Hyakunin Isshu 30

A separate classical source fits the observed opening/closing response shapes. The [Saga-Arashiyama Museum’s poem 30 entry](https://www.samac.jp/search/poems_detail.php?id=30) identifies **壬生忠岑 (Mibu no Tadamine)** and the **古今集**. The [All-Japan Karuta Association entry](https://www.karuta.or.jp/karuta-everyday/2795/) gives **古今集 恋三 625**:

> 有明の つれなく見えし 別れより
> 暁ばかり 憂きものはなし

The candidate performed excerpt is **憂きものはなし / 暁ばかり**, reversing the two lower-verse fragments. This is a source-identification inference from the observed shapes and exact classical wording; the audio inventory must confirm each occurrence. Do not add the upper verse simply because a complete source poem exists.

Here **ばかり is comparative degree**, not the modern restrictive “only.” In the full classical construction, nothing is as sorrowful as dawn. Reversed performance does not justify translating “there is no sorrow” and then “only dawn” as unrelated statements.

**Own Russian excerpt:** Нет ничего горестнее рассвета.
**Own English excerpt:** Nothing is more sorrowful than dawn.

The combined JP30-LOOP-PAIR template uses six independent candidate units: 憂き / もの / は / なし / 暁 / ばかり. Keep both observed subphrases in one reading cue where practical; their original word timing and intervening gap remain separate. Russian горестнее uses the union of the sorrowful and comparative events. English more / than follow the comparative particle. In both languages, necessary grammar belongs to real source events and receives no invented independent timestamps.

If only one fragment is supported in an occurrence, leave the missing comparison unresolved rather than supplying an unperformed complement. No “floating thing,” “story,” “red moon,” or invented addressee is justified by ASR spelling errors.

## Independent inventory cross-check

Read the unprompted original-mix Japanese outputs in `analysis/independent-audio/`: early large/small, opening large/small, tail large/small, and tail vocals. These are automated observations with `humanListening: false`; they do not establish listening completion.

- **0–20.5 s:** the early outputs say 音楽 or contain no text. No supported lyric is derived from either result.
- **Approximately 20.3–38.0 s:** models contain shapes compatible with the two poem 30 fragments, but also wrong kanji, word divisions and initial overlong intervals. The source-poem comparison is useful for lexical reconciliation; output timestamps are not final source-word samples.
- **Approximately 38–86 s:** additional unprompted main-section large/small checkpoint results place recognizable poem 59 shapes around 49.1–65.5 s and 65.8–84.4 s. They replace classical words with modern phonetic guesses. The 38–48 s entrance remains lexically uncertain and needs physical audio review; a broad model segment or repeated syllable label does not establish a lyric. This editorial file does not assert the final count or copy timings between runs.
- **Approximately 221–239 s:** Japanese-shaped responses overlap the Russian night phrases. Original-mix models disagree substantially; a vocals-only output produces a stock thanks-for-watching sentence. These failures require original-mix review, not acceptance of the most fluent text.

The candidate ranges above are search windows, not selected cue boundaries. No hearing is claimed from spectrograms, ASR outputs, or this research.

## Modern Russian text and own English translation

The JSON contains 14 unique supplied-reference templates. Instantiate each performed repeat independently; do not treat reference structure as the completed inventory.

| Supplied reference | Own English |
| --- | --- |
| В последний раз, когда | The last time, when |
| Мой сон не тревожили мысли | thoughts did not disturb my sleep, |
| Твои руки по волосам | Your hands over hair |
| Утешали меня | comforted me. |
| Мне осталось лишь гадать | I’m left only to guess. |
| Без конца наблюдать за луною | To watch the moon without end. |
| Осталось лишь желать | All that remains is to wish |
| Твоего взора за луною | for your gaze beyond the moon. |
| В темную ночь | In the dark night. |
| В темную ночь, ночь | In the dark night, night. |
| Такое чувство, что меня нет | It feels as though I don’t exist. |
| Что я исчез | As though I vanished. |
| Я теперь для всех пропавший человек | Now I’m a missing person to everyone. |
| Я исчез | I vanished. |

Two deliberate limits matter. The hair’s possessor and an explicit stroking verb are unstated, so neither is added. In наблюдать за луною, за belongs to the observing object. In взора за луною, a spatial “beyond” reading is proposed; a gaze following the moon is also possible. Preserve that ambiguity rather than inserting eye contact, looking at me, or watching over me. No location such as “here” is added to меня нет.

## Three-lane presentation and synchronization contract

Apply the repository’s [bilingual ownership workflow](../../../docs/bilingual-lyric-workflow.md), [complete cross-language gate](../../../docs/cross-language-sync-gate.md), and [По камушку lessons](../../po-kamushku-lyric-film/PRODUCTION-LESSONS.md):

1. During Japanese, show **Japanese, Russian, English** with equal perceived size, weight and active/rest contrast. During Russian, show **Russian and English** only. Japanese text is original script, without pronunciation help.
2. Use a real Japanese font with a compatible Cyrillic/Latin face. Check glyph coverage, baseline, line height and optical scale at native and realistic phone sizes.
3. Reserve complete stable lane geometry. Reflow all lanes together instead of shrinking or dimming a translation. Use stable color-only focus; no karaoke underline, bouncing word, pill or box.
4. Every translated token references source-unit indices. Activate the **union** of its contributors, excluding unrelated intervening words and genuine gaps. Include necessary articles, auxiliaries, case completions and comparison grammar in the source event’s translated meaning.
5. Review each repeat’s quiet onset, body and held ending independently. A selected sample number is exact storage of an interpretation, not automatic millisecond physical certainty.
6. Keep word focus, bounded soft carry, neutral reading lifetime and decorative release separate. The incoming cue is fully opaque on its first active source frame. Paused and seeked views must redraw against the actual source clock.
7. Validate the complete original picture and all intended layers after startup, seeks and format changes in both delivery layouts. Audio progressing does not prove a working picture.
8. Current work is **preview-only**. No full production render is authorized by these editorial files or previous-song approvals.

All publication remains with the coordinating assistant. Before any remote action capable of triggering Actions, that coordinator must take a fresh all-workflow/all-branch/all-actor UTC-day run inventory, including older rerun attempts, estimate resulting runs and runner minutes, and handle unknown monthly usage under the current approval policy. No billing expansion or trigger bypass is justified by this editorial task.

## Independent follow-up editorial review

A later independent text review inspected `source/russian-editorial.json` without changing that file or selected timing. It covered all 14 unique templates. Index completeness alone is insufficient: a source unit can be referenced while an unnecessary word is added, or an article can follow the wrong noun event.

### Concrete changes recommended to the coordinator

- **hands:** remove inferred **my**. The following меня identifies the person comforted; it does not grammatically specify whose hair receives the gesture. Prefer **Your hands through hair** as a valid poetic fragment, with Your=[0], hands=[1], through=[2], hair=[3]. A contextual possessive could be defended artistically, but it is not a necessary English grammatical completion and is excluded by the conservative unset-object rule.
- **night and night2:** move **the** from [1] to **[2]**. The article belongs to the first explicit night, so **the night** lights together when ночь is sung; dark remains [1]. The independent repeated night remains [3].
- **last:** prefer **The=[0,2]**, last=[1], time=[2], when=[3]. This associates the English article with the occasion noun while also representing the Russian temporal preposition. Use a contributor union; do not hold The through the intervening adjective merely because it falls between the contributors.
- **watch:** **To watch the moon without end** preserves individually corresponding without / end and uses watch for наблюдать. Mapping: To=[2], watch=[2], the=[4], moon=[3,4], without=[0], end=[1]. The transitive English object absorbs Russian за. The existing **Endlessly gaze at the moon** is understandable, but it compresses separable words and gives наблюдать a contemplative nuance. This is a precision and wording improvement rather than an independently established acoustic defect.
- **missing:** prefer natural **Now I’m a missing person to everyone** while retaining the current individual source owners. No new seeing, judgment or relationship action is added.

**sleep** has a sound passive English rendering: was / troubled follow тревожили, not follows не, by / thoughts follow the explicit agent мысли. **wonder** is natural; гадать permits wonder or guess without supplying what is guessed. **wish** and **gaze** maintain the deferred explicit gaze object, with the previously documented beyond/following ambiguity. **feeling**, **vanish**, and **gone** preserve nonexistence and completed disappearance. The present-perfect have vanished is a defensible current-result reading, not an error. Changing That to As though in the continuation is optional for English clause flow; neither warrants altering audio timing.

### Gender-neutral Japanese translation

The previous Russian смотрел chooses observer gender absent from the Japanese. The modern Russian lyric’s masculine исчез does not prove the identity or gender of the separately sampled classical observer. A natural active first-person Russian past verb necessarily marks gender; parentheses such as смотрел(а) are unsuitable for the film.

A compact neutral past paraphrase is:

**Ах, перед глазами была луна, пока она не склонилась низко.**

It keeps past visual experience and the explicit moon, while moving grammatical gender to луна. It changes active viewing into an impersonal perception image, so it should be labelled a nominal/perceptual paraphrase rather than a literal word-for-word rendering. It adds no beloved, visitor, western sky, forced obligation or completed horizon disappearance. перед глазами expresses seeing rather than supplying an independently sung body-part event. For composite source indices, Ах=[7], перед / глазами / была=[5,6], луна=[3,4], пока / не=[1,2], она=[0,3], склонилась / низко=[0]. The isolated moon clause can use **Ах, перед глазами была луна.**

Avoid neutralizing gender through пришлось, довелось, невозможно оторваться, прикованный взгляд, or never looking away: those introduce necessity, happenstance, compulsion or negation not expressed in the poem. The existing masculine can only remain as an explicitly chosen contemporary narration convention, not a source-encoded fact.

### Smallest coherent Japanese focus groups

The first template’s 寝 / な / まし morphology should remain available as analysis evidence, but partial highlights currently split a single counterfactual verb meaning. The smallest coherent display event is **寝なまし**, excluding the following adversative ものを.

- Map every token of **I should have slept** (or the existing I should have gone to sleep) to the same contributor union **[2,3,4]**.
- Map the Russian **стоило / бы / уснуть** to the same **[2,3,4]** union.
- Keep **ものを → but / но** separate at [5].
- Treat **やすらはで** as the single negative inflected expression: without / delay and Без / промедления use **[0,1]**. This does not justify merging the entire clause.
- In JP59-02, **更けて** forms one inflected continuation; grew / late and стала / глубокой already share [1,2]. Give its Japanese displayed glyphs the same group ownership.
- In JP59-04, **見し** is the past viewing verb; I / watched and the neutral perception paraphrase share its stem/past union. Keep 月, its object particle, and かな distinct in acoustic evidence.
- In the composite English noun phrase, **the / moon** may both use **[3,4]** so a source object-case event does not illuminate only moon while its required article stays neutral. Japanese source units remain independently observed.

Groups are justified by inflection or required cross-language grammar. They are not a reason to merge all neighboring content words or fill real gaps. If the audio supports a continuous inflected word, the production Word object can merge its adjacent acoustic units with a documented start/end. If the units are retained separately, target union ownership provides coherent focus without inventing a new clock. Normal-speed listening still has to assess the resulting visual behavior; this text review alone is not a synchronization attestation.

## Selected preview v1 — complete text/mapping audit

Read-only audit of all **37 cues**, **150 source units** (44 Japanese, 106 Russian), **84 language lanes**, and **257 translated display tokens** in the selected preview timeline. Every cue was compared with the complete selected Japanese or Russian template, including token order, source indices, articles, inflection expansions, negation, repeats and the closing carried voice. All templates were read; this is not a sample-cue check.

Audited identities:

| File | SHA-256 |
| --- | --- |
| public/timeline.json | dbfabfc924feef5e40db05d508bf6c7f9b4028b3fc35c32873b1d4ea75259420 |
| source/japanese-selected-editorial.json | ecf965914d684f10980fc6de9f2a1f43189f0e3f42b4df8d43dbbc9492307319 |
| source/russian-editorial.json | 14f98c400dc3db1993a9b5662e30cf6f506517e9d47a06b7cad234b57b46e59a |

**No concrete blocking text or semantic-mapping defect was found in this snapshot.** Every language covers every source unit, with no invalid or missing source index and no mismatch between a selected template and its cue instance. This does not establish perceptual onset/release correctness or listening completion.

### Selected choices and their limits

- The Japanese display now groups **やすらはで**, **寝なまし**, **更けて**, **までの**, **月を**, and **見し** coherently. Complete English **I should have slept** and Russian **стоило бы уснуть** follow the single counterfactual verb; its adversative continuation remains separate. These are logical inflection/grammar groups, not a whole-line focus shortcut.
- Both moon-pair instances preserve past seeing, the moon and until relation, while Russian uses **перед глазами была луна** as the previously documented gender-neutral perceptual paraphrase. Its grammatical feminine agreement belongs to луна and makes no claim about the observer’s gender. The English verb and article/noun expansions are complete.
- The poem 30 loop occurs in four selected pairs: two opening and two closing pairs. The reversed-fragment comparison is retained; ばかり supplies comparative degree, not only. No unsung upper stanza is appended.
- **My hair** remains a chosen contextual possessive in both hands instances. The following explicit меня makes this an ordinary context inference about the comforted narrator. The Russian source does **not** explicitly contain a hair possessive; the token’s rationale correctly labels contextual completion. This edition’s choice supersedes the earlier conservative omission recommendation, without treating the inferred possessive as literally performed Russian.
- Night articles now belong to the first ночь, leaving the separately repeated night independent. The last-time article uses the temporal-preposition/noun union and does not merge the intervening adjective.
- The selected **To gaze endlessly at the moon** and **To everyone now, I’m a missing person** are understandable, faithful poetic English. Earlier watch/word-order suggestions are optional style refinements, not blockers. Their current mappings preserve all original words and required English grammar.
- The beyond/following interpretation of взора за луною remains an explicit lexical ambiguity. No invented eye contact, visitor, western sky or additional beloved is introduced.
- The closing overlap carries only the still-active final Russian **ночь / night**, with identical original source samples and remapped local indices, while the Japanese response begins. Both meanings remain represented rather than clipping the Russian ending.
- No rejected music label, repeated instrumental syllable label or stock thanks-for-watching hallucination appears. The selected two poem 59 runs and Russian sequence match the reconciled inventory structure rather than blindly copying the supplied kana duplication or automatic transcript errors.

### Concise remaining listening/layout checks

1. **49.39–53.77 and 67.69–72.17 s:** the complete counterfactual verb group should enter and release smoothly together in all three languages.
2. **58.50–65.66 and 76.75–86.12 s:** check the natural reordered moon sentence, including the it / она contributor union, held endings and cue transition into Russian.
3. **126.24–130.40 and 217.60–222.24 s:** review quiet В entrances, the night article and independently repeated night focus.
4. **221.80–222.24 s, then the response through 239.04 s:** confirm the brief simultaneous Russian night and Japanese response are both readable, then the remaining Japanese comparison releases correctly.

The opening poem 30 pairs also deserve normal-speed lexical review because their model spellings were misleading; institutional source matches are not hearing. The complete normal-speed, uncertain-edge slow-speed and both-layout review remains a separate preview check. No acoustic event, canonical editorial file or remote state was changed by this audit.
