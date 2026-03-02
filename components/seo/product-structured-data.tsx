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
    "brand": {
      "@type": "Brand",
      "name": "Corona Marine Parts"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://coronamarineparts.com/product/${slug}`,
      "priceCurrency": "USD",
      "price": product.price || "Contact for Price",
      "availability": product.availability === 'in-stock' ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "itemCondition": product.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition"
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
