import { builtInProjects, CATALOG_MARKER_ID } from './project-catalog.js';

function normalizeUrl(value) {
 try { const url = new URL(value); url.hash = ''; return url.href.replace(/\/$/, ''); } catch { return ''; }
}

// Import once after an approved admin signs in. The marker is in the existing
// projects collection so the currently deployed project rules cover it too.
// It has no order field and never appears in the admin's ordered project query.
export async function migrateBuiltInProjects(firebase, user) {
 if (!firebase.isAdmin(user)) throw new Error('Administrator access required.');
 const {db, doc, collection, getDoc, getDocs, runTransaction, serverTimestamp} = firebase;
 const marker = doc(db, 'projects', CATALOG_MARKER_ID);
 if ((await getDoc(marker)).exists()) return 0;
 const snapshot = await getDocs(collection(db, 'projects'));
 const existingRefs = snapshot.docs.filter(item => item.id !== CATALOG_MARKER_ID).map(item => doc(db, 'projects', item.id));
 const occupied = new Set(snapshot.docs.map(item => item.id));
 const targets = builtInProjects.map(project => {
  let id = project.id;
  while (occupied.has(id)) id = 'original-' + id;
  occupied.add(id);
  return {project, reference: doc(db, 'projects', id)};
 });
 return runTransaction(db, async transaction => {
  if ((await transaction.get(marker)).exists()) return 0;
  // Finish every read before any writes; Firebase can retry this function.
  const existing = await Promise.all(existingRefs.map(reference => transaction.get(reference)));
  const targetSnapshots = await Promise.all(targets.map(({reference}) => transaction.get(reference)));
  const urls = new Set([...existing, ...targetSnapshots].filter(item => item.exists()).map(item => normalizeUrl(item.data().liveUrl || item.data().url)).filter(Boolean));
  let imported = 0;
  targets.forEach(({project, reference}, index) => {
   const url = normalizeUrl(project.liveUrl);
   if (!url) throw new Error('Invalid original project URL.');
   if (urls.has(url) || targetSnapshots[index].exists()) return;
   const {id, ...data} = project;
   transaction.set(reference, {...data, createdAt:serverTimestamp(), updatedAt:serverTimestamp(), updatedBy:user.email});
   urls.add(url); imported++;
  });
  transaction.set(marker, {kind:'catalog-migration', version:1, importedAt:serverTimestamp(), importedBy:user.email});
  return imported;
 });
}
