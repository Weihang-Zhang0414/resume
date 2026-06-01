import json
import os

path = './public/data/portfolio.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'education' in data:
    for edu in data['education']:
        if 'awards' in edu and not isinstance(edu['awards'], list):
            en_awards = edu['awards'].get('en', [])
            zh_awards = edu['awards'].get('zh', [])
            certs = edu.get('awardCertificates', [])
            new_awards = []
            max_len = max(len(en_awards), len(zh_awards))
            for i in range(max_len):
                new_awards.append({
                    'en': en_awards[i] if i < len(en_awards) else '',
                    'zh': zh_awards[i] if i < len(zh_awards) else '',
                    'certificate': certs[i] if i < len(certs) else ''
                })
            edu['awards'] = new_awards
            # We can also keep awardCertificates since it is used as a pool of available certificates in MediaUploadManager
            # But the 'certificate' field on each award points to the filename

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Migration successful.")
