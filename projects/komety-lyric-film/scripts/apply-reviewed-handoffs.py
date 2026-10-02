"""Apply explicit reviewed edges; never infer a constant shift from a model core."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
path = ROOT / 'source/timing-candidate.json'
review_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'source/onset-corrections-v5.json')
review = json.loads(review_path.read_text())
candidate = json.loads(path.read_text())
digest = hashlib.sha256(path.read_bytes()).hexdigest()
assert digest == review['baselineTimingSha256'], 'Use this review layer’s exact archived baseline; do not apply twice'
assert candidate['sourceSha256'] == review['sourceSha256']
assert candidate['sampleRate'] == review['sampleRate'] == 44100
assert not review['humanListeningAttested']
words = {w['id']: w for c in candidate['cues'] for w in c['words']}
seen = set()
for correction in review['edges']:
    identity = (correction['wordId'], correction['edge'])
    assert identity not in seen
    seen.add(identity)
    word = words[correction['wordId']]
    edge = correction['edge']
    assert edge in ('start', 'end')
    assert word[edge + 'Sample'] == correction['beforeSample']
    selected = correction['selectedSample']
    lo, hi = correction['signalIntervalSeconds']
    assert lo <= selected / 44100 <= hi
    word[edge + 'Sample'] = selected
    word[edge] = selected / 44100
    prefix = 'onset' if edge == 'start' else 'release'
    word[prefix + 'Reason'] = correction['reason']
    word[prefix + 'SignalInterval'] = [lo, hi]
    word[prefix + 'ReviewStatus'] = 'signal-inspected-connected-handoff'
    # Keep the prior model spread as an uncertainty; an inspectable interval does
    # not erase disagreement between original-mix and estimated-vocal alignment.
    word[prefix + 'UncertaintySeconds'] = max(word[prefix + 'UncertaintySeconds'], hi - lo)
    audit = word[prefix + 'Audit']
    audit.update(selectedSample=selected, selectedSeconds=selected / 44100,
                 deltaSamples=selected - audit['beforeSample'],
                 deltaSeconds=(selected - audit['beforeSample']) / 44100,
                 status=word[prefix + 'ReviewStatus'])
    word['method'] = 'Original-mix connected phonetic ownership; estimated-vocal and independent-family model comparison'
    for evidence in [str(review_path.relative_to(ROOT)), review.get('reviewDocument', 'evidence/connected-word-review.md')]:
        if evidence not in word['candidateEvidence']:
            word['candidateEvidence'].append(evidence)
for edge, records in [('start', review['retainedOnsets']), ('end', review.get('retainedReleases', []))]:
    for retained in records:
        word = words[retained['wordId']]
        assert word[edge + 'Sample'] == retained['selectedSample']
        prefix = 'onset' if edge == 'start' else 'release'
        lo, hi = retained['signalIntervalSeconds']
        assert lo <= retained['selectedSample'] / 44100 <= hi
        word[prefix + 'Reason'] = retained['reason']
        word[prefix + 'SignalInterval'] = [lo, hi]
        word[prefix + 'UncertaintySeconds'] = max(word[prefix + 'UncertaintySeconds'], hi - lo)
        word[prefix + 'ReviewStatus'] = 'signal-inspected-retained-connected-uncertainty'
        word[prefix + 'Audit']['status'] = word[prefix + 'ReviewStatus']
        evidence = str(review_path.relative_to(ROOT))
        if evidence not in word['candidateEvidence']:
            word['candidateEvidence'].append(evidence)
for cue in candidate['cues']:
    cue.update(startSample=cue['words'][0]['startSample'], endSample=cue['words'][-1]['endSample'])
    cue.update(start=cue['startSample'] / 44100, end=cue['endSample'] / 44100)
    for index, word in enumerate(cue['words']):
        assert word['startSample'] < word['endSample']
        if index:
            assert cue['words'][index - 1]['endSample'] <= word['startSample']
        word['onsetAudit']['releaseSelectedSample'] = word['endSample']
candidate['onsetReview'].update(revision=review['revision'],
    changedWordOnsets=sum(w['startSample'] != w['onsetAudit']['beforeSample'] for w in words.values()),
    connectedTransitionsReview=review.get('reviewDocument', 'evidence/connected-word-review.md'))
candidate['releaseReview'].update(revision=review['revision'],
    changedWordReleases=sum(w['endSample'] != w['releaseAudit']['beforeSample'] for w in words.values()))
candidate['methods'].append(review.get('methodSummary', 'V5 individually reviewed joined-vowel/sonorant ownership. Quiet first vowel precedes stronger consonant/stressed core; source/stem disagreement remains explicit. Preceding releases are coupled where articulation is continuous.'))
visibility_path = ROOT / 'source/line-visibility.json'
visibility = json.loads(visibility_path.read_text())
assert visibility['timingSha256'] == review['baselineTimingSha256']
for cue in candidate['cues']:
    hold = next(v for v in visibility['cues'] if v['id'] == cue['id'])
    assert hold['bodyEndSample'] == cue['endSample'], 'Cue-final release needs a fresh line-tail decision'
path.write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + '\n')
digest = hashlib.sha256(path.read_bytes()).hexdigest()
visibility.update(revision=review['revision'], timingSha256=digest)
visibility['policy']['phoneticEvents'] = 'Current reviewed source events govern lexical focus. The v4 cue-final body and neutral decay selections remain unchanged; internal word handoffs are independently refined by the named revision.'
visibility['rebindReason'] = f"All27 finalWordId/bodyEndSample pairs are identical to the v4 tail review; {review['revision']} changes only internal word ownership. Neutral holds remain acoustically scoped to the original review."
visibility_path.write_text(json.dumps(visibility, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'revision': review['revision'], 'timingSha256': digest, 'editedEdges': len(review['edges']),
    'changedOnsetsFromInitialBaseline': candidate['onsetReview']['changedWordOnsets'],
    'changedReleasesFromInitialBaseline': candidate['releaseReview']['changedWordReleases']}))
