import { Product } from "@/types";

interface ProductSchemaProps {
  product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
  // Format the product data for structured data
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "Amaris Co. Ltd"
    },
    manufacturer: {
      "@type": "Organization",
      name: "Amaris Co. Ltd"
    },
    offers: {
      "@type": "Offer",
      availability: product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      priceCurrency: "USD",
      price: product.price || "0",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      url: `https://amarisco.com/products/${product.id}`,
      seller: {
        "@type": "Organization",
        name: "Amaris Co. Ltd"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}