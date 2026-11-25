"use client"

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  TrendingUp,
  Download,
  Wand2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit,
  X,
  Save,
  Loader2,
  FileCheck2
} from 'lucide-react';
import api from '@/lib/api';
import { evaluateProductSeo } from '@/lib/seo-score';
import { ProductSeoFields, ProductFormSeoState } from '@/components/admin/product-seo-fields';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${str.replace(/"/g, '""')}"`;
}

export default function AdminSeoCenterPage() {
  const { data: stats, mutate: mutateStats } = useSWR('/products/dashboard/stats', fetcher);
  const { data: products = [], mutate: mutateProducts } = useSWR('/products', fetcher);

  const [filterTab, setFilterTab] = useState<'needs' | 'all' | 'optimized'>('needs');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isMigrating, setIsMigrating] = useState(false);

  // Quick SEO Editor Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [quickForm, setQuickForm] = useState<ProductFormSeoState | null>(null);
  const [isSavingQuick, setIsSavingQuick] = useState(false);

  const evaluatedProducts = useMemo(() => {
    return (products as any[])
      .map((product) => ({
        product,
        report: evaluateProductSeo(product),
      }))
      .sort((a, b) => a.report.percentage - b.report.percentage);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return evaluatedProducts.filter(({ product, report }) => {
      const matchesTab =
        filterTab === 'all' ||
        (filterTab === 'needs' && report.percentage < 85) ||
        (filterTab === 'optimized' && report.percentage >= 85);

      const matchesSearch =
        !term ||
        product.title?.toLowerCase().includes(term) ||
        product.primaryKeyword?.toLowerCase().includes(term) ||
        product.brandName?.toLowerCase().includes(term) ||
        product.slug?.toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });
  }, [evaluatedProducts, filterTab, searchTerm]);

  const handleFixSlugs = async () => {
    setIsMigrating(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/migrate-slugs');
      setMessage({ type: 'success', text: data.message || 'Slug migration completed.' });
      await Promise.all([mutateProducts(), mutateStats()]);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.error || 'Failed to fix slugs.' });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Title',
      'Category',
      'Brand',
      'Model',
      'Live URL',
      'SEO Score %',
      'Primary Keyword',
      'Secondary Keywords',
      'SEO Title',
      'Meta Description',
      'Image ALT',
      'Missing Items',
    ];

    const rows = evaluatedProducts.map(({ product, report }) => [
      product.title,
      product.category?.name || '',
      product.brandName || product.brand?.name || '',
      product.modelNumber || '',
      `https://coronamarineparts.com/product/${product.slug || product._id}`,
      `${report.percentage}%`,
      product.primaryKeyword || '',
      Array.isArray(product.keywords) ? product.keywords.join('; ') : '',
      product.metaTitle || '',
      product.metaDescription || '',
      product.imageAlt || '',
      report.missingLabels.join('; '),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `corona-marine-seo-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openQuickEditor = (product: any) => {
    setEditingProduct(product);
    setQuickForm({
      title: product.title || '',
      slug: product.slug || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      primaryKeyword: product.primaryKeyword || '',
      keywords: Array.isArray(product.keywords) ? product.keywords : [],
      imageAlt: product.imageAlt || '',
      brandName: product.brandName || product.brand?.name || '',
      modelNumber: product.modelNumber || '',
      sku: product.sku || '',
      description: product.description || '',
      specifications: product.specifications || {},
    });
  };

  const handleQuickChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuickForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !quickForm) return;
    setIsSavingQuick(true);
    try {
      await api.put(`/products/${editingProduct._id}`, {
        slug: quickForm.slug,
        metaTitle: quickForm.metaTitle,
        metaDescription: quickForm.metaDescription,
        primaryKeyword: quickForm.primaryKeyword,
        keywords: quickForm.keywords,
        imageAlt: quickForm.imageAlt,
        description: quickForm.description,
        specifications: quickForm.specifications,
      });
      await Promise.all([mutateProducts(), mutateStats()]);
      setMessage({ type: 'success', text: `SEO updated for "${editingProduct.title}".` });
      setEditingProduct(null);
      setQuickForm(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.error || 'Could not save SEO updates.' });
    } finally {
      setIsSavingQuick(false);
    }
  };

  const seoHealth = stats?.seoHealth;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">SEO Command Center</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">
            25-Product Launch Setup & Monthly 15-Product Optimization Hub
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleFixSlugs}
            disabled={isMigrating}
            className="px-5 py-3 bg-white border border-border text-primary text-[10px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isMigrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Fix Missing Slugs
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-5 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit CSV
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-500'
              : 'bg-red-50 text-red-700 border-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Health Overview */}
      {seoHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
              Average Product SEO
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-primary">{seoHealth.averagePercentage}%</span>
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {seoHealth.optimizedCount} of {stats.products} products ready (85%+)
            </p>
          </div>

          <div className="bg-white p-6 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
              Needs Optimization
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-600">{seoHealth.needsOptimization}</span>
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Missing Primary KW: {seoHealth.missingPrimaryKeyword} · Missing ALT: {seoHealth.missingImageAlt}
            </p>
          </div>

          <div className="bg-white p-6 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
              Categories SEO Gaps
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-primary">
                {seoHealth.categoryMissingSlug + seoHealth.categoryMissingDesc}
              </span>
              <FileCheck2 className="w-6 h-6 text-accent" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Missing Slug: {seoHealth.categoryMissingSlug} · Missing Desc: {seoHealth.categoryMissingDesc}{' '}
              <Link href="/admin/categories" className="text-accent font-bold hover:underline">
                Fix →
              </Link>
            </p>
          </div>

          <div className="bg-white p-6 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
              Blog SEO Gaps
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-primary">{seoHealth.blogMissingMeta}</span>
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Articles missing slug or meta{' '}
              <Link href="/admin/blogs" className="text-accent font-bold hover:underline">
                Review →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Technical Endpoints & Google Verification Links */}
      <div className="bg-white p-6 border border-border flex flex-wrap items-center justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Technical SEO & Google Tools:
        </span>
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <a href="/sitemap.xml" target="_blank" className="text-muted-foreground hover:text-accent flex items-center gap-1">
            sitemap.xml <ExternalLink className="w-3 h-3" />
          </a>
          <a href="/image-sitemap.xml" target="_blank" className="text-muted-foreground hover:text-accent flex items-center gap-1">
            image-sitemap.xml <ExternalLink className="w-3 h-3" />
          </a>
          <a href="/robots.txt" target="_blank" className="text-muted-foreground hover:text-accent flex items-center gap-1">
            robots.txt <ExternalLink className="w-3 h-3" />
          </a>
          <a href="/api/feed/google-merchant" target="_blank" className="text-muted-foreground hover:text-accent flex items-center gap-1">
            Merchant Feed <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1 font-bold">
            Search Console <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1 font-bold">
            GA4 Analytics <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filter & Queue Controls */}
      <div className="bg-white p-6 border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterTab('needs')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${
              filterTab === 'needs' ? 'bg-amber-500 text-white border-amber-500' : 'border-border text-primary hover:border-accent'
            }`}
          >
            Needs Work ({evaluatedProducts.filter((x) => x.report.percentage < 85).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${
              filterTab === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-primary hover:border-accent'
            }`}
          >
            All ({evaluatedProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('optimized')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${
              filterTab === 'optimized' ? 'bg-green-600 text-white border-green-600' : 'border-border text-primary hover:border-accent'
            }`}
          >
            Optimized ({evaluatedProducts.filter((x) => x.report.percentage >= 85).length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, keyword, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
          />
        </div>
      </div>

      {/* Prioritized Product SEO Queue Table */}
      <div className="bg-white border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                <th className="py-4 px-5">Product</th>
                <th className="py-4 px-5">Primary Keyword</th>
                <th className="py-4 px-5">Meta Lengths</th>
                <th className="py-4 px-5">SEO Score</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map(({ product, report }) => {
                const liveUrl = `https://coronamarineparts.com/product/${product.slug || product._id}`;
                const richTestUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(liveUrl)}`;

                return (
                  <tr key={product._id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.imageAlt || product.title}
                          className="w-12 h-12 object-cover border border-border bg-muted shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-primary uppercase line-clamp-1">{product.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            /product/{product.slug || product._id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {product.primaryKeyword ? (
                        <span className="text-xs font-medium text-primary">{product.primaryKeyword}</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-amber-600">Not mapped</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-[11px] text-muted-foreground">
                      <div>Title: {(product.metaTitle || '').length} chars</div>
                      <div>Desc: {(product.metaDescription || '').length} chars</div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                          report.percentage >= 85
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : report.percentage >= 50
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        {report.score}/{report.maxScore} · {report.percentage}%
                      </span>
                      {report.missingLabels.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                          {report.missingLabels.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openQuickEditor(product)}
                          className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                        >
                          Quick SEO
                        </button>
                        <a
                          href={richTestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 border border-border text-[10px] font-bold uppercase tracking-widest text-primary hover:border-accent"
                          title="Test Structured Data in Google Rich Results Test"
                        >
                          Rich Test
                        </a>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="p-1.5 text-primary hover:text-accent"
                          title="Full Product Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/product/${product.slug || product._id}`}
                          target="_blank"
                          className="p-1.5 text-muted-foreground hover:text-primary"
                          title="Open Live Product Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-xs font-bold uppercase text-muted-foreground">
                    No matching products in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Quick SEO Modal */}
      {editingProduct && quickForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-4xl my-8 border border-border shadow-2xl">
            <div className="flex items-center justify-between p-6 bg-white border-b border-border sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-primary uppercase tracking-tight">
                  Quick SEO Editor — {editingProduct.title}
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Use AI Suggest SEO, verify facts, preview Google result, and save
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setQuickForm(null);
                }}
                className="p-2 text-muted-foreground hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSave} className="p-6 space-y-8">
              <ProductSeoFields
                formData={quickForm}
                categoryName={editingProduct.category?.name}
                onChange={handleQuickChange}
                onKeywordsChange={(keywords) =>
                  setQuickForm((prev) => (prev ? { ...prev, keywords } : prev))
                }
                onSpecificationsChange={(specifications) =>
                  setQuickForm((prev) => (prev ? { ...prev, specifications } : prev))
                }
                onSlugGenerate={(slug) =>
                  setQuickForm((prev) => (prev ? { ...prev, slug } : prev))
                }
                onApplyAiSeo={(updates) =>
                  setQuickForm((prev) => (prev ? { ...prev, ...updates } : prev))
                }
              />

              <div className="bg-white p-6 border border-border space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                  Product Description ({quickForm.description.trim().split(/\s+/).filter(Boolean).length} words)
                </label>
                <textarea
                  name="description"
                  value={quickForm.description}
                  onChange={handleQuickChange}
                  className="w-full px-4 py-3 bg-muted/20 border border-border focus:border-accent outline-none text-xs min-h-[160px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setQuickForm(null);
                  }}
                  className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuick}
                  className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingQuick ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save SEO Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
