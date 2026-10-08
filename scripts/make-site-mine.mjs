import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const htmlRoot = path.join(root, 'dist');
const publicName = 'Adeyemo Muiz Ifedayo';
const shortName = 'Ifedayo';
const footerName = 'Deft GFX';
const logoMarkup = '<img alt="Deft GFX" class="ifedayo-logo" decoding="async" loading="lazy" src="/assets/logo.png"/>';
const email = 'muizadeyemo17@gmail.com';
const github = 'https://github.com/maskid111';
const telegram = 'https://t.me/iammaskid';
const x = 'https://x.com/deft_gfx';
const whatsapp = 'https://wa.me/2348088188986';

const landingBio = 'I specialise in building digital products and experiences that combine <strong>technology, creativity, and visual communication</strong>. With experience across full-stack development, blockchain technology, graphic design, and content creation, I enjoy taking ideas from concept to execution. I’m passionate about solving problems through technology, creating intuitive and visually engaging experiences, and exploring emerging technologies to build things that are both useful and impactful. Whether I’m developing a web application, building on the blockchain, designing visual content, or creating educational and engaging content, I strive to deliver work that is thoughtful, functional, and memorable.';

const aboutBio = 'I’m a <strong>Full-Stack Developer, Blockchain Developer, Graphic Designer, and Content Creator</strong> who enjoys turning ideas into things people can actually use, see, and experience. I work across technology and design, building digital products, exploring blockchain, creating visual identities, and producing content that makes complex ideas easier to understand.<br/><br/>My journey in tech has been driven largely by curiosity and a desire to keep learning. I enjoy taking an idea, figuring out how it can work, and then bringing it to life, whether that means writing code, designing an interface, creating graphics, or experimenting with a new technology. I care about both how something works and how it looks, and I’m always looking for ways to make what I create more useful, engaging, and memorable.<br/><br/>Over time, I’ve had the opportunity to work on different kinds of projects, explore emerging technologies, and contribute to growing communities through both my technical and creative work. These experiences have helped me develop a mindset that goes beyond simply completing a project, I want to understand the problem, experiment with different approaches, and create something that genuinely adds value.<br/><br/>I’m constantly learning, building, and experimenting with new ideas. Whether I’m developing a product, working with blockchain technology, designing visuals, or creating content, my goal is to keep pushing my skills forward and <strong>build things that matter.</strong>';

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(full));
    else files.push(full);
  }
  return files;
}

function replaceBranding(html) {
  return html
    .replace(/Dawatech/g, shortName)
    .replace(/dawatech-recreation/g, 'ifedayo-portfolio')
    .replace(/dawatechonline\.com/g, 'ifedayo.dev')
    .replace(/dawatech/g, 'ifedayo')
    .replace(/Quadri Dahunsi/g, publicName)
    .replace(/Product &amp; UX Designer \| Tech Entrepreneur/g, 'Full-Stack Developer | Blockchain Developer')
    .replace(/Product\/UX Designer/g, 'Full-Stack Developer')
    .replace(/Tech Entrepreneur/g, 'Blockchain Developer')
    .replace(/Product and User Experience Designer/g, 'Full-Stack Developer')
    .replace(/hello@ifedayo\.dev/g, email)
    .replace(/hello@dawatechonline\.com/g, email)
    .replace(/https:\/\/drive\.google\.com\/file\/d\/16tqn5XDJPKU5YweTeJTOVrJeo9ifS08Q\/view\?usp=sharing/g, '#')
    .replace(/© 2026 (Ifedayo|Adeyemo Muiz Ifedayo)\. All Rights Reserved\./g, `© 2026 ${footerName}. All Rights Reserved.`);
}

function replaceLogoAndPhoto(html) {
  html = html.replace(
    /<img alt="Ifedayo" class="dark-logo" decoding="async" loading="lazy" src="\/wp-content\/uploads\/2022\/02\/logo3\.png"\/>\s*<img alt="Ifedayo" class="light-logo" decoding="async" loading="lazy" src="\/wp-content\/uploads\/2022\/02\/logo3\.png"\/>/g,
    logoMarkup,
  );
  html = html.replace(
    /<img alt="Ifedayo" class="" decoding="async" loading="lazy" src="\/wp-content\/uploads\/2022\/02\/logo3\.png"\/>/g,
    logoMarkup,
  );
  html = html.replace(/<span class="ifedayo-wordmark">Ifedayo<\/span>/g, logoMarkup);
  html = html.replace(
    /<img alt="Ifedayo" class="attachment-full size-full wp-image-5318"[^>]*\/>/g,
    '<img alt="Adeyemo Muiz Ifedayo" class="attachment-full size-full ifedayo-main-photo" decoding="async" height="837" loading="lazy" src="/assets/ifedayo.jpg" width="828"/>',
  );
  html = html.replace(
    /<img alt="Ifedayo" class="attachment-full size-full wp-image-5322"[^>]*\/>/g,
    '<img alt="Adeyemo Muiz Ifedayo" class="attachment-full size-full ifedayo-about-photo" decoding="async" fetchpriority="high" height="512" loading="lazy" src="/assets/ifedayo.jpg" width="512"/>',
  );
  html = html.replace(/(<a(?: class="logo")? href="\/" rel="home") title="Ifedayo"/g, '$1 title="Deft GFX"');
  html = html.replace(/<p class="description">Ifedayo<\/p>/g, '<p class="description">Deft GFX</p>');
  html = html.replace(/\/wp-content\/uploads\/2022\/02\/cropped-D_Fav-[^"]+\.png/g, '/assets/ifedayo.jpg');
  return html;
}

function replaceSocials(html) {
  html = html
    .replace(/href="mailto:[^"]*"/g, `href="mailto:${email}"`)
    .replace(/href="https:\/\/www\.linkedin\.com\/in\/ifedayo\/"/g, `href="${github}"`)
    .replace(/href="https:\/\/twitter\.com\/ifedayo"/g, `href="${x}"`)
    .replace(/href="https:\/\/www\.instagram\.com\/ifedayo_"/g, `href="${telegram}"`)
    .replace(/title="Linkedin"/g, 'title="GitHub"')
    .replace(/title="linkedin"/g, 'title="GitHub"')
    .replace(/title="Twitter"/g, 'title="X"')
    .replace(/title="twitter"/g, 'title="X"')
    .replace(/title="Instagram"/g, 'title="Telegram"')
    .replace(/class="linkedin"/g, 'class="github"')
    .replace(/class="twitter"/g, 'class="twitter"')
    .replace(/class="instagram"/g, 'class="telegram"')
    .replace(/<i class="feather-linkedin"><\/i>/g, '<i class="feather-github"></i>')
    .replace(/<i class="fab fa-linkedin-in"><\/i>/g, '<i class="fab fa-github"></i>')
    .replace(/<i class="feather-instagram"><\/i>/g, '<i class="feather-send"></i>')
    .replace(/<i class="fab fa-instagram"><\/i>/g, '<i class="fab fa-telegram-plane"></i>');
  return html;
}

function addWhatsApp(html) {
  const whatsappItem = `<li class="single-item">
<a href="${whatsapp}" target="_blank" title="WhatsApp">
<i class="fab fa-whatsapp"></i></a>
</li>`;
  const whatsappSkillItem = `<li class="single-item">
<a href="${whatsapp}" target="_blank" title="WhatsApp"> <i class="fab fa-whatsapp"></i> </a> </li>`;

  html = html.replace(/<li class="single-item">\s*<a href="https:\/\/wa\.me\/2348088188986"[\s\S]*?<\/li>/g, '');
  html = html.replace(
    /(<ul class="social-share d-flex liststyle">[\s\S]*?<a href="https:\/\/t\.me\/iammaskid"[\s\S]*?<\/li>)/g,
    `$1\n${whatsappItem}`,
  );
  html = html.replace(
    /(<ul class="social-share skill-share [^"]*">[\s\S]*?<a href="https:\/\/t\.me\/iammaskid"[\s\S]*?<\/li>)/g,
    `$1\n${whatsappSkillItem}`,
  );

  return html;
}

function replacePageCopy(html, file) {
  if (file.endsWith(path.join('dist', 'index.html'))) {
    html = html.replace(/<span class="subtitle">[\s\S]*?<\/span>/, '<span class="subtitle">Hi there! 👋</span>');
    html = html.replace(/<h1 class="title">[\s\S]*?<\/h1>/, `<h1 class="title">I’m <span>${publicName}</span><br/>
<span class="header-caption">
<span class="cd-headline clip is-full-width">
<span>a </span>
<span class="cd-words-wrapper">
<b class="is-visible">Full-Stack Developer</b>
<b class="is-hidden">Blockchain Developer</b>
<b class="is-hidden">Graphic Designer</b>
<b class="is-hidden">Content Creator</b>
</span>
</span>
</span>
</h1>`);
    html = html.replace(/<p class="description"><span>[\s\S]*?<\/span><\/p>/, `<p class="description"><span>${landingBio}</span></p>`);
    html = html.replace(/"post":\{"id":7,"title":"[^"]+"/, '"post":{"id":7,"title":"Adeyemo%20Muiz%20Ifedayo%20%E2%80%93%20Full-Stack%20Developer%20%7C%20Blockchain%20Developer"');
  }

  if (file.endsWith(path.join('about', 'index.html'))) {
    html = html.replace(/<p class="p1">[\s\S]*?<\/p>\s*<\/div>/, `<p class="p1">${aboutBio}</p> </div>`);
    html = html.replace(/<div class="button-group text-left">\s*<a class="rn-btn rbbtn rn-single btn-medium shadow-has" href="#" target="_blank"> DOWNLOAD MY CV<\/a>\s*<\/div>/, '<div class="button-group text-left ifedayo-hidden-cv"></div>');
    html = html.replace(/"post":\{"id":3730,"title":"[^"]+"/, '"post":{"id":3730,"title":"About%20%E2%80%93%20Adeyemo%20Muiz%20Ifedayo"');
  }
  return html;
}

function addPersonalCss(html) {
  if (!html.includes('/assets/ifedayo-personal.css')) {
    html = html.replace('</head>', '<link href="/assets/ifedayo-personal.css" rel="stylesheet"/>\n</head>');
  }
  return html;
}

function getPageSlug(file) {
  if (file.endsWith(path.join('dist', 'index.html'))) return 'home';
  if (file.endsWith(path.join('about', 'index.html'))) return 'about';
  if (file.endsWith(path.join('projects', 'index.html'))) return 'projects';
  if (file.endsWith(path.join('contact', 'index.html'))) return 'contact';
  return '';
}

function navItem(slug, label, href, activeSlug) {
  const activeClass = slug === activeSlug ? ' current-menu-item' : '';
  const aria = slug === activeSlug ? ' aria-current="page"' : '';
  const ids = {
    home: '5229',
    projects: '5231',
    contact: '5234',
    about: '5230',
  };

  return `<li class="menu-item menu-item-type-custom menu-item-object-custom${activeClass} menu-item-${ids[slug]}" id="menu-item-${ids[slug]}"><a${aria} href="${href}">${label}</a></li>`;
}

function navItemMobile(slug, label, href, activeSlug) {
  return navItem(slug, label, href, activeSlug).replace(/ id="menu-item-\d+"/, '');
}

function replaceNavigation(html, file) {
  const activeSlug = getPageSlug(file);
  const items = [
    ['home', 'Home', '/'],
    ['projects', 'Projects', '/projects/'],
    ['contact', 'Contact', '/contact/'],
    ['about', 'About Me', '/about/'],
  ];

  const desktopItems = items.map(([slug, label, href]) => navItem(slug, label, href, activeSlug)).join('\n');
  const mobileItems = items.map(([slug, label, href]) => navItemMobile(slug, label, href, activeSlug)).join('\n');

  html = html.replace(
    /<nav class="mainmenu-nav navbar-example2 d-none d-xl-block" id="(?:onepagenav|sideNav)"><ul class="primary-menu nav nav-pills onepagenav" id="menu-nav-menu">[\s\S]*?<\/ul><\/nav>/,
    `<nav class="mainmenu-nav navbar-example2 d-none d-xl-block" id="sideNav"><ul class="primary-menu nav nav-pills onepagenav" id="menu-nav-menu">${desktopItems}</ul></nav>`,
  );
  html = html.replace(
    /<nav class="mainmenu-nav navbar-example2(?: d-xl-block)?"(?: id="sideNavMobile")?><ul class="primary-menu nav nav-pills(?: onepagenav)?" id="menu-nav-menu-1">[\s\S]*?<\/ul><\/nav>/,
    `<nav class="mainmenu-nav navbar-example2"><ul class="primary-menu nav nav-pills" id="menu-nav-menu-1">${mobileItems}</ul></nav>`,
  );

  return html;
}

function removeBreadcrumb(html) {
  return html.replace(
    /<div class="breadcrumb-area rn-section-gap breadcrumb-style-one">\s*<div class="plr--45">[\s\S]*?<ul class="page-list" id="breadcrumbs">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*/g,
    '',
  );
}

function addProjectsHeading(html, file) {
  if (!file.endsWith(path.join('projects', 'index.html'))) return html;

  const heading = `<div class="section-title text-center ifedayo-projects-page-heading" data-aos="fade-up" data-aos-delay="100" data-aos-duration="500" data-aos-once="true">
<h2 class="title sec-title">Featured Work</h2>
</div>`;

  html = html.replace(
    /<div class="section-title text-center ifedayo-projects-page-heading"[\s\S]*?<\/div>\s*(?=<div class="row row--40">)/,
    '',
  );

  return html.replace(
    '<div class="portfolio-style-three rainbow-blog-area rn-section-gap">\n<div class="container">',
    `<div class="portfolio-style-three rainbow-blog-area rn-section-gap">\n<div class="container">\n${heading}`,
  );
}

const htmlFiles = (await listFiles(htmlRoot)).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  html = replaceBranding(html);
  html = replaceLogoAndPhoto(html);
  html = replaceSocials(html);
  html = addWhatsApp(html);
  html = replacePageCopy(html, file);
  html = replaceNavigation(html, file);
  html = removeBreadcrumb(html);
  html = addProjectsHeading(html, file);
  html = html.replace(/#f26343/g, '#2563eb').replace(/#f76a53/g, '#2563eb');
  html = addPersonalCss(html);
  await writeFile(file, html);
}

const jsFiles = [
  'src/app/services.js',
  'src/app/interactions.js',
  'dist/app/services.js',
  'dist/app/interactions.js',
].map(file => path.join(root, file));

for (const file of jsFiles) {
  const before = await readFile(file, 'utf8');
  const after = before
    .replace(/hello@dawatechonline\.com/g, email)
    .replace(/Request a password from the designer\./g, `Request access from ${shortName}.`)
    .replace(/#f76a53/g, '#2563eb');
  await writeFile(file, after);
}

const packagePath = path.join(root, 'package.json');
const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
pkg.name = 'ifedayo-portfolio';
await writeFile(packagePath, `${JSON.stringify(pkg)}\n`);
