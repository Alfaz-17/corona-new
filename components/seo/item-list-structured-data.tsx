import React from 'react';

type Product = {
  _id: string;
  title: string;
  slug?: string;
  image: string;
  category?: { name: string };
  brandName?: string;
};

type ItemListStructuredDataProps = {
  products: Product[];
  listName?: string;
  listUrl?: string;
};

// ItemList Schema - tells Google this page has a list of products
// This helps get product listings shown as rich results in search
export default function ItemListStructuredData({ products, listName, listUrl }: ItemListStructuredDataProps) {
  if (!products || products.length === 0) return null;

  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName || "Marine Spare Parts Inventory",
    "url": listUrl || "https://coronamarineparts.com/products",
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 30).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": product.title,
      "url": `https://coronamarineparts.com/product/${product.slug || product._id}`,
      "image": product.image?.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
    />
  );
}
