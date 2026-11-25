export interface SeoCheckItem {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
}

export interface ProductSeoReport {
  score: number;
  maxScore: number;
  percentage: number;
  checks: SeoCheckItem[];
  missingLabels: string[];
}

export interface ProductSeoInput {
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  keywords?: string[];
  imageAlt?: string;
  description?: string;
  specifications?: Record<string, any>;
  brandName?: string;
  brand?: any;
  modelNumber?: string;
  sku?: string;
}

export function evaluateProductSeo(product: ProductSeoInput): ProductSeoReport {
  const title = (product.title || '').trim();
  const slug = (product.slug || '').trim();
  const metaTitle = (product.metaTitle || '').trim();
  const metaDescription = (product.metaDescription || '').trim();
  const primaryKeyword = (product.primaryKeyword || '').trim();
  const keywords = Array.isArray(product.keywords)
    ? product.keywords.filter((k) => String(k).trim().length > 0)
    : [];
  const imageAlt = (product.imageAlt || '').trim();
  const description = (product.description || '').trim();
  const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
  const specCount = product.specifications ? Object.keys(product.specifications).length : 0;
  const hasBrandOrModel = Boolean(
    (product.brandName || product.brand?.name || '').trim() ||
    (product.modelNumber || product.sku || '').trim()
  );

  const checks: SeoCheckItem[] = [
    {
      id: 'primaryKeyword',
      label: 'Primary Keyword',
      passed: primaryKeyword.length >= 3,
      hint: 'Set 1 clear target search phrase for this product page.',
    },
    {
      id: 'secondaryKeywords',
      label: 'Secondary Keywords',
      passed: keywords.length >= 2,
      hint: 'Add at least 2 supporting search terms (brand, model, application).',
    },
    {
      id: 'slug',
      label: 'SEO URL Slug',
      passed: slug.length >= 3 && /^[a-z0-9-]+$/.test(slug),
      hint: 'Use a clean lowercase hyphenated slug (no spaces or IDs).',
    },
    {
      id: 'metaTitle',
      label: 'SEO Title (30-65 chars)',
      passed: metaTitle.length >= 30 && metaTitle.length <= 65,
      hint: `Currently ${metaTitle.length} chars; aim for 30-65 chars.`,
    },
    {
      id: 'metaDescription',
      label: 'Meta Description (110-165 chars)',
      passed: metaDescription.length >= 110 && metaDescription.length <= 165,
      hint: `Currently ${metaDescription.length} chars; aim for 110-165 chars.`,
    },
    {
      id: 'imageAlt',
      label: 'Image ALT Text',
      passed: imageAlt.length >= 10,
      hint: 'Add descriptive ALT text for image accessibility & Google Images.',
    },
    {
      id: 'description',
      label: 'Unique Description (150+ words)',
      passed: wordCount >= 150 && title.length > 0,
      hint: `Currently ${wordCount} words; aim for 150-300+ original words.`,
    },
    {
      id: 'specs',
      label: 'Product Facts & Specs',
      passed: specCount >= 2 || hasBrandOrModel,
      hint: 'Include verified Brand/Model/SKU or at least 2 technical specs.',
    },
  ];

  const score = checks.filter((c) => c.passed).length;
  const maxScore = checks.length;

  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    checks,
    missingLabels: checks.filter((c) => !c.passed).map((c) => c.label),
  };
}
