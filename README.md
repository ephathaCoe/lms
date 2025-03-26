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
```

#### Nginx Configuration
Add this to your server block:
```
location / {
  try_files $uri $uri/ /index.html;
}
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
│   └── images/        # Image files
├── src/               # Source code
│   ├── components/    # Reusable components
│   │   ├── admin/     # Admin-specific components
│   │   ├── layout/    # Layout components
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

## Customization

### Changing Colors
Edit the `tailwind.config.js` file to modify the color scheme.

### Adding New Products
Use the admin panel to add new products, or modify the mock data in `src/services/api.ts`.

### Modifying Content
Update the content in the respective page components under `src/pages/`.

## License

This project is licensed under the MIT License.