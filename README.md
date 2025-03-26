# Amaris Co. Ltd - Heavy Machinery Website

A comprehensive website for Amaris Co. Ltd, a heavy machinery selling company. The website allows visitors to browse products, view detailed information, and request invoices. It also includes an admin panel for managing products, users, and invoice requests.

## Features

### Public Features
- Responsive design for all devices
- Product catalog with filtering and search
- Detailed product pages with specifications and images
- Invoice request system
- Contact form
- About us page
- SEO optimized with structured data

### Admin Features
- Dashboard with key metrics
- Product management (add, edit, delete)
- Invoice request management
- User management
- Authentication system

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui (built on Radix UI)
- **Icons**: Lucide React
- **SEO**: React Helmet Async, Structured Data, Sitemap

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/amaris-machinery.git
cd amaris-machinery
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

1. Create a production build:
```bash
npm run build
# or
yarn build
```

2. Preview the production build locally:
```bash
npm run preview
# or
yarn preview
```

## SEO Features

The website includes several SEO optimizations:

1. **Meta Tags**: Each page has optimized title, description, and keywords
2. **Structured Data**: JSON-LD for products and organization information
3. **Sitemap**: Automatically generated sitemap.xml
4. **Robots.txt**: Properly configured for search engines
5. **Canonical URLs**: Prevents duplicate content issues
6. **Open Graph Tags**: For better social media sharing
7. **Semantic HTML**: Proper heading hierarchy and semantic elements
8. **Mobile Responsive**: Fully responsive design for all devices

## Deployment Instructions

### Option 1: Deploy to Netlify

1. Create an account on [Netlify](https://www.netlify.com/) if you don't have one.

2. Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Login to Netlify:
```bash
netlify login
```

4. Deploy the site:
```bash
netlify deploy
```

5. Follow the prompts to set up your site. When asked for the publish directory, enter `dist`.

6. Once you're satisfied with the preview, deploy to production:
```bash
netlify deploy --prod
```

### Option 2: Deploy to Vercel

1. Create an account on [Vercel](https://vercel.com/) if you don't have one.

2. Install the Vercel CLI:
```bash
npm install -g vercel
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy the site:
```bash
vercel
```

5. Follow the prompts to set up your site.

6. To deploy to production:
```bash
vercel --prod
```

### Option 3: Deploy to a Traditional Web Server

1. Build the project:
```bash
npm run build
# or
yarn build
```

2. Upload the contents of the `dist` directory to your web server using FTP or SSH.

3. Configure your web server to serve the `index.html` file for all routes (to support client-side routing).

#### Apache Configuration
Create or modify the `.htaccess` file in your web root:
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Set browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType application/x-font-woff "access plus 1 year"
</IfModule>
```

#### Nginx Configuration
Add this to your server block:
```
location / {
  try_files $uri $uri/ /index.html;
}

# Enable GZIP compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Option 4: Deploy using Docker

1. Create a `Dockerfile` in the project root:
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an `nginx.conf` file:
```
server {
  listen 80;
  
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
  
  # Enable GZIP compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  
  # Set cache headers
  location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000";
  }
}
```

3. Build the Docker image:
```bash
docker build -t amaris-website .
```

4. Run the container:
```bash
docker run -p 8080:80 amaris-website
```

5. The website will be available at `http://localhost:8080`

## Admin Access

For demo purposes, use the following credentials to access the admin panel:
- Email: admin@amarisco.com
- Password: admin123

## Project Structure

```
amaris-machinery/
├── public/            # Static assets
│   ├── images/        # Image files
│   ├── robots.txt     # Robots file for SEO
│   └── sitemap.xml    # Auto-generated sitemap
├── scripts/           # Build scripts
│   └── generate-sitemap.js # Sitemap generator
├── src/               # Source code
│   ├── components/    # Reusable components
│   │   ├── admin/     # Admin-specific components
│   │   ├── layout/    # Layout components
│   │   ├── seo/       # SEO components
│   │   └── ui/        # UI components (shadcn/ui)
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   │   └── admin/     # Admin pages
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## SEO Maintenance

To keep your SEO optimized:

1. **Update Meta Tags**: When adding new pages, ensure they have proper meta tags
2. **Regenerate Sitemap**: Run `npm run generate-sitemap` after adding new pages
3. **Monitor Performance**: Use Google PageSpeed Insights to check performance
4. **Check Search Console**: Regularly check Google Search Console for issues
5. **Update Structured Data**: Keep product information up to date

## Customization

### Changing Colors
Edit the `tailwind.config.js` file to modify the color scheme.

### Adding New Products
Use the admin panel to add new products, or modify the mock data in `src/services/api.ts`.

### Modifying Content
Update the content in the respective page components under `src/pages/`.

## License

This project is licensed under the MIT License.