# Maskid — Creator Portfolio

Standalone website for **https://creator.maskid.site**. This folder includes its own source, local fonts, images, build script, preview server, and Vercel configuration. It does not import files or configuration from the developer portfolio.

## Run locally

Use Node.js 22 or later. There are no third-party package dependencies.

```powershell
cd creator-website
npm start
```

Open the address printed in the terminal (normally http://localhost:4301/). Stop with Ctrl+C. Restart after changing source files.

```powershell
npm run check
npm run build
```

## Deploy on Vercel

1. Commit this folder to your repository, or copy the folder into a separate repository.
2. Create a Vercel project from that repository.
3. If using this existing repository, set **Root Directory** to **creator-website**. If this folder is its own repository root, leave Root Directory as the repository root.
4. Framework preset: **Other**. Build Command: **npm run build**. Output Directory: **dist**. The included vercel.json supplies these settings.
5. Add **creator.maskid.site** under Project Settings → Domains and follow Vercel's DNS instructions. The current live site is replaced only when you connect its domain to this new project.

The included public Firebase web configuration connects enquiries to the existing ifedayo-port project. No private API token or environment variables are required. The build works from the files inside this folder. Generated dist/ files are ignored by Git and recreated on deployment.

## Update the site

- Page content and layout: src/index.html.
- Shared portfolio styling: src/styles.css.
- Interactions: src/app.js.
- Domains, page metadata, contact email, and default preview port: site.config.mjs.
- Initial featured posts: content/posts.json. After the one-time import, manage posts in the central admin; this file is only the offline/first-use fallback. The imported list contains four videos and six threads from the original creator page. Add or edit a post with its numeric X post ID, type (video or thread), HTTPS URL, title, excerpt, and text. Run npm run build after editing.
- Original X posts, including playable video previews, load inline when their cards approach the viewport. Preview post also opens an enlarged view. Original-post links remain available if X blocks a preview. No X account credentials are stored here.

The **Send enquiry** form writes to the shared Firestore messages collection. Messages appear in https://portfolio.maskid.site/admin/ with a website label, selected service, and timing. Failed sends keep the brief visible and offer direct email or WhatsApp. The /admin path redirects to the central developer admin; there is no separate admin account for this site.

## UI consistency

Uses the portfolio's blue #2563eb, light #ecf0f3 background, locally hosted Poppins and Montserrat fonts, rounded controls, soft cards, and responsive navigation. Each project carries its own copies of those assets so it can be deployed independently.

## Central inbox setup

Deploy the updated developer portfolio too: its admin inbox now filters Developer, Creator, and Main Hub enquiries. All three sites must keep the same Firebase project configuration (ifedayo-port). They can be in different GitHub repositories and different hosting accounts. The database connection does not depend on repository or hosting ownership.

The existing firestore.rules already allow visitors to create messages and restrict inbox reads and changes to the approved admin email. If those rules have not yet been deployed, deploy them from the developer project root with firebase deploy --only firestore:rules --project ifedayo-port. Do not enable public message reads. Google sign-in happens on the central admin domain; ensure portfolio.maskid.site is in Firebase Auth authorized domains. If you restricted the public web API key by website, allow the creator and hub domains there too. Trading is not connected to this inbox.

## Creator post management

The central admin now has Developer projects, Creator posts, and Inbox sections. Creator posts supports X links, videos/threads, titles, descriptions, display order, publishing/hiding, editing, and deletion. The ten original posts import once on an approved admin sign-in; deleted posts are not reimported. The creator site subscribes to published creatorPosts in Firestore. An initialized empty catalogue stays empty rather than restoring built-in posts.

Deploy the updated firestore.rules from the developer project root: firebase deploy --only firestore:rules --project ifedayo-port. These rules allow public reads of published creator posts and restrict editing to the existing admin account. Redeploy the updated developer admin and creator site. Subsequent post edits do not require a new website deployment. The contact form writes to the admin dashboard, not email; direct email links are separate contact options.
