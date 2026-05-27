import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface ProductCardProps {
  product: {
    _id: string
    slug?: string
    title: string
    image: string
    brandName?: string
    brand?: {
      name: string
    }
    category?: {
      name: string
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image || "/placeholder.svg")
  const [hasError, setHasError] = useState(false)

  // Build keyword-rich alt text for Google Image SEO
  const brandName = product.brandName || product.brand?.name || ''
  const categoryName = product.category?.name || 'Marine Parts'
  const altText = `${product.title}${brandName ? ` by ${brandName}` : ''} - ${categoryName} | Marine Spare Parts Supplier | Corona Marine Parts`

  return (
    <Link href={`/product/${product.slug || product._id}`} className="group block h-full bg-white border border-border hover:border-accent transition-all relative">
        <div className="aspect-[4/5] relative overflow-hidden bg-muted">
            <Image 
            src={imgSrc} 
            alt={altText}
            title={`${product.title} - ${categoryName} from Alang Shipyard`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => {
                if (!hasError) {
                    setHasError(true);
                    setImgSrc("/placeholder.svg");
                }
            }}
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <span className="px-5 py-2 bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-xl">Details</span>
            </div>
        </div>
        <div className="p-4 border-t border-border">
            <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-1 block">
            {categoryName}
            </span>
            <h3 className="text-sm font-bold text-primary line-clamp-2 uppercase tracking-tight group-hover:text-accent transition-colors">
            {product.title}
            </h3>
        </div>
    </Link>
  )
}
