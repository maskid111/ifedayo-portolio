# Maskid — Believe in Something

Standalone website for **https://maskid.site**. This folder includes its own source, local fonts, images, build script, preview server, and Vercel configuration. It does not import files or configuration from the developer portfolio.

## Run locally

Use Node.js 22 or later. There are no third-party package dependencies.

```powershell
cd maskid-hub
npm start
```

Open the address printed in the terminal (normally http://localhost:4302/). Stop with Ctrl+C. Restart after changing source files.

```powershell
npm run check
npm run build
```

## Deploy on Vercel

1. Commit this folder to your repository, or copy the folder into a separate repository.
2. Create a Vercel project from that repository.
3. If using this existing repository, set **Root Directory** to **maskid-hub**. If this folder is its own repository root, leave Root Directory as the repository root.
4. Framework preset: **Other**. Build Command: **npm run build**. Output Directory: **dist**. The included vercel.json supplies these settings.
5. Add **maskid.site** and **www.maskid.site** under Project Settings → Domains and follow Vercel's DNS instructions. Set www.maskid.site to redirect to maskid.site. This replaces the current site only when you connect those domains to this new project.

The included public Firebase web configuration connects enquiries to the existing ifedayo-port project. No private API token or environment variables are required. The build works from the files inside this folder. Generated dist/ files are ignored by Git and recreated on deployment.

## Update the site

- Page content and layout: src/index.html.
- Shared portfolio styling: src/styles.css.
- Interactions: src/app.js.
- Domains, page metadata, contact email, and default preview port: site.config.mjs.
- Destinations: content/services.json. The hub currently links to Creator, Developer, and Trading.
- Destination previews are actual homepage screenshots stored in src/assets/*-site-preview.jpg. Replace the matching screenshot when a destination's design changes; each preview path is set in content/services.json.
- Legacy /creator links redirect to creator.maskid.site, and /development links redirect to portfolio.maskid.site. The hub contains no copied developer project catalogue or creator feed.

The **Send enquiry** form writes to the shared Firestore messages collection. Messages appear in https://portfolio.maskid.site/admin/ with a website label, selected service, and timing. Failed sends keep the brief visible and offer direct email or WhatsApp. The /admin path redirects to the central developer admin; there is no separate admin account for this site.

## UI consistency

Uses the portfolio's blue #2563eb, light #ecf0f3 background, locally hosted Poppins and Montserrat fonts, rounded controls, soft cards, and responsive navigation. Each project carries its own copies of those assets so it can be deployed independently.

## Central inbox setup

Deploy the updated developer portfolio too: its admin inbox now filters Developer, Creator, and Main Hub enquiries. All three sites must keep the same Firebase project configuration (ifedayo-port). They can be in different GitHub repositories and different hosting accounts. The database connection does not depend on repository or hosting ownership.

The existing firestore.rules already allow visitors to create messages and restrict inbox reads and changes to the approved admin email. If those rules have not yet been deployed, deploy them from the developer project root with firebase deploy --only firestore:rules --project ifedayo-port. Do not enable public message reads. Google sign-in happens on the central admin domain; ensure portfolio.maskid.site is in Firebase Auth authorized domains. If you restricted the public web API key by website, allow the creator and hub domains there too. Trading is not connected to this inbox.

## Creator post management

The central admin now has Developer projects, Creator posts, and Inbox sections. Creator posts supports X links, videos/threads, titles, descriptions, display order, publishing/hiding, editing, and deletion. The ten original posts import once on an approved admin sign-in; deleted posts are not reimported. The creator site subscribes to published creatorPosts in Firestore. An initialized empty catalogue stays empty rather than restoring built-in posts.

Deploy the updated firestore.rules from the developer project root: firebase deploy --only firestore:rules --project ifedayo-port. These rules allow public reads of published creator posts and restrict editing to the existing admin account. Redeploy the updated developer admin and creator site. Subsequent post edits do not require a new website deployment. The contact form writes to the admin dashboard, not email; direct email links are separate contact options.
