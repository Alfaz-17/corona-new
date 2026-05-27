import React from 'react';

// Global Structured Data - Organization, LocalBusiness, WebSite
// Removed broken global BreadcrumbList (was listing Home→Products→About→Contact which isn't a hierarchy)
// Page-specific breadcrumbs are handled by individual pages

export default function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Corona Marine Parts",
    "alternateName": "Corona Marine",
    "url": "https://coronamarineparts.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://coronamarineparts.com/logo.png",
      "width": 512,
      "height": 512
    },
    "description": "Leading global supplier of marine spare parts, automation systems, and ship machinery components from Alang Shipyard, India. Certified quality marine solutions with worldwide shipping.",
    "foundingDate": "2023",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-93765-02550",
        "contactType": "sales",
        "areaServed": "Worldwide",
        "availableLanguage": ["English", "Hindi", "Gujarati"]
      },
      {
        "@type": "ContactPoint",
        "email": "sales@coronamarineparts.com",
        "contactType": "customer service",
        "areaServed": "Worldwide"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "PLOT NO. F/14/4, GODOWN NO. A/11 BEST INDUSTRIAL PARK, MADHIYA ROAD, KUMBHARWADA",
      "addressLocality": "Bhavnagar",
      "addressRegion": "Gujarat",
      "postalCode": "364006",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/coronamarineparts",
      "https://www.linkedin.com/company/corona-marine-parts/"
    ]
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "name": "Corona Marine Parts",
    "description": "Premium supplier of marine spare parts, ship automation systems, engine room machinery, and marine electronics. Based near Alang Shipyard - the world's largest ship recycling facility.",
    "telephone": "+91 93765 02550",
    "email": "sales@coronamarineparts.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "PLOT NO. F/14/4, GODOWN NO. A/11 BEST INDUSTRIAL PARK, MADHIYA ROAD, KUMBHARWADA",
      "addressLocality": "Bhavnagar",
      "addressRegion": "Gujarat",
      "postalCode": "364006",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.7645,
      "longitude": 72.1416
    },
    "url": "https://coronamarineparts.com",
    "image": "https://coronamarineparts.com/logo.png",
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Bank Transfer", "Wire Transfer"],
    "currenciesAccepted": "USD, INR, EUR",
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
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Marine Spare Parts Catalog",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Marine Automation Systems",
          "url": "https://coronamarineparts.com/products"
        },
        {
          "@type": "OfferCatalog",
          "name": "Ship Engine Spare Parts",
          "url": "https://coronamarineparts.com/products"
        },
        {
          "@type": "OfferCatalog",
          "name": "Marine Electronics & Sensors",
          "url": "https://coronamarineparts.com/products"
        }
      ]
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Corona Marine Parts",
    "alternateName": "Corona Marine",
    "url": "https://coronamarineparts.com",
    "description": "Buy genuine marine spare parts, ship automation systems, and engine room machinery from Alang Shipyard. Worldwide shipping available.",
    "publisher": {
      "@type": "Organization",
      "name": "Corona Marine Parts",
      "url": "https://coronamarineparts.com"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://coronamarineparts.com/products?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
