import {isCatalogMetadata} from './developer-catalog.js';
// Original portfolio projects, shared by migration and static generation.
export const CATALOG_MARKER_ID = 'portfolio-catalog-migration-v1';
export const builtInProjects = [
  {
    "id": "aimabluxe",
    "name": "Aimabluxe",
    "category": "Brand Website",
    "description": "Luxury-focused web experience with a polished storefront feel.",
    "liveUrl": "https://www.aimabluxe.com/",
    "previewPath": "/assets/project-previews/aimabluxe.png",
    "order": 0,
    "featured": true,
    "published": true,
    "tone": "amber"
  },
  {
    "id": "teamzadore",
    "name": "Teamzadore",
    "category": "Creative Website",
    "description": "A public web presence for Teamz Adore with visual-forward presentation.",
    "liveUrl": "https://deftgfx.github.io/Teamz-Adore/",
    "previewPath": "/assets/project-previews/teamzadore.png",
    "order": 1,
    "featured": true,
    "published": true,
    "tone": "rose"
  },
  {
    "id": "maskid-portfolio",
    "name": "Maskid Portfolio",
    "category": "Personal Portfolio",
    "description": "Portfolio hub for showcasing creative, technical, and digital work.",
    "liveUrl": "https://maskid.site",
    "previewPath": "/assets/project-previews/maskid-portfolio.png",
    "order": 2,
    "featured": true,
    "published": true,
    "tone": "blue"
  },
  {
    "id": "malete-hostel",
    "name": "Malete Hostel",
    "category": "Web App",
    "description": "A hostel discovery interface built around student accommodation needs.",
    "liveUrl": "https://maskid111.github.io/maletehostel/",
    "previewPath": "/assets/project-previews/malete-hostel.png",
    "order": 3,
    "featured": true,
    "published": true,
    "tone": "green"
  },
  {
    "id": "judgelayer",
    "name": "JudgeLayer",
    "category": "Blockchain Product",
    "description": "A blockchain-facing product experience for trust, judgement, and verification workflows.",
    "liveUrl": "https://judgelayer.vercel.app/",
    "previewPath": "/assets/project-previews/judgelayer.png",
    "order": 4,
    "featured": false,
    "published": true,
    "tone": "violet"
  },
  {
    "id": "echomap",
    "name": "Echomap",
    "category": "Interactive Product",
    "description": "A digital product experiment with mapping, discovery, and interaction at its core.",
    "liveUrl": "https://echomapxyz.vercel.app/",
    "previewPath": "/assets/project-previews/echomap.png",
    "order": 5,
    "featured": false,
    "published": true,
    "tone": "cyan"
  },
  {
    "id": "seismic-flyer-generator",
    "name": "Seismic Flyer Generator",
    "category": "Design Tool",
    "description": "A browser-based generator for quickly producing Seismic-styled flyer visuals.",
    "liveUrl": "https://seismicflyer.vercel.app/",
    "previewPath": "/assets/project-previews/seismic-flyer-generator.png",
    "order": 6,
    "featured": false,
    "published": true,
    "tone": "orange"
  },
  {
    "id": "birthday-vault",
    "name": "Birthday Vault",
    "category": "Celebration Website",
    "description": "A warm, memorable digital birthday experience built for sharing and surprise.",
    "liveUrl": "https://jummy26.vercel.app/",
    "previewPath": "/assets/project-previews/birthday-vault.png",
    "order": 7,
    "featured": false,
    "published": true,
    "tone": "pink"
  }
];

export function catalogState(documents) {
 const projects = documents.filter(project => !isCatalogMetadata(project));
 return {
  managed: documents.some(project => isCatalogMetadata(project)) || projects.length > 0,
  projects: projects.filter(project => project.published !== false).sort((a,b) => (Number(a.order)||0)-(Number(b.order)||0) || String(a.id).localeCompare(String(b.id))),
 };
}
