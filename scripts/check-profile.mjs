import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const html=fs.readFileSync('site/index.html','utf8');
const resume=fs.readFileSync('site/resume.html','utf8');
const readme=fs.readFileSync('README.md','utf8');
for(const name of ['Operation Evolve','Collaborative AI','FIZI','SplitPlan'])assert(html.includes(name)&&readme.includes(name)&&resume.includes(name),`Missing project ${name}`);
assert(!/Sushmita|Dasari|PolicyGuard|StarCloset|9\.10|Technical Hub|Aditya|Flipkart|Myntra/i.test(html+readme+resume),'Reference identity remains in active profile');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
for(const [filename,text]of [['site/index.html',html],['README.md',readme]])for(const m of text.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=m[1];if(/^(https?:|mailto:|data:)/.test(ref))continue;const target=path.join(path.dirname(filename),ref.split('#')[0]);assert(fs.existsSync(target),`Missing ${target}`)}
for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),`Broken anchor ${m[1]}`);
const data=JSON.parse(fs.readFileSync('site/data/contributions.json','utf8'));assert.equal(data.login,'MaheshChalla2701');assert(data.days.length>300);assert.equal(data.total,data.days.reduce((n,d)=>n+d.count,0));
assert.equal((html.match(/class="case"/g)||[]).length,4);
console.log('PASS: four projects, profile identity, unique IDs, local assets, anchors and real contribution totals.');
