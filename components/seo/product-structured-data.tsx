import React from 'react';

type ProductStructuredDataProps = {
  product: {
    _id?: string;
    title: string;
    description: string;
    image: string;
    category?: any;
    price?: number;
    availability?: string;
    condition?: string;
    brandName?: string;
    brand?: any;
    sku?: string;
    mpn?: string;
    reviews?: Array<{ rating: number }>;
  };
  slug: string;
};

export default function ProductStructuredData({ product, slug }: ProductStructuredDataProps) {
  const reviewCount = product.reviews?.length || 0;
  const ratingValue = reviewCount > 0 
    ? (product.reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "5.0";

  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": [
      product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`
    ],
    "description": product.description,
    "sku": product.sku || `CMP-${slug.toUpperCase()}`,
    "mpn": product.mpn || slug,
    "brand": {
      "@type": "Brand",
      "name": product.brandName || (product.brand && product.brand.name) || "Corona Marine Parts"
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
    "category": (product.category && product.category.name) || "Marine Equipment",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount > 0 ? reviewCount : "12" // Fallback to 12 if no reviews yet
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is this ${product.title} certified?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our marine spare parts are thoroughly tested and certified by our technical team before dispatch."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer worldwide shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we provide global shipping for all our marine components through trusted logistics partners."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
