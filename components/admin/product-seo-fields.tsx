"use client"

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, Sparkles, Search, Loader2 } from 'lucide-react';
import { evaluateProductSeo } from '@/lib/seo-score';
import { slugifyText } from '@/lib/utils';

export interface ProductFormSeoState {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  keywords: string[];
  imageAlt: string;
  brandName: string;
  modelNumber: string;
  sku: string;
  description: string;
  specifications: Record<string, any>;
}

interface ProductSeoFieldsProps {
  formData: ProductFormSeoState;
  categoryName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onSpecificationsChange: (specs: Record<string, any>) => void;
  onSlugGenerate: (slug: string) => void;
  onApplyAiSeo?: (updates: Partial<ProductFormSeoState>) => void;
}

export function ProductSeoFields({
  formData,
  categoryName,
  onChange,
  onKeywordsChange,
  onSpecificationsChange,
  onSlugGenerate,
  onApplyAiSeo,
}: ProductSeoFieldsProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiSuggestSeo = async () => {
    if (!formData.title?.trim() || !onApplyAiSeo) return;
    setIsSuggesting(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/seo-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          brandName: formData.brandName,
          modelNumber: formData.modelNumber,
          sku: formData.sku,
          categoryName,
          primaryKeyword: formData.primaryKeyword,
          description: formData.description,
          specifications: formData.specifications,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate SEO suggestions');

      const currentWordCount = (formData.description || '').trim().split(/\s+/).filter(Boolean).length;
      onApplyAiSeo({
        primaryKeyword: data.primaryKeyword || formData.primaryKeyword,
        keywords: Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords : formData.keywords,
        slug: formData.slug?.trim() ? formData.slug : (data.slug || formData.slug),
        metaTitle: data.metaTitle || formData.metaTitle,
        metaDescription: data.metaDescription || formData.metaDescription,
        imageAlt: data.imageAlt || formData.imageAlt,
        ...(currentWordCount < 150 && data.description ? { description: data.description } : {}),
      });
    } catch (err: any) {
      setAiError(err.message || 'Could not generate SEO suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const seoReport = evaluateProductSeo(formData);
  const specEntries = Object.entries(formData.specifications || {});

  const handleAddKeyword = () => {
    const items = keywordInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !formData.keywords.includes(s));
    if (items.length > 0) {
      onKeywordsChange([...formData.keywords, ...items]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (idx: number) => {
    onKeywordsChange(formData.keywords.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    const k = newSpecKey.trim();
    const v = newSpecVal.trim();
    if (!k || !v) return;
    onSpecificationsChange({ ...(formData.specifications || {}), [k]: v });
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleUpdateSpec = (key: string, value: string) => {
    onSpecificationsChange({ ...(formData.specifications || {}), [key]: value });
  };

  const handleRemoveSpec = (key: string) => {
    const next = { ...(formData.specifications || {}) };
    delete next[key];
    onSpecificationsChange(next);
  };

  const previewTitle = formData.metaTitle?.trim() || formData.title?.trim() || 'Product SEO Title';
  const previewSlug = formData.slug?.trim() || slugifyText(formData.title || 'product-url-slug');
  const previewDesc =
    formData.metaDescription?.trim() ||
    formData.description?.trim().slice(0, 155) ||
    'Add a concise meta description (140-160 characters) summarizing product specifications and enquiry details.';

  return (
    <div className="space-y-10">
      {/* SEO & Keyword Mapping Card */}
      <div className="bg-white p-10 border border-border space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">SEO, Keywords & Meta</h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              Assign 1 primary keyword and supporting search terms naturally.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onApplyAiSeo && (
              <button
                type="button"
                onClick={handleAiSuggestSeo}
                disabled={isSuggesting || !formData.title?.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isSuggesting ? 'Generating...' : 'AI Suggest SEO'}
              </button>
            )}
            <div
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                seoReport.percentage >= 85
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : seoReport.percentage >= 50
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-red-50 text-red-700 border-red-300'
              }`}
            >
              SEO Score: {seoReport.score}/{seoReport.maxScore} ({seoReport.percentage}%)
            </div>
          </div>
        </div>

        {aiError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {aiError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Primary Keyword
            </label>
            <input
              name="primaryKeyword"
              placeholder="e.g. marine fuel injection pump"
              className="w-full px-4 py-3.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
              value={formData.primaryKeyword}
              onChange={onChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
                URL Slug
              </label>
              <button
                type="button"
                onClick={() => onSlugGenerate(slugifyText(formData.primaryKeyword || formData.title || ''))}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <input
              name="slug"
              placeholder="product-url-slug"
              className="w-full px-4 py-3.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-mono"
              value={formData.slug}
              onChange={onChange}
            />
            <p className="text-[10px] text-muted-foreground truncate">
              coronamarineparts.com/product/{previewSlug}
            </p>
          </div>
        </div>

        {/* Secondary Keywords */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Secondary Keywords ({formData.keywords.length})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add keywords separated by comma (e.g. Bosch fuel pump, XYZ-100)"
              className="flex-1 px-4 py-3 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-5 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Add
            </button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border text-[10px] font-bold text-primary"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(idx)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    aria-label={`Remove ${kw}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
              SEO Title
            </label>
            <span
              className={`text-[10px] font-bold ${
                formData.metaTitle.length > 65 ? 'text-amber-600' : 'text-muted-foreground'
              }`}
            >
              {formData.metaTitle.length} / 60 chars
            </span>
          </div>
          <input
            name="metaTitle"
            placeholder="e.g. Marine Fuel Injection Pump | Bosch XYZ-100"
            className="w-full px-4 py-3.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
            value={formData.metaTitle}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Meta Description
            </label>
            <span
              className={`text-[10px] font-bold ${
                formData.metaDescription.length > 165 ? 'text-amber-600' : 'text-muted-foreground'
              }`}
            >
              {formData.metaDescription.length} / 160 chars
            </span>
          </div>
          <textarea
            name="metaDescription"
            placeholder="Concise summary for Google search results (140-160 chars)"
            className="w-full px-4 py-3.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs min-h-[90px]"
            value={formData.metaDescription}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Main Image ALT Text
            </label>
            <span className="text-[10px] font-bold text-muted-foreground">
              {formData.imageAlt.length} / 125 chars
            </span>
          </div>
          <input
            name="imageAlt"
            placeholder="e.g. Bosch XYZ-100 marine fuel injection pump"
            className="w-full px-4 py-3.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
            value={formData.imageAlt}
            onChange={onChange}
          />
        </div>

        {/* Google SERP Preview + Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="p-5 bg-muted/20 border border-border space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              <Search className="w-3.5 h-3.5 text-accent" /> Google Search Preview
            </div>
            <p className="text-[11px] text-green-700 truncate">
              https://coronamarineparts.com/product/{previewSlug}
            </p>
            <p className="text-base font-medium text-blue-800 leading-snug line-clamp-1">
              {previewTitle}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {previewDesc}
            </p>
          </div>

          <div className="p-5 bg-muted/20 border border-border space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
              SEO Readiness Checklist
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {seoReport.checks.map((chk) => (
                <div key={chk.id} className="flex items-start gap-2" title={chk.hint}>
                  {chk.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-[11px] leading-tight ${
                      chk.passed ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {chk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Key-Value Editor */}
      <div className="bg-white p-10 border border-border space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            Verified Technical Specifications
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Displayed in the product specification table for buyers and search crawlers.
          </p>
        </div>

        {specEntries.length > 0 && (
          <div className="space-y-3">
            {specEntries.map(([key, value]) => (
              <div key={key} className="grid grid-cols-12 gap-3 items-center">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="col-span-5 px-3 py-2.5 bg-muted/30 border border-border text-xs font-bold text-primary"
                />
                <input
                  type="text"
                  value={String(value ?? '')}
                  onChange={(e) => handleUpdateSpec(key, e.target.value)}
                  className="col-span-6 px-3 py-2.5 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(key)}
                  className="col-span-1 flex items-center justify-center p-2.5 text-red-500 hover:text-red-700 border border-border hover:bg-red-50"
                  aria-label={`Remove ${key}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-12 gap-3 pt-2">
          <input
            type="text"
            placeholder="Spec name (e.g. Application)"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            className="col-span-5 px-3 py-3 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
          />
          <input
            type="text"
            placeholder="Spec value (e.g. Marine diesel engine)"
            value={newSpecVal}
            onChange={(e) => setNewSpecVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSpec();
              }
            }}
            className="col-span-5 px-3 py-3 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
          />
          <button
            type="button"
            onClick={handleAddSpec}
            className="col-span-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
