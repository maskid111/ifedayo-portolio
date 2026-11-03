import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { builtInProjects } from '../src/app/project-catalog.js';

const root = process.cwd();

const projects = builtInProjects.map(project => ({
 slug:project.id, name:project.name, url:project.liveUrl, type:project.category,
 summary:project.description, tone:project.tone,
}));

function card(project, index, mode) {
  const column = mode === 'home'
    ? 'col-lg-6 col-md-6 col-sm-12 col-12 mt--50 mt_md--30 mt_sm--30 rb-items preview-type-image'
    : 'col-lg-6 col-md-6 col-sm-12 col-12 rainbow-items mt--50 mt_md--30 mt_sm--30 preview-type-image faridmiatesting';
  const label = String(index + 1).padStart(2, '0');

  return `<div class="${column}">
<div class="rn-portfolio ifedayo-project-card">
<div class="inner">
<span class="preview-type"><i class="feather-external-link"></i></span>
<div class="thumbnail">
<a href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project.name}">
<div class="ifedayo-project-thumb ifedayo-tone-${project.tone}">
<img class="ifedayo-project-preview" src="/assets/project-previews/${project.slug}.png" alt="${project.name} website preview" loading="lazy"/>
<div class="ifedayo-project-overlay">
<span>${label}</span>
<strong>${project.name}</strong>
<small>${project.type}</small>
</div>
</div>
</a>
</div>
<div class="content">
<div class="category-info">
<div class="category-list">
<span>${project.type}</span>
</div>
</div>
<h4 class="title">
<a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name} <i class="feather-arrow-up-right"></i></a>
</h4>
<p class="ifedayo-project-summary">${project.summary}</p>
</div>
</div>
</div>
</div>`;
}

function findMatchingDivClose(html, start) {
  const token = /<\/?div\b[^>]*>/gi;
  token.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = token.exec(html))) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) return { start: match.index, end: token.lastIndex };
  }
  throw new Error('Could not find matching closing div.');
}

function replaceDivContents(html, startMarker, replacement) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing marker: ${startMarker}`);
  const contentStart = start + startMarker.length;
  const close = findMatchingDivClose(html, start);
  return `${html.slice(0, contentStart)}\n${replacement}\n${html.slice(close.start)}`;
}

const homePath = path.join(root, 'dist', 'index.html');
let home = await readFile(homePath, 'utf8');
home = home.replace(/data-post_ids="\[[^\]]+\]"/, 'data-post_ids="[aimabluxe,teamzadore,maskid,malete]"');
home = home.replace(/"posts_per_page":6/, '"posts_per_page":4');
home = replaceDivContents(
  home,
  '<div class="row menu-list row--25 rbt-portfolio-replace-area">',
  projects.slice(0, 4).map((project, index) => card(project, index, 'home')).join('\n'),
);
await writeFile(homePath, home);

const projectsPath = path.join(root, 'dist', 'projects', 'index.html');
let projectPage = await readFile(projectsPath, 'utf8');
projectPage = replaceDivContents(
  projectPage,
  '<div class="row row--25">',
  projects.map((project, index) => card(project, index, 'projects')).join('\n'),
);
await writeFile(projectsPath, projectPage);
