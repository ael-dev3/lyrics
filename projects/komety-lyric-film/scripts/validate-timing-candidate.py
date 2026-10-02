"""Validate selected sample events and audit consistency, without certifying listening."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
read = lambda name: json.loads((ROOT / name).read_text())
sha = lambda name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
candidate = read('source/timing-candidate.json')
editorial = read('source/lyrics-editorial.json')
templates = {t['id']: t for t in editorial['templates']}
cues = candidate['cues']
words = [w for c in cues for w in c['words']]
rate = candidate['sampleRate']
assert rate == 44100 and candidate['sourceClockOffset'] == 0
assert candidate['decodedAnalysisSamples'] == 11469824
assert len(cues) == 27 and len(words) == 139
assert candidate['editorialSha256'] == sha('source/lyrics-editorial.json')
assert candidate['sourceSha256'] == sha('public/source.mp4')
assert not candidate['humanListeningAttested']
assert candidate['onsetReview']['unreviewedWords'] == candidate['releaseReview']['unreviewedWords'] == 0
changed_starts = sum(w['startSample'] != w['onsetAudit']['beforeSample'] for w in words)
changed_ends = sum(w['endSample'] != w['releaseAudit']['beforeSample'] for w in words)
assert candidate['onsetReview']['changedWordOnsets'] == changed_starts
assert candidate['releaseReview']['changedWordReleases'] == changed_ends
prior_end = 0
for cue in cues:
    template = templates[cue['templateId']]
    assert len(cue['words']) == len(template['sourceTokens'])
    assert cue['startSample'] == cue['words'][0]['startSample']
    assert cue['endSample'] == cue['words'][-1]['endSample']
    assert abs(cue['start'] - cue['startSample'] / rate) < 1e-8
    assert abs(cue['end'] - cue['endSample'] / rate) < 1e-8
    assert prior_end <= cue['startSample']
    prior_end = cue['endSample']
    for index, (word, token) in enumerate(zip(cue['words'], template['sourceTokens'])):
        assert word['sourceIndex'] == index
        assert word['templateTokenId'] == token['id'] and word['text'] == token['text']
        assert 0 <= word['startSample'] < word['endSample'] <= 11469824
        for edge, audit_name in [('start', 'onsetAudit'), ('end', 'releaseAudit')]:
            sample, audit = word[edge + 'Sample'], word[audit_name]
            assert abs(word[edge] - sample / rate) < 1e-8
            assert audit['selectedSample'] == sample
            assert audit['deltaSamples'] == sample - audit['beforeSample']
            assert abs(audit['selectedSeconds'] - sample / rate) < 1e-8
            assert abs(audit['deltaSeconds'] - audit['deltaSamples'] / rate) < 1e-8
        assert word['onsetAudit']['releaseSelectedSample'] == word['endSample']
        assert word['onsetReviewStatus'] != 'review-pending'
        assert word['releaseReviewStatus'] != 'review-pending'
        assert word['onsetReason'] and word['releaseReason']
        if index:
            assert cue['words'][index - 1]['endSample'] <= word['startSample']
for primary_cue, reprise_cue in zip(cues[15:19], cues[23:27]):
    for primary, reprise in zip(primary_cue['words'], reprise_cue['words']):
        assert reprise['startSample'] == primary['startSample'] + 3489192
        assert reprise['endSample'] == (11023236 if reprise['id'] == 'KOM-027-s04' else primary['endSample'] + 3489192)
digest = sha('source/timing-candidate.json')
ledger = (ROOT / 'evidence/timing-review.md').read_text()
assert digest in ledger
gap_section = ledger.split('## Remaining within-cue gaps')[1].split('## Reproduction and scope')[0]
gap_rows = {line.split('|')[1]: line.split('|')[2] for line in gap_section.splitlines() if line.startswith('|KOM-')}
selected_gaps = {}
for cue in cues:
    for prior, incoming in zip(cue['words'], cue['words'][1:]):
        if prior['endSample'] < incoming['startSample']:
            key = prior['id'] + '→' + incoming['id']
            delta = (incoming['startSample'] - prior['endSample']) / rate
            selected_gaps[key] = f"{prior['end']:.3f}–{incoming['start']:.3f} ({delta:.3f})"
assert gap_rows == selected_gaps, 'Public focus-gap ledger is stale'
visibility = read('source/line-visibility.json')
assert visibility['timingSha256'] == digest
for cue in cues:
    hold = next(v for v in visibility['cues'] if v['id'] == cue['id'])
    assert hold['bodyEndSample'] == cue['endSample']
    assert hold['holdThroughSample'] >= cue['endSample']
result = {'status': 'pass', 'timingSha256': digest, 'cueCount': len(cues), 'wordCount': len(words),
          'sampleRate': rate, 'sourceClockOffset': 0, 'changedOnsets': changed_starts, 'changedReleases': changed_ends,
          'unreviewedOnsets': 0, 'unreviewedReleases': 0, 'auditSamplesAndDeltasConsistent': True,
          'allZeroBasedTokenMappingsMatchEditorial': True, 'selectedEndpointsOrderedWithoutOverlap': True,
          'lateRepeatTransferSampleShift': 3489192, 'sourceFadeExceptionWordId': 'KOM-027-s04',
          'humanListeningAttested': False,
          'checks': ['source/editorial/hash binding', 'complete editorial mapping', 'sample/second consistency',
                     'selected/baseline audit consistency', 'ordered endpoints', 'per-word review decisions',
                     'exact late clip transfer/fade exception', 'cue-tail binding', 'public ledger binding']}
(ROOT / 'evidence/timing-candidate-validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
