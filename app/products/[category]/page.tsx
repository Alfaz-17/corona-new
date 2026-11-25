import { Metadata } from 'next'
import { Suspense } from 'react'
import CategoryContent from './category-content'
import { MarineLoader } from '@/components/common/marine-loader'
import ItemListStructuredData from '@/components/seo/item-list-structured-data'
import { getCategories, getCategoryBySlugOrId, getProducts } from '@/lib/catalog-data'

export const revalidate = 3600

type Props = {
  params: Promise<{ category: string }>
}

// SEO descriptions for known categories - add more as needed
const categoryDescriptions: Record<string, { title: string; description: string; keywords: string[] }> = {
  'automation': {
    title: 'Marine Automation Systems & Control Panels',
    description: 'Buy genuine marine automation systems, ship control panels, PLC modules, and automation spare parts from Alang Shipyard. Certified refurbished marine automation equipment with worldwide shipping.',
    keywords: ['marine automation', 'ship control panels', 'marine PLC', 'vessel automation systems', 'marine control systems', 'ship automation spare parts']
  },
  'electronics': {
    title: 'Marine Electronics & Electrical Equipment',
    description: 'Shop marine electronics, ship electrical components, marine sensors, communication equipment, and navigation electronics. All parts sourced from Alang Shipyard with quality certification.',
    keywords: ['marine electronics', 'ship electrical parts', 'marine sensors', 'marine communication equipment', 'ship navigation electronics']
  },
  'engine-spare-parts': {
    title: 'Ship Engine Spare Parts & Components',
    description: 'Buy ship engine spare parts including fuel pumps, injectors, turbochargers, cylinder heads, and engine room machinery. Genuine OEM parts from Alang ship breaking yard.',
    keywords: ['ship engine parts', 'marine engine spares', 'marine fuel pump', 'ship turbocharger', 'marine cylinder head', 'engine room parts']
  },
  'safety': {
    title: 'Marine Safety Equipment & Fire Fighting Systems',
    description: 'Shop marine safety equipment, fire detection systems, fire fighting equipment, life-saving appliances, and safety spare parts. IMO certified marine safety gear.',
    keywords: ['marine safety equipment', 'ship fire safety', 'marine fire detection', 'life saving equipment', 'IMO safety gear']
  },
  'pumps': {
    title: 'Marine Pumps & Purifiers',
    description: 'Buy marine pumps, ship purifiers, centrifugal pumps, oil purifiers, and pump spare parts. Certified refurbished marine pumps from Alang Shipyard with worldwide delivery.',
    keywords: ['marine pumps', 'ship purifiers', 'marine centrifugal pump', 'oil purifier marine', 'marine pump spare parts']
  },
  'generators': {
    title: 'Marine Generators & Power Systems',
    description: 'Shop marine generators, ship power systems, alternators, and generator spare parts. Reliable marine power equipment sourced from Alang ship recycling yard.',
    keywords: ['marine generators', 'ship power systems', 'marine alternator', 'ship generator parts', 'marine power equipment']
  },
  'navigation': {
    title: 'Marine Navigation Equipment & Systems',
    description: 'Buy marine navigation equipment, GPS systems, radar equipment, ECDIS, gyro compass, and navigation spare parts. Certified marine navigation systems.',
    keywords: ['marine navigation equipment', 'ship GPS', 'marine radar', 'ECDIS system', 'gyro compass marine']
  },
  'hydraulic': {
    title: 'Marine Hydraulic & Pneumatic Systems',
    description: 'Shop marine hydraulic systems, pneumatic equipment, hydraulic pumps, valves, and spare parts. Quality-tested marine hydraulic components from Alang Shipyard.',
    keywords: ['marine hydraulic systems', 'ship pneumatic equipment', 'marine hydraulic pump', 'marine hydraulic valve']
  },
  'deck-machinery': {
    title: 'Deck Machinery & Winch Systems',
    description: 'Buy deck machinery, marine winches, crane components, mooring equipment, and anchor windlass parts. Heavy marine deck equipment from ship recycling yard.',
    keywords: ['deck machinery', 'marine winch', 'ship crane parts', 'mooring equipment', 'anchor windlass parts']
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  
  try {
    const categoryObj = await getCategoryBySlugOrId(decodedCategory)
    const categoryName = (categoryObj as any)?.name || decodedCategory.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    
    // Check for predefined SEO content
    const seoData = categoryDescriptions[decodedCategory] || categoryDescriptions[decodedCategory.toLowerCase()]
    
    const title = seoData?.title || `${categoryName} | Marine Spare Parts | Corona Marine Parts`
    const description = (categoryObj as any)?.description || seoData?.description || `Buy genuine ${categoryName} marine spare parts from Alang Shipyard. Certified quality ${categoryName.toLowerCase()} with worldwide shipping. Best prices from Corona Marine Parts.`
    const keywords = seoData?.keywords || [categoryName, 'marine spare parts', `${categoryName} supplier`, 'ship parts', 'Alang shipyard']
    const canonicalSlug = (categoryObj as any)?.slug || category

    return {
      title: `${title} | Buy Online | Corona Marine Parts`,
      description,
      keywords: [...keywords, 'Corona Marine Parts', 'Alang Shipyard', 'buy marine parts online'],
      alternates: {
        canonical: `/products/${canonicalSlug}`,
      },
      openGraph: {
        title: `${title} | Corona Marine Parts`,
        description,
        url: `https://coronamarineparts.com/products/${canonicalSlug}`,
        type: 'website',
        images: [{
          url: (categoryObj as any)?.image || 'https://coronamarineparts.com/products-hero.png',
          width: 1200,
          height: 630,
          alt: `${categoryName} - Marine Spare Parts from Alang Shipyard`,
        }],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch {
    const categoryName = decodedCategory.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    return {
      title: `${categoryName} | Marine Spare Parts | Corona Marine Parts`,
      description: `Buy genuine ${categoryName} marine spare parts from Alang Shipyard. Quality certified with worldwide shipping.`,
    }
  }
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((c: any) => ({
      category: c.slug || c._id,
    }))
  } catch {
    return []
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const [categoryObj, allCategories] = await Promise.all([
    getCategoryBySlugOrId(category),
    getCategories(),
  ])
  const products = categoryObj
    ? await getProducts({ categoryId: (categoryObj as any)._id })
    : []

  const categoryName = (categoryObj as any)?.name || decodeURIComponent(category).replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

  return (
    <>
      <ItemListStructuredData
        products={products}
        listName={`${categoryName} - Corona Marine Parts`}
        listUrl={`https://coronamarineparts.com/products/${(categoryObj as any)?.slug || category}`}
      />
      <Suspense fallback={<MarineLoader />}>
        <CategoryContent
          initialProducts={products}
          initialCategory={categoryObj}
          initialAllCategories={allCategories}
        />
      </Suspense>
    </>
  )
}
