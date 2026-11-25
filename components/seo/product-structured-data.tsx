import React from 'react';

type ProductStructuredDataProps = {
  product: {
    _id?: string;
    title: string;
    description: string;
    image: string;
    images?: string[];
    category?: any;
    price?: number;
    availability?: string;
    condition?: string;
    brandName?: string;
    brand?: any;
    modelNumber?: string;
    sku?: string;
    mpn?: string;
    keywords?: string[];
    reviews?: Array<{ rating: number; userName?: string; comment?: string; date?: string }>;
  };
  slug: string;
};

export default function ProductStructuredData({ product, slug }: ProductStructuredDataProps) {
  const reviewCount = product.reviews?.filter(r => r.rating > 0).length || 0;
  const brandName = product.brandName || (product.brand && product.brand.name) || '';
  const categoryName = product.category?.name || 'Marine Equipment';

  // Collect all product images for schema
  const allImages: string[] = [];
  if (product.image) {
    allImages.push(product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`);
  }
  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      allImages.push(img.startsWith('http') ? img : `https://coronamarineparts.com${img}`);
    }
  }

  // Build the Product structured data
  const productData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": allImages.length > 0 ? allImages : [`https://coronamarineparts.com/placeholder.jpg`],
    "description": product.description || `Genuine ${product.title} - ${categoryName} sourced from Alang Shipyard by Corona Marine Parts.`,
    "sku": product.sku || `CMP-${slug.toUpperCase().slice(0, 20)}`,
    "mpn": product.mpn || product.modelNumber || product.sku || slug,
    "category": categoryName,
    "url": `https://coronamarineparts.com/product/${slug}`,
  };

  if (product.modelNumber) {
    productData["model"] = product.modelNumber;
  }

  // Only add brand if we have a real brand name
  if (brandName) {
    productData["brand"] = {
      "@type": "Brand",
      "name": brandName
    };
  }

  const itemCondition =
    product.condition === 'new'
      ? "https://schema.org/NewCondition"
      : product.condition === 'used'
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/RefurbishedCondition";

  // Build offers - only include price if it's a real price > 0
  const offerData: Record<string, any> = {
    "@type": "Offer",
    "url": `https://coronamarineparts.com/product/${slug}`,
    "availability": product.availability === 'in-stock'
      ? "https://schema.org/InStock"
      : product.availability === 'out-of-stock'
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/PreOrder",
    "itemCondition": itemCondition,
    "seller": {
      "@type": "Organization",
      "name": "Corona Marine Parts",
      "url": "https://coronamarineparts.com"
    }
  };

  // Only add price if product has a real price > 0
  if (product.price && product.price > 0) {
    offerData["priceCurrency"] = "USD";
    offerData["price"] = product.price.toFixed(2);
    // Set priceValidUntil to 1 year from now
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    offerData["priceValidUntil"] = validUntil.toISOString().split('T')[0];
  }

  productData["offers"] = offerData;

  // Only add aggregateRating if there are REAL reviews - never fake it
  if (reviewCount > 0 && product.reviews) {
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    productData["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": (totalRating / reviewCount).toFixed(1),
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add individual reviews for rich snippets
    productData["review"] = product.reviews.slice(0, 5).map(r => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": r.userName || "Verified Buyer"
      },
      ...(r.comment ? { "reviewBody": r.comment } : {}),
      ...(r.date ? { "datePublished": new Date(r.date).toISOString().split('T')[0] } : {})
    }));
  }

  // FAQ Data - only with relevant, real questions
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where is this ${product.title} sourced from?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This ${product.title} is sourced from Alang Shipyard, Gujarat, India - the world's largest ship recycling facility. All components are thoroughly inspected, tested, and certified by Corona Marine Parts' technical team before dispatch.`
        }
      },
      {
        "@type": "Question",
        "name": `Do you ship ${product.title} internationally?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Corona Marine Parts provides worldwide shipping for all marine components through trusted international freight and logistics partners. We ship to all major ports globally."
        }
      },
      {
        "@type": "Question",
        "name": `What is the warranty on this ${categoryName} part?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `All ${categoryName} components from Corona Marine Parts are quality-checked and come with our reliability guarantee. Each part is tested under operational conditions before shipping. Contact our technical team for specific warranty details.`
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
