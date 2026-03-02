import React from 'react';

type BlogStructuredDataProps = {
  blog: {
    title: string;
    excerpt: string;
    image: string;
    date: string;
    author?: string;
  };
  slug: string;
};

export default function BlogStructuredData({ blog, slug }: BlogStructuredDataProps) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": [blog.image],
    "datePublished": blog.date,
    "author": [{
        "@type": "Organization",
        "name": "Corona Marine Parts",
        "url": "https://coronamarineparts.com"
      }],
    "publisher": {
      "@type": "Organization",
      "name": "Corona Marine Parts",
      "logo": {
        "@type": "ImageObject",
        "url": "https://coronamarineparts.com/logo.png"
      }
    },
    "description": blog.excerpt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://coronamarineparts.com/blog/${slug}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
    />
  );
}
