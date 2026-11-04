import fs from 'node:fs';
import assert from 'node:assert/strict';

// The portfolio is the source of truth for the GitHub profile's content.
const html = fs.readFileSync('site/index.html', 'utf8');
const text = (value) => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const one = (source, pattern) => {
  const match = source.match(pattern);
  assert(match, `Portfolio markup no longer matches ${pattern}`);
  return match[1];
};
const all = (source, pattern) => [...source.matchAll(pattern)].map(match => match[1]);
const section = (id) => one(html, new RegExp(`<section\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)</section>`));
const paragraphs = (source) => all(source, /<p\b[^>]*>([\s\S]*?)<\/p>/g).map(text);
const title = (source) => text(one(source, /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/));
const xml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const outputs = new Map();
const banner = (slug, number, label, subtitle) => {
  const file = `assets/mahesh-title-${slug}.svg`;
  outputs.set(file, `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="100" viewBox="0 0 1200 100"><rect width="1200" height="100" rx="16" fill="#111b23"/><path d="M44 25V75M44 50H80" stroke="#a6dab6" stroke-width="3"/><text x="108" y="39" fill="#a6dab6" font-family="Arial,sans-serif" font-size="13" letter-spacing="3">${number} / ${xml(label.toUpperCase())}</text><text x="108" y="73" fill="#f4f1e8" font-family="Georgia,serif" font-size="28">${xml(subtitle)}</text></svg>\n`);
  return `<img src="${file}" width="100%" alt="${label} — ${xml(subtitle)}">`;
};
const portfolio = 'https://maheshchalla2701.github.io/MaheshChalla2701/';
const parts = [
  '<!-- Generated from site/index.html by npm run readme. Edit the portfolio, then regenerate. -->',
  `<a href="${portfolio}"><img src="assets/mahesh-hero.png" width="100%" alt="Hello, I’m Mahesh Challa — AI and Mobile Developer. Portrait and hero from my portfolio."></a>`,
  '# Mahesh Challa',
  '**AI & Mobile Developer · Building useful intelligence**',
  text(one(html, /<p class="hero__lede"[^>]*>([\s\S]*?)<\/p>/)),
  `[Portfolio](${portfolio}) · [Resume](${portfolio}resume.html) · [LinkedIn](https://www.linkedin.com/in/mahesh-challa/) · [Email](mailto:mahesh.ch0127@gmail.com)`,
  '[About](#01--about) · [Recognition](#02--recognition) · [Projects](#03--selected-work) · [Toolkit](#04--toolkit) · [Activity](#05--activity) · [Education](#06--education) · [Connect](#07--connect)',
  '## 01 · About', banner('about', '01', 'About', title(section('about'))),
  ...paragraphs(one(section('about'), /<div class="about__intro"[^>]*>([\s\S]*?)<\/div>/)),
];
for (const principle of all(section('about'), /<li class="principle"[^>]*>([\s\S]*?)<\/li>/g)) {
  parts.push(`- **${title(principle)}.** ${paragraphs(principle).join(' ')}`);
}
parts.push('## 02 · Recognition', banner('recognition', '02', 'Recognition', title(section('achievements'))));
for (const honor of all(section('achievements'), /<div class="honor__body">([\s\S]*?)<\/div>/g)) {
  parts.push(`- **${title(honor)}.** ${paragraphs(honor).join(' ')}`);
}
parts.push('## 03 · Selected work', banner('work', '03', 'Selected work', title(section('projects'))));
const projects = [...section('projects').matchAll(/<article class="case" id="project-([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
assert.deepEqual(projects.map(match => match[1]), ['fizi', 'splitplan', 'evolve', 'council']);
for (const [, slug, project] of projects) {
  const name = title(project);
  const links = [...one(project, /<div class="case__links">([\s\S]*?)<\/div>/).matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(match => `[${text(match[2])}](${match[1]})`).join(' · ');
  parts.push(`### ${name}`, `<img src="assets/mahesh-project-${slug}.svg" width="100%" alt="${name} architecture">`,
    `**${text(one(project, /<p class="case__problem">([\s\S]*?)<\/p>/))}**`,
    ...paragraphs(one(project, /<details\b[^>]*>([\s\S]*?)<\/details>/)),
    `**Built with:** ${all(one(project, /<ul class="tags"[^>]*>([\s\S]*?)<\/ul>/), /<li>([\s\S]*?)<\/li>/g).map(text).join(' · ')}`, links);
}
parts.push('## 04 · Toolkit', banner('toolkit', '04', 'Toolkit', title(section('skills'))));
for (const panel of all(section('skills'), /<div class="panel"[^>]*>([\s\S]*?)<\/div>/g)) {
  parts.push(`### ${title(panel)}`);
  for (const match of panel.matchAll(/<button\b[^>]*data-note="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)) {
    parts.push(`- **${text(match[2]).replace('CNN / ANN', 'CNN, ANN')}** — ${text(match[1])}`);
  }
}
parts.push('## 05 · Activity', banner('activity', '05', 'Activity', title(section('activity'))),
  '<img src="assets/contribution-snake.svg" width="100%" alt="Mahesh Challa’s public GitHub contribution calendar, refreshed daily">',
  '[View my GitHub activity](https://github.com/MaheshChalla2701?tab=overview)');
parts.push('## 06 · Education', banner('education', '06', 'Education', 'Learning, building, evolving.'));
const education = one(section('about'), /<dl class="facts"[^>]*>([\s\S]*?)<\/dl>/);
for (const fact of all(education, /<div>([\s\S]*?)<\/div>/g)) {
  parts.push(`- **${text(one(fact, /<dt[^>]*>([\s\S]*?)<\/dt>/))}:** ${text(one(fact, /<dd>([\s\S]*?)<\/dd>/))}`);
}
parts.push('## 07 · Connect', banner('connect', '07', 'Connect', 'Let’s build something worth explaining.'),
  text(one(section('contact'), /<p class="contact__lede"[^>]*>([\s\S]*?)<\/p>/)),
  '[Email](mailto:mahesh.ch0127@gmail.com) · [LinkedIn](https://www.linkedin.com/in/mahesh-challa/) · [GitHub](https://github.com/MaheshChalla2701)',
  '<img src="assets/mahesh-footer.svg" width="100%" alt="Mahesh Challa — Build. Learn. Evolve.">');
outputs.set('README.md', parts.join('\n\n') + '\n');
for (const [file, content] of outputs) {
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), content, `${file} is out of sync. Run npm run readme.`);
  else fs.writeFileSync(file, content);
}
console.log(process.argv.includes('--check') ? 'PASS: README and section banners match the portfolio.' : 'Generated README and seven section banners from the portfolio.');
