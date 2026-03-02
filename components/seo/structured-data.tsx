import React from 'react';

export default function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Corona Marine Parts",
    "url": "https://coronamarineparts.com",
    "logo": "https://coronamarineparts.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-93765-02550",
      "contactType": "sales",
      "areaServed": "Worldwide",
      "availableLanguage": ["en", "Hindi", "Gujarati"]
    },
    "sameAs": [
      "https://www.facebook.com/coronamarineparts",
      "https://www.linkedin.com/company/corona-marine-parts/"
    ]
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Corona Marine Parts",
    "description": "Premium supplier of marine spare parts and automation systems based in Alang Shipyard, Bhavnagar.",
    "telephone": "+91 93765 02550",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "PLOT NO. F/14/4, GODOWN NO. A/11 BEST INDUSTRIAL PARK, MADHIYA ROAD, KUMBHARWADA",
      "addressLocality": "BHAVNAGAR",
      "addressRegion": "GUJARAT",
      "postalCode": "364006",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.7645,
      "longitude": 72.1416
    },
    "url": "https://coronamarineparts.com",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "16:00"
      }
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Corona Marine Parts",
    "url": "https://coronamarineparts.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://coronamarineparts.com/products?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://coronamarineparts.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://coronamarineparts.com/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "About",
        "item": "https://coronamarineparts.com/about"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contact",
        "item": "https://coronamarineparts.com/contact"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationData, localBusinessData, websiteData, breadcrumbData]) }}
    />
  );
}
