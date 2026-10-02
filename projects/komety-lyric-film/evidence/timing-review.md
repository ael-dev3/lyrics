# Acoustic timing review — Кометы preview

**Status: all 139 performed source events have reviewed onset and release selections. This is model/signal evidence; human listening and the production synchronization gate remain open. No full render is authorized by this record.**

Original source SHA-256: `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`. Source zero is retained. Decoded original: **11,469,824 samples at 44,100 Hz**, extent 260.086712 s. Editorial SHA-256: `cdca5026ede787103626912364a82ac311facb7e32aba652c013600fc31d390d`. Final candidate SHA-256: `bd9fe396db5501436ba867d700d4ad14314fa0a4eb05cca2eff87487d882bde9`. Before-refinement baseline SHA-256: `bd988f7e558ad5e1f3b2b9143fbb48701a8ad5d8daa34877c9ce4686f502dad0`.

## Result and coverage

- 27 cues, 139 original-language events, 24 supplied lines. Three Russian refrains are measured independently. Both English radio occurrences contain Captain/message/two checks; 26 later words were added from recorded evidence.
- 61 onset selections and 67 release selections changed from the preserved baseline. Every other event has an explicit inspected retention reason in `source/timing-candidate.json`; no unreviewed onset or release remains.
- Quiet source prelude is retained through the first vocal entry near 6.9 s. Full unprompted Russian ASR misses singing and invents subtitle/end-title content; bounded phrase/gap/tail checks reject those unsupported words. The final sung event and later radio reprise remain separate.
- Last selected event ends at 249.960000 s. The final faded radio endpoint is selected from its source fade, rather than transferring the earlier clip’s endpoint into digital silence.

## Method and limits

Cached local Whisper large-v3-turbo and small provide complete unprompted recognition, bounded Russian/English recognition and phrase-conditioned observations. Independent-family MMS_FA character paths and English Wav2Vec2 comparisons retain disagreements and rejected alignments. Additional stem/crop observations from the same model remain one family; they are not extra independent votes.

HTDemucs 4.1.0 htdemucs used existing checkpoint 955717e8, SHA-256 `d9fa14133cfcc034a6758923bb3a8ca9f8dfd0b582134643bbf83f72c17576dd`. Original and estimated vocals contain 11,469,824 samples at 44,100 Hz. Source/stem correlation over 7–14.8 s peaks at zero lag, r 0.56006; no shift is applied. The original mix remains timing authority. A stem can leak accompaniment and blur quiet edges.

All 139 original/stem onset and release panels were inspected. Close spectra use 512-sample Hann windows and 88-sample hops (~11.61 ms support and 1.995 ms hops). Wide verse/refrain tails distinguish changing coherent direct body from weaker static/monotonic decay. Every release has 40 ms original/stem RMS and normalized-periodicity traces on a 10 ms grid. None of these measurements certifies exact phoneme ownership or millisecond perceptual accuracy. Sample integers encode estimates; signal intervals and model disagreement remain explicit.

The six long initial chorus words use independently inspected nasal transitions. Focus includes direct sung vowel and final consonant body when supported. It receives no added reverb extension. Genuine closure/weak-decay intervals are retained; a continuous vowel/glide is not automatically labeled silence. No constant onset advance, generic minimum duration, chorus timing copy, or fixed tail is applied.

The late radio is the exception to separate repeat timing: four original-mix searches independently peak at exact +79.120 s (3,489,192 source samples), with correlations 0.995861, 0.997676, 0.996518 and 0.720317. Late onset/release panels and bounded late model observations agree with the same recorded clip. Primary refinements transfer with their absolute uncertainty; the last source-faded release is selected separately.

## Connected-word correction in v5

The initial-vowel ownership review inspected 12 repeated eagle/fire entrances and 7 related sonorant transitions. Eleven starts changed, with 8 explicit coupled prior-word releases ; 8 other onsets remain individually retained. The second огонь now starts62.160 s rather than63.073 s. Its quiet initial vowel precedes the g-like closure near 62.425; a stronger later core must not delay the complete word. All 27 cue-final endpoints and the v4 neutral line holds remain unchanged. See [historical v5 connected-word review](connected-word-review.md) and [authored correction data](../source/onset-corrections-v5.json). The earlier ledger is preserved in [the historical v3 record](timing-review-v3.md).

## Eagle entry refinement in v6

The historical `komety-preview-v6-eagle-entry` rechecks all six eagle entrances. KOM-013-s02 and the preceding lexical release move together from132.650 to132.304988662 s (5,834,650 samples), within132.270–132.360 s. The source-supported quiet vowel begins before the renewed body and sparse initial-character core. Five other starts are retained with broader explicit ownership ranges; no shared offset is applied. All27 cue-final body selections and neutral holds remain unchanged. See [eagle-entry review](eagle-entry-review.md), [selected v6 corrections](../source/onset-corrections-v6.json), and [historical v5 ledger](timing-review-v5.md).

## Targeted second eagle in v7

The historical `komety-preview-v7-second-eagle` revisits KOM-013-s04 after the earlier retained ownership proved late in perceptual review. The onset and preceding lexical release move135.850→135.700 s (5,984,370 samples), within135.650–135.750 s. Source/stem attenuation135.60–135.66 is followed by changed quiet body135.66–135.75, before the stronger vowel body. The132.305 correction remains intact, and all27 cue-final endpoints and neutral line holds stay unchanged. [Selected v7 layer](../source/onset-corrections-v7.json), [targeted review](eagle-entry-review.md), and [historical v6 ledger](timing-review-v6.md) preserve the distinction.

## Targeted fire entry in v8

The historical `komety-preview-v8-fire-entry` refines KOM-015-s04 and its preceding release149.650→149.480 s (6,592,068 samples), within149.430–149.550 s. The original/stem changed quiet body149.44–149.50 precedes the stronger vowel core and internal g-like attenuation149.82–149.87. Earlier149.300 is rejected as possible preceding v/n ownership. The two eagle refinements, all27 final lexical endpoints and all neutral line holds remain unchanged. See [inherited v8 fire-entry review](fire-entry-review.md), [selected v8 layer](../source/onset-corrections-v8.json), and [historical v7 ledger](timing-review-v7.md).

## Final eagle entry in v9

The historical `komety-preview-v9-final-eagle-entry` refines KOM-021-s04 and its preceding lexical release from **184.090 to 183.700 s**, source sample **8,101,170**, within 183.665–183.805 s. Narrowing around 183.53–183.61 precedes a changed quiet connected body developing around 183.69–183.71 and continuing through 183.80. The selected leading portion precedes the reduced-initial character core at 183.731; the stronger core is not substituted for the whole word’s entrance.

The independent proposal at 183.735 s differs from the selected acoustic boundary at 183.700 s by **35 ms** within overlapping plausible ownership intervals. Both observations are retained; original mixed audio governs the selection, while the estimated-vocal and cached model paths remain correlated supporting evidence with separation/context limits. This is an uncertain connected-vowel handoff, not a silence-separated edge or a full listening certificate. The 132.304988662, 135.700 and 149.480 s corrections, all 27 cue-final releases and all neutral line holds remain unchanged. See [archived v9 final-eagle review](eagle-final-entry-review-v9.md), [selected v9 layer](../source/onset-corrections-v9.json), and [historical v8 ledger](timing-review-v8.md).

## First final-refrain eagle in v10

The current `komety-preview-v10-first-final-eagle` refines KOM-021-s02 and its preceding lexical release from **180.550 to 180.350 s**, source sample **7,953,435**, within 180.315–180.435 s. Narrowing near 180.22 precedes a changed quiet descending body around 180.33–180.43. The selected ownership starts in this body before the sparse initial-character core at 180.406; neither a later stronger core nor an intervening silence is required for the word’s entrance.

Both targeted signal proposals select 180.350 s. Their original-mix/stem observations remain correlated and retain separation/context limits; agreement does not establish a unique physical edge or full listening certification. This revision changes one onset and its paired preceding release relative to v9. The 62.160, 132.304988662, 135.700, 149.480 and 183.700 s corrections, all 27 cue-final releases and all neutral reading windows remain unchanged. The two other retained eagle entrances are 45.180 and 48.420 s. See [current 180-second eagle review](eagle-180-focus-review.md), [selected v10 layer](../source/onset-corrections-v10.json), and [historical v9 ledger](timing-review-v9.md).

## High-risk coupled boundaries

| Event | Selected boundary / remaining uncertainty |
| --- | --- |
| Second Лети→над | Independent nasal transition 128.325 s replaces late d-like 128.646 s; broad/restricted CTC disagreements are retained. |
| Final Лети→над | Transition 176.340 s replaces 176.003 s stealing the held vowel. Над body/stop extends through 177.060 s; its range approaches the following z. |
| Final Свети→над | Transition 189.985 s replaces 189.063 s stealing the held i. Над extends through 190.695 s; joined d/z uncertainty may overlap the following onset range. |
| дай→ей→разбиться | Coupled дай end/ей start 120.275 s, interval 120.235–120.290 s. Ей end 120.480 s, interval 120.465–120.495 s; former 60 ms core is replaced by its complete vowel/glide span. |
| We're and filtered checks | Tight unprompted small recognizes We're, turbo omits it. Filtered Do/you/read/me boundaries remain broad; English audiobook CTC paths fail and are rejected. |
| Direct voice versus reverb | Selected held releases follow each occurrence’s changing body. Static later harmonics may be reverberation or stem residue. Full normal/reduced-speed listening is needed to settle the remaining splits. |

## Public all-word before/after ledger

All indices are zero-based. Seconds are rounded for readability; sample columns retain the exact stored integer selections. Full per-word reasons, observation ranges, model scores and uncertainties are preserved in the tracked candidate JSON. “Retained” means inspected without enough evidence for a different point, not certified perfect.

| Word ID / index / text | Onset seconds before→selected | Onset samples before→selected | Release seconds before→selected | Release samples before→selected | Decision |
| --- | --- | --- | --- | --- | --- |
|KOM-001-s01 /0 /Тот,|6.901→6.901|304330→304330|7.603→7.603|335271→335271|onset retained; release retained|
|KOM-001-s02 /1 /кто|7.603→7.603|335271→335271|8.060→8.235|355446→363164|onset retained; release changed|
|KOM-001-s03 /2 /погас,|8.284→8.284|365327→365327|9.687→9.545|427207→420934|onset retained; release changed|
|KOM-001-s04 /3 /будет|9.687→9.610|427207→423801|10.409→10.409|459032→459032|onset changed; release retained|
|KOM-001-s05 /4 /ярче|10.609→10.460|467872→461286|11.860→12.010|523026→529641|onset changed; release changed|
|KOM-001-s06 /5 /светить,|12.113→12.065|534173→532066|13.400→13.500|590940→595350|onset changed; release changed|
|KOM-001-s07 /6 /чем|13.596→13.565|599589→598216|14.080→14.110|620928→622251|onset changed; release changed|
|KOM-001-s08 /7 /кометы|14.218→14.195|626994→626000|14.999→15.215|661470→670982|onset changed; release changed|
|KOM-002-s01 /0 /Пролетающие|15.541→15.541|685374→685374|17.007→17.085|750019→753448|onset retained; release changed|
|KOM-002-s02 /1 /над|17.248→17.090|760645→753669|17.449→17.480|769501→770868|onset changed; release changed|
|KOM-002-s03 /2 /планетой|17.529→17.529|773043→773043|19.316→19.316|851856→851856|onset retained; release retained|
|KOM-003-s01 /0 /Из|21.902→21.325|965864→940432|22.062→22.100|972930→974610|onset changed; release changed|
|KOM-003-s02 /1 /пустоты|22.162→22.162|977347→977347|23.420→23.420|1032822→1032822|onset retained; release retained|
|KOM-003-s03 /2 /без|23.925→23.925|1055081→1055081|24.340→24.385|1073394→1075378|onset retained; release changed|
|KOM-003-s04 /3 /твоей|24.405→24.405|1076281→1076281|25.347→25.400|1117798→1120140|onset retained; release changed|
|KOM-003-s05 /4 /красоты|25.547→25.547|1126631→1126631|26.800→26.925|1181880→1187392|onset retained; release changed|
|KOM-003-s06 /5 /не|27.370→26.970|1207015→1189377|27.620→27.895|1218042→1230170|onset changed; release changed|
|KOM-003-s07 /6 /родится|27.951→27.925|1232632→1231492|28.880→29.145|1273608→1285294|onset changed; release changed|
|KOM-003-s08 /7 /Юности|29.814→29.715|1314782→1310432|30.615→30.675|1350116→1352768|onset changed; release changed|
|KOM-003-s09 /8 /вольная|30.695→30.695|1353649→1353649|31.436→31.436|1386333→1386333|onset retained; release retained|
|KOM-003-s10 /9 /птица|31.496→31.496|1388983→1388983|32.480→33.245|1432368→1466104|onset retained; release changed|
|KOM-004-s01 /0 /Лети|37.822→37.822|1667939→1667939|40.924→40.924|1804731→1804731|onset retained; release retained|
|KOM-004-s02 /1 /над|40.924→40.924|1804731→1804731|41.226→41.555|1818053→1832576|onset retained; release changed|
|KOM-004-s03 /2 /землёй|41.608→41.555|1834928→1832576|42.400→43.800|1869840→1931580|onset changed; release changed|
|KOM-005-s01 /0 /Словно|44.323→44.243|1954637→1951116|45.486→45.180|2005936→1992438|onset changed; release changed|
|KOM-005-s02 /1 /орёл,|45.767→45.180|2018318→1992438|47.600→47.685|2099160→2102908|onset changed; release changed|
|KOM-005-s03 /2 /словно|47.813→47.735|2108533→2105114|48.780→48.420|2151198→2135322|onset changed; release changed|
|KOM-005-s04 /3 /орёл|48.896→48.420|2156293→2135322|49.397→51.200|2178405→2257920|onset changed; release changed|
|KOM-006-s01 /0 /Свети|51.701→51.655|2280024→2277986|54.663→54.663|2410637→2410637|onset changed; release retained|
|KOM-006-s02 /1 /над|54.663→54.663|2410637→2410637|54.965→55.240|2423937→2436084|onset retained; release changed|
|KOM-006-s03 /2 /землёй|55.286→55.250|2438123→2436525|57.080→57.730|2517228→2545893|onset changed; release changed|
|KOM-007-s01 /0 /Словно|57.941→57.885|2555190→2552728|58.763→58.763|2591438→2591438|onset changed; release retained|
|KOM-007-s02 /1 /огонь,|58.763→58.763|2591438→2591438|61.200→61.270|2698920→2702007|onset retained; release changed|
|KOM-007-s03 /2 /словно|61.429→61.338|2709024→2705006|62.873→62.160|2772680→2741256|onset changed; release changed|
|KOM-007-s04 /3 /огонь|63.073→62.160|2781521→2741256|64.740→65.450|2855034→2886345|onset changed; release changed|
|KOM-008-s01 /0 /Тот,|96.721→96.721|4265383→4265383|97.503→97.503|4299893→4299893|onset retained; release retained|
|KOM-008-s02 /1 /кто|97.503→97.503|4299893→4299893|98.025→98.125|4322899→4327312|onset retained; release changed|
|KOM-008-s03 /2 /терял,|98.185→98.185|4329978→4329978|99.349→99.349|4381299→4381299|onset retained; release retained|
|KOM-008-s04 /3 /будет|99.349→99.349|4381299→4381299|100.031→100.031|4411384→4411384|onset retained; release retained|
|KOM-008-s05 /4 /снова|100.072→100.072|4413154→4413154|101.255→101.535|4465360→4477694|onset retained; release changed|
|KOM-008-s06 /5 /любить|101.657→101.615|4483058→4481222|102.460→102.535|4518486→4521794|onset changed; release changed|
|KOM-009-s01 /0 /За|102.801→102.700|4533509→4529070|103.060→103.285|4544946→4554868|onset changed; release changed|
|KOM-009-s02 /1 /рассветом|103.322→103.322|4556515→4556515|104.580→104.580|4611978→4611978|onset retained; release retained|
|KOM-009-s03 /2 /близится|105.168→105.065|4637921→4633366|105.971→105.971|4673316→4673316|onset changed; release retained|
|KOM-009-s04 /3 /вечное|106.111→106.111|4679510→4679510|106.994→106.994|4718443→4718443|onset retained; release retained|
|KOM-009-s05 /4 /лето|107.115→107.035|4723752→4720244|107.676→108.450|4748528→4782645|onset changed; release changed|
|KOM-010-s01 /0 /Ночь|110.761→110.761|4884564→4884564|111.300→111.300|4908330→4908330|onset retained; release retained|
|KOM-010-s02 /1 /до|111.342→111.342|4910202→4910202|111.640→111.855|4923324→4932806|onset retained; release changed|
|KOM-010-s03 /2 /зари,|111.924→111.895|4935840→4934570|112.760→112.760|4972716→4972716|onset changed; release retained|
|KOM-010-s04 /3 /ты|113.026→113.000|4984465→4983300|113.320→113.320|4997412→4997412|onset changed; release retained|
|KOM-010-s05 /4 /в|113.320→113.320|4997412→4997412|113.548→113.548|5007451→5007451|onset retained; release retained|
|KOM-010-s06 /5 /душе|113.548→113.548|5007451→5007451|114.280→114.445|5039748→5047024|onset retained; release changed|
|KOM-010-s07 /6 /береги|114.670→114.670|5056959→5056959|116.020→116.305|5116482→5129050|onset retained; release changed|
|KOM-010-s08 /7 /свою|116.434→116.345|5134759→5130814|117.076→117.125|5163049→5165212|onset changed; release changed|
|KOM-010-s09 /8 /птицу|117.196→117.170|5168354→5167197|118.040→118.430|5205564→5222763|onset changed; release changed|
|KOM-011-s01 /0 /Не|119.624→119.425|5275439→5266642|119.780→119.780|5282298→5282298|onset changed; release retained|
|KOM-011-s02 /1 /дай|119.826→119.826|5284306→5284306|120.368→120.275|5308250→5304128|onset retained; release changed|
|KOM-011-s03 /2 /ей|120.429→120.275|5310910→5304128|120.489→120.480|5313571→5313168|onset changed; release changed|
|KOM-011-s04 /3 /разбиться|120.489→120.489|5313571→5313571|121.615→122.500|5363231→5402250|onset retained; release changed|
|KOM-012-s01 /0 /Лети|125.384→125.275|5529440→5524628|128.646→128.325|5673302→5659132|onset changed; release changed|
|KOM-012-s02 /1 /над|128.646→128.325|5673302→5659132|128.989→129.005|5688397→5689120|onset changed; release changed|
|KOM-012-s03 /2 /землёй|129.049→129.015|5691061→5689561|130.200→131.505|5741820→5799370|onset changed; release changed|
|KOM-013-s01 /0 /Словно|131.763→131.705|5810734→5808191|132.886→132.305|5860264→5834650|onset changed; release changed|
|KOM-013-s02 /1 /орёл,|133.207→132.305|5874415→5834650|135.020→135.080|5954382→5957028|onset changed; release changed|
|KOM-013-s03 /2 /словно|135.232→135.155|5963745→5960336|136.240→135.700|6008184→5984370|onset changed; release changed|
|KOM-013-s04 /3 /орёл|136.536→135.700|6021235→5984370|137.158→138.650|6048653→6114465|onset changed; release changed|
|KOM-014-s01 /0 /Свети|139.123→139.070|6135308→6132987|142.043→142.043|6264093→6264093|onset changed; release retained|
|KOM-014-s02 /1 /над|142.043→142.043|6264093→6264093|142.405→142.645|6280056→6290644|onset retained; release changed|
|KOM-014-s03 /2 /землёй|142.686→142.655|6292471→6291086|143.580→145.125|6331878→6400012|onset changed; release changed|
|KOM-015-s01 /0 /Словно|145.381→145.305|6411303→6407950|146.263→146.263|6450215→6450215|onset changed; release retained|
|KOM-015-s02 /1 /огонь,|146.263→146.263|6450215→6450215|148.820→148.750|6562962→6559875|onset retained; release changed|
|KOM-015-s03 /2 /словно|148.870→148.750|6565181→6559875|149.933→149.480|6612052→6592068|onset changed; release changed|
|KOM-015-s04 /3 /огонь|150.074→149.480|6618243→6592068|151.618→152.330|6686338→6717753|onset changed; release changed|
|KOM-016-s01 /0 /Planet|156.802→156.802|6914952→6914952|157.447→157.447|6943401→6943401|onset retained; release retained|
|KOM-016-s02 /1 /Earth,|157.487→157.487|6945173→6945173|157.940→157.940|6965154→6965154|onset retained; release retained|
|KOM-016-s03 /2 /this|158.210→158.210|6977073→6977073|158.380→158.380|6984558→6984558|onset retained; release retained|
|KOM-016-s04 /3 /is|158.411→158.411|6985935→6985935|158.520→158.520|6990732→6990732|onset retained; release retained|
|KOM-016-s05 /4 /Captain|158.532→158.532|6991251→6991251|158.853→158.853|7005429→7005429|onset retained; release retained|
|KOM-016-s06 /5 /Adams|158.974→158.940|7010746→7009254|159.275→159.275|7024038→7024038|onset changed; release retained|
|KOM-016-s07 /6 /on|159.336→159.295|7026696→7024909|159.416→159.416|7030241→7030241|onset changed; release retained|
|KOM-016-s08 /7 /the|159.416→159.416|7030241→7030241|159.536→159.536|7035557→7035557|onset retained; release retained|
|KOM-016-s09 /8 /Serenity.|159.536→159.536|7035557→7035557|160.280→160.280|7068348→7068348|onset retained; release retained|
|KOM-017-s01 /0 /We're|161.523→161.523|7123164→7123164|161.684→161.684|7130260→7130260|onset retained; release retained|
|KOM-017-s02 /1 /receiving|161.684→161.684|7130260→7130260|162.086→162.086|7148002→7148002|onset retained; release retained|
|KOM-017-s03 /2 /a|162.126→162.126|7149776→7149776|162.180→162.180|7152138→7152138|onset retained; release retained|
|KOM-017-s04 /3 /repeated|162.187→162.187|7152437→7152437|162.609→162.609|7171066→7171066|onset retained; release retained|
|KOM-017-s05 /4 /message|162.649→162.649|7172840→7172840|163.011→163.011|7188807→7188807|onset retained; release retained|
|KOM-017-s06 /5 /from|163.052→163.052|7190581→7190581|163.172→163.172|7195903→7195903|onset retained; release retained|
|KOM-017-s07 /6 /the|163.213→163.190|7197678→7196679|163.313→163.313|7202113→7202113|onset changed; release retained|
|KOM-017-s08 /7 /Martian|163.313→163.313|7202113→7202113|163.675→163.675|7218080→7218080|onset retained; release retained|
|KOM-017-s09 /8 /surface.|163.736→163.736|7220741→7220741|164.218→164.218|7242031→7242031|onset retained; release retained|
|KOM-018-s01 /0 /Do|165.700→165.700|7307370→7307370|165.900→165.805|7316190→7312000|onset retained; release changed|
|KOM-018-s02 /1 /you|165.900→165.825|7316190→7312882|166.009→166.009|7320996→7320996|onset changed; release retained|
|KOM-018-s03 /2 /read|166.009→166.009|7320996→7320996|166.171→166.171|7328132→7328132|onset retained; release retained|
|KOM-018-s04 /3 /me?|166.191→166.191|7329024→7329024|166.500→166.500|7342650→7342650|onset retained; release retained|
|KOM-019-s01 /0 /Do|170.140→170.140|7503174→7503174|170.400→170.400|7514640→7514640|onset retained; release retained|
|KOM-019-s02 /1 /you|170.400→170.400|7514640→7514640|170.480→170.480|7518168→7518168|onset retained; release retained|
|KOM-019-s03 /2 /read|170.480→170.480|7518168→7518168|170.700→170.700|7527870→7527870|onset retained; release retained|
|KOM-019-s04 /3 /me?|170.700→170.700|7527870→7527870|171.040→171.040|7542864→7542864|onset retained; release retained|
|KOM-020-s01 /0 /Лети|173.363→173.363|7645290→7645290|176.003→176.340|7761748→7776594|onset retained; release changed|
|KOM-020-s02 /1 /над|176.003→176.340|7761748→7776594|176.587→177.060|7787498→7808346|onset changed; release changed|
|KOM-020-s03 /2 /землёй|177.131→177.090|7811471→7809669|177.680→179.665|7835688→7923226|onset changed; release changed|
|KOM-021-s01 /0 /Словно|179.840→179.705|7930950→7924991|180.783→180.350|7972538→7953435|onset changed; release changed|
|KOM-021-s02 /1 /орёл,|181.024→180.350|7983156→7953435|182.820→182.970|8062362→8068977|onset changed; release changed|
|KOM-021-s03 /2 /словно|183.103→183.020|8074862→8071182|184.000→183.700|8114400→8101170|onset changed; release changed|
|KOM-021-s04 /3 /орёл|184.411→183.700|8132522→8101170|185.260→186.765|8169966→8236336|onset changed; release changed|
|KOM-022-s01 /0 /Свети|187.122→187.065|8252087→8249566|189.063→189.985|8337677→8378339|onset changed; release changed|
|KOM-022-s02 /1 /над|189.063→189.985|8337677→8378339|190.008→190.695|8379350→8409650|onset changed; release changed|
|KOM-022-s03 /2 /землёй|190.752→190.710|8412157→8410311|191.800→193.260|8458380→8522766|onset changed; release changed|
|KOM-023-s01 /0 /Словно|193.462→193.375|8531689→8527838|194.260→194.260|8566866→8566866|onset changed; release retained|
|KOM-023-s02 /1 /огонь,|194.264→194.264|8567064→8567064|196.791→196.730|8678498→8675793|onset retained; release changed|
|KOM-023-s03 /2 /словно|196.791→196.730|8678498→8675793|197.820→197.820|8723862→8723862|onset changed; release retained|
|KOM-023-s04 /3 /огонь|197.894→197.894|8727139→8727139|199.198→200.350|8784624→8835435|onset retained; release changed|
|KOM-024-s01 /0 /Planet|235.922→235.922|10404144→10404144|236.567→236.567|10432593→10432593|onset retained; release retained|
|KOM-024-s02 /1 /Earth,|236.607→236.607|10434365→10434365|237.060→237.060|10454346→10454346|onset retained; release retained|
|KOM-024-s03 /2 /this|237.330→237.330|10466265→10466265|237.500→237.500|10473750→10473750|onset retained; release retained|
|KOM-024-s04 /3 /is|237.531→237.531|10475127→10475127|237.640→237.640|10479924→10479924|onset retained; release retained|
|KOM-024-s05 /4 /Captain|237.652→237.652|10480443→10480443|237.973→237.973|10494621→10494621|onset retained; release retained|
|KOM-024-s06 /5 /Adams|238.094→238.060|10499938→10498446|238.395→238.395|10513230→10513230|onset changed; release retained|
|KOM-024-s07 /6 /on|238.456→238.415|10515888→10514101|238.536→238.536|10519433→10519433|onset changed; release retained|
|KOM-024-s08 /7 /the|238.536→238.536|10519433→10519433|238.656→238.656|10524749→10524749|onset retained; release retained|
|KOM-024-s09 /8 /Serenity.|238.656→238.656|10524749→10524749|239.400→239.400|10557540→10557540|onset retained; release retained|
|KOM-025-s01 /0 /We're|240.643→240.643|10612356→10612356|240.804→240.804|10619452→10619452|onset retained; release retained|
|KOM-025-s02 /1 /receiving|240.804→240.804|10619452→10619452|241.206→241.206|10637194→10637194|onset retained; release retained|
|KOM-025-s03 /2 /a|241.246→241.246|10638968→10638968|241.300→241.300|10641330→10641330|onset retained; release retained|
|KOM-025-s04 /3 /repeated|241.307→241.307|10641629→10641629|241.729→241.729|10660258→10660258|onset retained; release retained|
|KOM-025-s05 /4 /message|241.769→241.769|10662032→10662032|242.131→242.131|10677999→10677999|onset retained; release retained|
|KOM-025-s06 /5 /from|242.172→242.172|10679773→10679773|242.292→242.292|10685095→10685095|onset retained; release retained|
|KOM-025-s07 /6 /the|242.333→242.310|10686870→10685871|242.433→242.433|10691305→10691305|onset changed; release retained|
|KOM-025-s08 /7 /Martian|242.433→242.433|10691305→10691305|242.795→242.795|10707272→10707272|onset retained; release retained|
|KOM-025-s09 /8 /surface.|242.856→242.856|10709933→10709933|243.338→243.338|10731223→10731223|onset retained; release retained|
|KOM-026-s01 /0 /Do|244.820→244.820|10796562→10796562|245.020→244.925|10805382→10801192|onset retained; release changed|
|KOM-026-s02 /1 /you|245.020→244.945|10805382→10802074|245.129→245.129|10810188→10810188|onset changed; release retained|
|KOM-026-s03 /2 /read|245.129→245.129|10810188→10810188|245.291→245.291|10817324→10817324|onset retained; release retained|
|KOM-026-s04 /3 /me?|245.311→245.311|10818216→10818216|245.620→245.620|10831842→10831842|onset retained; release retained|
|KOM-027-s01 /0 /Do|249.260→249.260|10992366→10992366|249.520→249.520|11003832→11003832|onset retained; release retained|
|KOM-027-s02 /1 /you|249.520→249.520|11003832→11003832|249.600→249.600|11007360→11007360|onset retained; release retained|
|KOM-027-s03 /2 /read|249.600→249.600|11007360→11007360|249.820→249.820|11017062→11017062|onset retained; release retained|
|KOM-027-s04 /3 /me?|249.820→249.820|11017062→11017062|250.160→249.960|11032056→11023236|onset retained; release changed|

## Remaining within-cue gaps

These are the selected v10 focus gaps, generated from the current sample events. They are not claims of waveform silence. Continuous handoffs selected in v5 have no gap; the three separately reviewed sonorant corrections preserve their preceding releases independently. Every boundary retains its physical rationale and uncertainty in the current source candidate.

| After / before | Selected gap (s) | Classification |
| --- | --- | --- |
|KOM-001-s02→KOM-001-s03|8.235–8.284 (0.049)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-001-s03→KOM-001-s04|9.545–9.610 (0.065)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-001-s04→KOM-001-s05|10.409–10.460 (0.051)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-001-s05→KOM-001-s06|12.010–12.065 (0.055)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-001-s06→KOM-001-s07|13.500–13.565 (0.065)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-001-s07→KOM-001-s08|14.110–14.195 (0.085)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-002-s01→KOM-002-s02|17.085–17.090 (0.005)|Prior release preserved independently; quiet next phoneme begins at its newly reviewed edge. The small neutral interval is not certified digital silence.|
|KOM-002-s02→KOM-002-s03|17.480–17.529 (0.049)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s01→KOM-003-s02|22.100–22.162 (0.062)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s02→KOM-003-s03|23.420–23.925 (0.505)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s03→KOM-003-s04|24.385–24.405 (0.020)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s04→KOM-003-s05|25.400–25.547 (0.147)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s05→KOM-003-s06|26.925–26.970 (0.045)|Prior release preserved independently; quiet next phoneme begins at its newly reviewed edge. The small neutral interval is not certified digital silence.|
|KOM-003-s06→KOM-003-s07|27.895–27.925 (0.030)|Prior release preserved independently; quiet next phoneme begins at its newly reviewed edge. The small neutral interval is not certified digital silence.|
|KOM-003-s07→KOM-003-s08|29.145–29.715 (0.570)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-003-s08→KOM-003-s09|30.675–30.695 (0.020)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-003-s09→KOM-003-s10|31.436–31.496 (0.060)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-005-s02→KOM-005-s03|47.685–47.735 (0.050)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-006-s02→KOM-006-s03|55.240–55.250 (0.010)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-007-s02→KOM-007-s03|61.270–61.338 (0.068)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-008-s02→KOM-008-s03|98.125–98.185 (0.060)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-008-s04→KOM-008-s05|100.031–100.072 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-008-s05→KOM-008-s06|101.535–101.615 (0.080)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-009-s01→KOM-009-s02|103.285–103.322 (0.037)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-009-s02→KOM-009-s03|104.580–105.065 (0.485)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-009-s03→KOM-009-s04|105.971–106.111 (0.140)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-009-s04→KOM-009-s05|106.994–107.035 (0.041)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s01→KOM-010-s02|111.300–111.342 (0.042)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s02→KOM-010-s03|111.855–111.895 (0.040)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s03→KOM-010-s04|112.760–113.000 (0.240)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s06→KOM-010-s07|114.445–114.670 (0.225)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s07→KOM-010-s08|116.305–116.345 (0.040)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-010-s08→KOM-010-s09|117.125–117.170 (0.045)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-011-s01→KOM-011-s02|119.780–119.826 (0.046)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-011-s03→KOM-011-s04|120.480–120.489 (0.009)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-012-s02→KOM-012-s03|129.005–129.015 (0.010)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-013-s02→KOM-013-s03|135.080–135.155 (0.075)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-014-s02→KOM-014-s03|142.645–142.655 (0.010)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-016-s01→KOM-016-s02|157.447–157.487 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-016-s02→KOM-016-s03|157.940–158.210 (0.270)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-016-s03→KOM-016-s04|158.380–158.411 (0.031)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-016-s04→KOM-016-s05|158.520–158.532 (0.012)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-016-s05→KOM-016-s06|158.853–158.940 (0.087)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-016-s06→KOM-016-s07|159.275–159.295 (0.020)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-017-s02→KOM-017-s03|162.086–162.126 (0.040)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-017-s03→KOM-017-s04|162.180–162.187 (0.007)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-017-s04→KOM-017-s05|162.609–162.649 (0.040)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-017-s05→KOM-017-s06|163.011–163.052 (0.040)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-017-s06→KOM-017-s07|163.172–163.190 (0.018)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-017-s08→KOM-017-s09|163.675–163.736 (0.060)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-018-s01→KOM-018-s02|165.805–165.825 (0.020)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-018-s03→KOM-018-s04|166.171–166.191 (0.020)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-020-s02→KOM-020-s03|177.060–177.090 (0.030)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-021-s02→KOM-021-s03|182.970–183.020 (0.050)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-022-s02→KOM-022-s03|190.695–190.710 (0.015)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-023-s01→KOM-023-s02|194.260–194.264 (0.004)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-023-s03→KOM-023-s04|197.820–197.894 (0.074)|Direct body attenuation/closure followed by weak residual decay or accompaniment; retained interval is not certified digital silence.|
|KOM-024-s01→KOM-024-s02|236.567–236.607 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-024-s02→KOM-024-s03|237.060–237.330 (0.270)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-024-s03→KOM-024-s04|237.500–237.531 (0.031)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-024-s04→KOM-024-s05|237.640–237.652 (0.012)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-024-s05→KOM-024-s06|237.973–238.060 (0.087)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-024-s06→KOM-024-s07|238.395–238.415 (0.020)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s02→KOM-025-s03|241.206–241.246 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s03→KOM-025-s04|241.300–241.307 (0.007)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s04→KOM-025-s05|241.729–241.769 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s05→KOM-025-s06|242.131–242.172 (0.040)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s06→KOM-025-s07|242.292–242.310 (0.018)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-025-s08→KOM-025-s09|242.795–242.856 (0.060)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-026-s01→KOM-026-s02|244.925–244.945 (0.020)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|
|KOM-026-s03→KOM-026-s04|245.291–245.311 (0.020)|Coarticulated ownership/closure remains uncertain; neutral focus interval is not certified acoustic silence.|

## Reproduction and scope

Retained diagnostic scripts and artifacts live in `analysis/acoustic/`: `analyze.py`, `batch.py`, `refine.py`, `mms.py`, `mms_reanchor.py`, `mms_transition_review.py`, `stem_candidates.py`, `radio_repeat_signal.py`, `late_alignments.py`, `onset_panels.py`, `release_panels.py`, `verse_tail_panels.py`, `release_signal_traces.py`, `build_candidate.py`, `final_review.py`, `validate_candidate.py`, `edge_comparison_chart.py`. These ignored diagnostic scripts describe the historical v3 baseline; do not run its old generator over the current reviewed candidate. The v5, v6, v7, v8, v9 and v10 selected layers are durable in `source/onset-corrections-v5.json`, `source/onset-corrections-v6.json`, `source/onset-corrections-v7.json`, `source/onset-corrections-v8.json`, `source/onset-corrections-v9.json` and `source/onset-corrections-v10.json`; `scripts/apply-reviewed-handoffs.py <review-path>` only accepts the chosen layer’s exact frozen baseline hash and refuses accidental repeat application. The current candidate is already complete; ordinary preview recovery uses `npm run prepare`, not the historical generator. Private wave/stem/model files stay out of the public source handoff.

The source candidate includes all 139 original words, stable editorial token IDs, zero-based indices, both-edge audit samples and all reasons. The public ledger above preserves the before/after decisions independently of ignored raw diagnostics. [Representative source/stem spectral comparisons](phonetic-edge-comparison.png) show the largest release changes, with previous and selected endpoints plus observed transition ranges.

Current `scripts/validate-timing-candidate.py` passed the final source/editorial/hash bindings, all 139 zero-based token mappings, sample/second consistency, ordered selected endpoints, explicit review reasons, and exact late-clip transfer with the source-fade exception. No human audio perception is claimed. No full render, Desktop modification, GitHub mutation or Actions trigger was performed.
