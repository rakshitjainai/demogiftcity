import fs from 'fs';

const posts = JSON.parse(fs.readFileSync('./client/src/data/posts.json', 'utf-8'));

const targetUpdates = [
  {
    id: "up-1",
    slug: "gift-ifsc-aircraft-ship-leasing-legal-framework-setup-process",
    title: "Aircraft & Ship Leasing in GIFT IFSC",
    category: "GIFT City & IFSC Law"
  },
  {
    id: "up-2",
    slug: "open-company-in-singapore-from-india",
    title: "Singapore Company Setup from India: 2025 Legal & FEMA Guide",
    category: "Doing Business in India"
  },
  {
    id: "up-3",
    slug: "sfac-fpo-funding-support-india",
    title: "SFAC Schemes and Funding Support for FPOs in India",
    category: "Doing Business in India"
  },
  {
    id: "up-4",
    slug: "design-registration-documents-checklist-india",
    title: "Required Documents for Design Registration in India",
    category: "IPR"
  },
  {
    id: "up-5",
    slug: "difference-between-esop-sweat-equity-and-phantom-stock-india",
    title: "Difference Between ESOP, Sweat Equity, and Phantom Stock in India",
    category: "Startups / ESOP"
  }
];

targetUpdates.forEach(u => {
  const match = posts.find(p => p.slug === u.slug || p.id === u.id);
  console.log(`Update: "${u.title}"`);
  console.log(`  Slug: ${u.slug}`);
  console.log(`  Found in posts.json: ${match ? 'YES' : 'NO'}`);
  if (match) {
    console.log(`  Canonical Title: "${match.title}"`);
    console.log(`  Content Length: ${match.content?.length} chars`);
    console.log(`  Excerpt Preview: ${match.content?.replace(/<[^>]+>/g, '').slice(0, 150)}...`);
  }
  console.log('----------------------------------------------------');
});
