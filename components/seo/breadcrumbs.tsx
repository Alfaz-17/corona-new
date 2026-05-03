import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Add Home to the beginning
  const allItems = [
    { label: 'Home', href: '/' },
    ...items
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://coronamarineparts.com${item.href}`
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ol className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
        {allItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="w-3 h-3 mx-2 text-muted-foreground/50" />}
            {index === allItems.length - 1 ? (
              <span className="text-accent" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="w-3 h-3" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
