import { migrateBuiltInProjects } from './project-migration.js';
const $ = selector => document.querySelector(selector);
const form = $('#projectForm');
const dialog = $('#projectDialog');
const nav = [...document.querySelectorAll('[data-view]')];
let firebase, activeUser, projects = [], messages = [], unsubscribers = [], noticeTimer;
let projectsLoaded = false, messagesLoaded = false;

function escapeHtml(value) {
 return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function notify(message, error = false) {
 const notice = $('#notice');
 notice.textContent = message; notice.classList.toggle('error', error); notice.hidden = false;
 clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { notice.hidden = true; }, error ? 10000 : 5000);
}
function errorMessage(error) {
 const code = error?.code || '';
 if (code.includes('unauthorized-domain')) return 'This domain needs to be added to Firebase Authentication → Settings → Authorized domains.';
 if (code.includes('popup-blocked')) return 'Your browser blocked Google sign-in. Allow popups for this site and try again.';
 if (code.includes('permission-denied')) return 'Access was denied. Check the signed-in admin account and your deployed Firestore rules.';
 if (code.includes('network') || code.includes('unavailable')) return 'The connection was interrupted. Check your internet connection and try again.';
 if (code.includes('operation-not-allowed')) return 'Enable Google sign-in in your Firebase Authentication settings.';
 return 'Something went wrong. Please try again. ' + (code ? '(' + code + ')' : '');
}
function safeUrl(value) {
 try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
function safePreview(value) {
 return /^\/assets\/project-previews\/[a-z0-9-]+\.png$/.test(value || '') ? value : safeUrl(value);
}
function setView(view) {
 const inbox = view === 'messages';
 $('#projectsView').hidden = inbox; $('#messagesView').hidden = !inbox;
 $('#pageTitle').textContent = inbox ? 'Let’s talk possibilities.' : 'Project library';
 $('#pageDescription').textContent = inbox ? 'New ideas, new collaborations, new conversations.' : 'A home for everything you’re building.';
 $('#breadcrumb').textContent = inbox ? 'Inbox' : 'Projects';
 $('#addProjectBtn').hidden = inbox;
 nav.forEach(button => { const selected = button.dataset.view === view; button.classList.toggle('active', selected); if(selected) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current'); });
}
function stats() {
 $('#totalStat').textContent = projectsLoaded ? projects.length : '—';
 $('#featuredStat').textContent = projectsLoaded ? projects.filter(p => p.featured && p.published !== false).length : '—';
 $('#publishedStat').textContent = projectsLoaded ? projects.filter(p => p.published !== false).length : '—';
 $('#unreadStat').textContent = messagesLoaded ? messages.filter(m => m.status !== 'read').length : '—';
 $('#navProjectCount').textContent = projectsLoaded ? projects.length : '—';
 $('#navUnreadCount').textContent = $('#unreadStat').textContent;
}
function renderProjects() {
 const search = $('#projectSearch').value.trim().toLowerCase(), filter = $('#projectFilter').value;
 const visible = projects.filter(p => (p.name + ' ' + p.category + ' ' + p.description).toLowerCase().includes(search) && (filter === 'all' || filter === 'featured' && p.featured || filter === 'published' && p.published !== false || filter === 'draft' && p.published === false));
 $('#projectCount').textContent = projects.length;
 $('#projectsList').innerHTML = visible.map(project => {
  const url = safeUrl(project.liveUrl || project.url), preview = safePreview(firebase.previewUrlFor(project));
  return '<article class="project-card"><div class="project-image"><img loading="lazy" alt="' + escapeHtml(project.name) + ' website preview" src="' + escapeHtml(preview) + '"/><span class="visibility ' + (project.published === false ? 'draft' : '') + '">' + (project.published === false ? 'Draft' : '● Published') + '</span></div><div class="project-body"><p class="project-category">' + escapeHtml(project.category || 'Project') + '</p><h3>' + escapeHtml(project.name) + '</h3><p class="project-description">' + escapeHtml(project.description) + '</p><div class="project-meta"><span>Order ' + escapeHtml(project.order ?? 0) + '</span>' + (project.featured ? '<span class="featured-tag">✳ Featured</span>' : '') + (url ? '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">Visit site ↗</a>' : '') + '</div></div><div class="card-footer"><button type="button" class="text-button" data-edit="' + escapeHtml(project.id) + '">Edit project ↗</button><button type="button" class="text-button danger" data-delete="' + escapeHtml(project.id) + '">Delete</button></div></article>';
 }).join('') || '<div class="empty-state"><strong>' + (projects.length ? 'No matching projects' : 'Your next great project goes here.') + '</strong>' + (projects.length ? 'Try another search or filter.' : 'Add your first project using the button above. Published projects will appear on your portfolio.') + '</div>';
 $('#projectsList').querySelectorAll('img').forEach(img => img.addEventListener('error', () => { const fallback = document.createElement('div'); fallback.className = 'image-fallback'; fallback.innerHTML = '<span aria-hidden="true">↗</span>Preview unavailable'; img.replaceWith(fallback); }, {once:true}));
 stats();
}
function renderMessages() {
 const filter = $('#messageFilter').value;
 const visible = messages.filter(m => filter === 'all' || (m.status === 'read' ? 'read' : 'unread') === filter);
 $('#messageCount').textContent = messages.length;
 $('#messagesList').innerHTML = visible.map(message => {
  const date = message.createdAt?.toDate?.();
  const dateText = date ? new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(date) : 'Just now';
  const email = String(message.email || '');
  const reply = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'mailto:' + encodeURIComponent(email) : '';
  return '<article class="message-card ' + (message.status === 'read' ? 'read' : '') + '"><div class="message-heading"><h3>' + escapeHtml(message.subject || 'A new conversation') + '</h3><span class="message-date">' + escapeHtml(dateText) + '</span></div><p class="message-sender"><strong>' + escapeHtml(message.name || 'Visitor') + '</strong> · ' + escapeHtml(email) + '</p><p class="message-copy">' + escapeHtml(message.message) + '</p><div class="message-actions">' + (reply ? '<a class="text-button" href="' + escapeHtml(reply) + '">Reply by email ↗</a>' : '') + '<button type="button" class="text-button" data-read="' + escapeHtml(message.id) + '">' + (message.status === 'read' ? 'Mark unread' : 'Mark read') + '</button><button type="button" class="text-button danger" data-message-delete="' + escapeHtml(message.id) + '">Delete</button></div></article>';
 }).join('') || '<div class="empty-state"><strong>' + (messages.length ? 'All caught up.' : 'The start of something good.') + '</strong>' + (messages.length ? 'No messages match this filter.' : 'Messages sent through your contact form will appear here.') + '</div>';
 stats();
}
function openEditor(project) {
 form.reset(); form.elements.id.value = project?.id || '';
 form.elements.order.value = project?.order ?? (projects.length ? Math.max(...projects.map(p => Number(p.order) || 0)) + 1 : 0);
 form.elements.published.value = project?.published === false ? 'false' : 'true';
 for(const field of ['name','category','description','liveUrl','previewUrl']) form.elements[field].value = project?.[field] || (field === 'liveUrl' ? project?.url : '') || '';
 form.elements.featured.checked = !!project?.featured;
 $('#formTitle').textContent = project ? 'Edit project' : 'Add project';
 $('#formError').hidden = true;
 form.querySelector('details').open = !!project?.previewUrl;
 dialog.showModal();
}
async function action(button, work, success) {
 if (!activeUser || !firebase?.isAdmin(activeUser)) return;
 button.disabled = true;
 try { await work(); notify(success); } catch(error) { notify(errorMessage(error), true); } finally {button.disabled = false;}
}
function stopListening() { unsubscribers.forEach(unsubscribe => unsubscribe()); unsubscribers = []; }
function clearSession() {
 stopListening(); projects = []; messages = []; projectsLoaded = false; messagesLoaded = false;
 $('#projectsList').innerHTML = '<p class="empty-state">Loading your projects…</p>';
 $('#messagesList').innerHTML = '<p class="empty-state">Loading your messages…</p>';
 $('#projectCount').textContent = '—'; $('#messageCount').textContent = '—'; stats();
 if(dialog.open) dialog.close();
}
function listen() {
 const {onSnapshot, query, collection, db, orderBy} = firebase;
 unsubscribers = [
  onSnapshot(query(collection(db,'projects'),orderBy('order','asc')), snapshot => { projectsLoaded = true; projects = snapshot.docs.map(item => ({...item.data(), id:item.id})); renderProjects(); }, error => {$('#projectsList').innerHTML = '<p class="empty-state">Projects could not be loaded. Check your connection and database access, then refresh.</p>'; notify(errorMessage(error), true);}),
  onSnapshot(query(collection(db,'messages'),orderBy('createdAt','desc')), snapshot => { messagesLoaded = true; messages = snapshot.docs.map(item => ({...item.data(), id:item.id})); renderMessages(); }, error => {$('#messagesList').innerHTML = '<p class="empty-state">Messages could not be loaded. Check your connection and database access, then refresh.</p>'; notify(errorMessage(error), true);})
 ];
}
async function startWorkspace(user) {
 const status = $('#catalogStatus'), retry = $('#retryCatalogBtn');
 stopListening();
 status.hidden = false; retry.hidden = true;
 $('#catalogStatusText').textContent = 'Bringing your existing website projects into the studio…';
 $('#addProjectBtn').disabled = true;
 try {
  const count = await migrateBuiltInProjects(firebase, user);
  if (activeUser !== user) return;
  status.hidden = true;
  $('#addProjectBtn').disabled = false;
  if(count) notify(count + ' existing website projects are now ready to manage.');
 } catch(error) {
  if (activeUser !== user) return;
  $('#catalogStatusText').textContent = 'Your existing projects could not be imported. ' + errorMessage(error);
  retry.hidden = false;
 }
 if (activeUser === user) listen();
}
$('#retryCatalogBtn').addEventListener('click', () => {if(activeUser && firebase.isAdmin(activeUser)) startWorkspace(activeUser);});
nav.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$('#projectSearch').addEventListener('input', renderProjects);
$('#projectFilter').addEventListener('change', renderProjects);
$('#messageFilter').addEventListener('change', renderMessages);
$('#addProjectBtn').addEventListener('click', () => openEditor());
$('#closeProjectBtn').addEventListener('click', () => dialog.close());
$('#resetProjectBtn').addEventListener('click', () => dialog.close());
dialog.addEventListener('cancel', event => {if($('#saveProjectBtn').disabled) event.preventDefault();});
$('#projectsList').addEventListener('click', async event => {
 const edit = event.target.closest('[data-edit]'), remove = event.target.closest('[data-delete]');
 if(edit) openEditor(projects.find(p => p.id === edit.dataset.edit));
 if(remove) { const project = projects.find(p => p.id === remove.dataset.delete); if(confirm('Delete “' + project.name + '”? This cannot be undone.')) await action(remove, () => firebase.deleteDoc(firebase.doc(firebase.db,'projects',project.id)), 'Project deleted.'); }
});
$('#messagesList').addEventListener('click', async event => {
 const read = event.target.closest('[data-read]'), remove = event.target.closest('[data-message-delete]');
 if(read) {const message = messages.find(m => m.id === read.dataset.read); await action(read, () => firebase.updateDoc(firebase.doc(firebase.db,'messages',message.id), {status:message.status === 'read' ? 'unread' : 'read'}), 'Message updated.');}
 if(remove && confirm('Delete this message? This cannot be undone.')) await action(remove, () => firebase.deleteDoc(firebase.doc(firebase.db,'messages',remove.dataset.messageDelete)), 'Message deleted.');
});
form.addEventListener('submit', async event => {
 event.preventDefault();
 if(!activeUser || !firebase?.isAdmin(activeUser) || $('#saveProjectBtn').disabled) return;
 const data = Object.fromEntries(new FormData(form)), editing = !!data.id;
 const liveUrl = safeUrl(data.liveUrl), previewUrl = data.previewUrl.trim() ? safeUrl(data.previewUrl) : '';
 const error = $('#formError');
 if(!liveUrl || data.previewUrl.trim() && !previewUrl) { error.textContent = 'Please use a complete HTTPS link, starting with https://.'; error.hidden = false; return; }
 const order = Number(data.order);
 if(!Number.isSafeInteger(order) || order < 0) {error.textContent='Display order must be a whole number, zero or greater.'; error.hidden=false; return;}
 const name=data.name.trim(), category=data.category.trim(), description=data.description.trim();
 if(!name || !category || !description) {error.textContent='Please complete the project name, category, and description.'; error.hidden=false; return;}
 const {doc,collection,db,serverTimestamp,setDoc} = firebase;
 const reference = editing ? doc(db,'projects',data.id) : doc(collection(db,'projects'));
 const payload = {name, category, description, liveUrl, previewUrl, order, featured:form.elements.featured.checked, published:data.published==='true',updatedAt:serverTimestamp(),updatedBy:activeUser.email};
 const existing = projects.find(project => project.id === data.id);
 if(existing?.previewPath && safeUrl(existing.liveUrl || existing.url) !== liveUrl) payload.previewPath = '';
 if(!editing) payload.createdAt = serverTimestamp();
 const save = $('#saveProjectBtn'); save.disabled = true; save.textContent = 'Saving…'; $('#closeProjectBtn').disabled = true; $('#resetProjectBtn').disabled = true; error.hidden = true;
 try {await setDoc(reference,payload,{merge:true});dialog.close();notify(editing ? 'Project updated.' : 'Project added to your library.');} catch(failure) {error.textContent = errorMessage(failure);error.hidden = false;} finally {save.disabled = false;save.textContent = 'Save project';$('#closeProjectBtn').disabled=false;$('#resetProjectBtn').disabled=false;}
});
const local = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
$('#connectionStatus').textContent = location.protocol === 'https:' ? 'HTTPS connection' : local ? 'Local preview · HTTP' : 'HTTPS required';
$('#connectionStatus').className = 'connection ' + (location.protocol === 'https:' ? 'secure' : 'local');
if(!local && location.protocol === 'http:') location.replace('https://' + location.host + location.pathname + location.search + location.hash);
try {
 firebase = await import('./firebase-client.js');
 $('#signInBtn').disabled = false; $('#signInLabel').textContent = 'Continue with Google';
 $('#signInBtn').addEventListener('click', async () => {
  $('#signInBtn').disabled = true; $('#authStatus').classList.remove('error'); $('#signInLabel').textContent = 'Opening Google…';
  try {await firebase.signInWithPopup(firebase.auth,firebase.googleProvider);} catch(error) {if(!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(error.code)) {$('#authStatus').textContent=errorMessage(error);$('#authStatus').classList.add('error');}} finally {$('#signInBtn').disabled=false;$('#signInLabel').textContent='Continue with Google';}
 });
 $('#signOutBtn').addEventListener('click', async () => {try {await firebase.signOut(firebase.auth);} catch(error) {notify(errorMessage(error),true);}});
 firebase.onAuthStateChanged(firebase.auth,user => {
  activeUser = user; clearSession();
  const approved = firebase.isAdmin(user);
  $('#adminApp').hidden = !approved; $('#loginView').hidden = approved;
  $('#signOutBtn').hidden = !user;
  $('#signInBtn').hidden = !!user && !approved;
  nav.forEach(button => {button.disabled = !approved;});
  $('#userName').textContent = approved ? (user.displayName?.split(' ')[0] || 'Ifedayo') : 'Deft GFX';
  $('#userInitial').textContent = approved ? ($('#userName').textContent[0] || 'D').toUpperCase() : 'D';
  $('#userRole').textContent = approved ? 'Administrator' : 'Your creative workspace';
  $('#authStatus').classList.toggle('error',!!user && !approved);
  $('#authStatus').textContent = user && !approved ? user.email + ' is not an approved admin. Sign out and use your admin account.' : 'Sign in with your approved Google account.';
  if(approved) {setView('projects');startWorkspace(user);} else $('#breadcrumb').textContent = 'Studio';
 }, error => {$('#authStatus').textContent=errorMessage(error);$('#authStatus').classList.add('error');});
} catch(error) {
 $('#signInLabel').textContent = 'Sign-in unavailable';
 $('#authStatus').textContent = 'Google sign-in could not load. Check your internet connection and refresh this page.';
 $('#authStatus').classList.add('error');
}
