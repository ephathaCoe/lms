const fs = require('fs');
const path = require('path');

// Base URL of your website
const BASE_URL = 'https://amarisco.com';

// Define your routes
const routes = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/request-invoice',
  '/thank-you',
];

// Add product routes (in a real app, you would get these from your API or database)
const productIds = ['1', '2', '3', '4', '5', '6'];
const productRoutes = productIds.map(id => `/products/${id}`);

// Add category routes
const categories = ['excavators', 'loaders', 'trucks', 'crushers', 'dozers', 'attachments'];
const categoryRoutes = categories.map(category => `/products?category=${category}`);

// Combine all routes
const allRoutes = [...routes, ...productRoutes, ...categoryRoutes];

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.includes('/products/') ? '0.8' : '0.6'}</priority>
  </url>
`).join('')}
</urlset>
`;

// Write sitemap to public directory
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully!');