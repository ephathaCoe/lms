export function OrganizationSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Amaris Co. Ltd",
    url: "https://amarisco.com",
    logo: "https://amarisco.com/images/logo.png",
    description: "Premium heavy machinery for construction, mining and industrial applications with global delivery and expert support.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Industrial Avenue",
      addressLocality: "Business District",
      addressRegion: "City",
      postalCode: "10001",
      addressCountry: "Country"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-234-567-8900",
      contactType: "sales",
      email: "sales@amarisco.com",
      availableLanguage: ["English"]
    },
    sameAs: [
      "https://facebook.com/amarisco",
      "https://instagram.com/amarisco",
      "https://linkedin.com/company/amarisco"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}