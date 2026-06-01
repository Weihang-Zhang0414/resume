const fs = require('fs');
const path = './public/data/portfolio.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

if (data.education) {
  data.education.forEach(edu => {
    if (edu.awards && !Array.isArray(edu.awards)) {
      const enAwards = edu.awards.en || [];
      const zhAwards = edu.awards.zh || [];
      const newAwards = [];
      const maxLength = Math.max(enAwards.length, zhAwards.length);
      for (let i = 0; i < maxLength; i++) {
        newAwards.push({
          en: enAwards[i] || '',
          zh: zhAwards[i] || '',
          certificate: edu.awardCertificates ? (edu.awardCertificates[i] || '') : ''
        });
      }
      edu.awards = newAwards;
    }
  });
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('portfolio.json updated.');
