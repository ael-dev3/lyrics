"""Prepare model crops from the canonical editorial map without rewriting lyrics."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
editorial=json.loads((root/'source/editorial.json').read_text());recording=json.loads((root/'source/recording.json').read_text())
(root/'analysis').mkdir(exist_ok=True)
(root/'analysis/phrases.json').write_text(json.dumps({'sourceSha256':recording['sourceSha256'],'phrases':editorial['phrases']},ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(editorial['phrases']),'bounded acoustic crops; canonical editorial text retained.')
