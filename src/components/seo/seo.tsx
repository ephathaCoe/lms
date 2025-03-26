import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export function SEO({
  title = "Premium Heavy Machinery",
  description = "High-quality heavy machinery for construction, mining and industrial applications with global delivery and expert support.",
  keywords = "heavy machinery, construction equipment, excavators, wheel loaders, dozers",
  canonicalUrl = "https://amarisco.com",
  ogImage = "https://amarisco.com/images/og-image.jpg",
}: SEOProps) {
  const fullTitle = title ? `${title} | Amaris Co. Ltd` : "Amaris Co. Ltd - Premium Heavy Machinery";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
}