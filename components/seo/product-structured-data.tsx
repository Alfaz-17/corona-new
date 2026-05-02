import React from 'react';

type ProductStructuredDataProps = {
  product: {
    title: string;
    description: string;
    image: string;
    category?: string;
    price?: number;
    availability?: string;
    condition?: string;
    brand?: string;
    sku?: string;
    mpn?: string;
  };
  slug: string;
};

export default function ProductStructuredData({ product, slug }: ProductStructuredDataProps) {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": [product.image],
    "description": product.description,
    "sku": product.sku || `CMP-${slug.toUpperCase()}`,
    "mpn": product.mpn || slug,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Corona Marine Parts"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://coronamarineparts.com/product/${slug}`,
      "priceCurrency": "USD",
      "price": product.price || "0.00",
      "priceValidUntil": "2026-12-31",
      "availability": product.availability === 'in-stock' ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "itemCondition": product.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "Worldwide"
        }
      }
    },
    "category": product.category || "Marine Equipment"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
    />
  );
}
