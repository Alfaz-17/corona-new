import { Metadata } from 'next'
import BlogDetailContent from './blog-detail-content'
import BlogStructuredData from '@/components/seo/blog-structured-data'
import Link from 'next/link'
import { getBlogBySlugOrId, getBlogs } from '@/lib/catalog-data'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  try {
    const blog = await getBlogBySlugOrId(slug)

    if (!blog) return { title: 'Article Not Found' }

    const canonicalSlug = (blog as any).slug || slug
    const title = (blog as any).metaTitle || `${(blog as any).title} | Marine Engineering Blog`
    const description = (blog as any).metaDescription || (blog as any).excerpt

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${canonicalSlug}`,
      },
      openGraph: {
        title,
        description,
        images: (blog as any).image ? [(blog as any).image] : undefined,
        type: 'article',
        publishedTime: (blog as any).date,
        url: `https://coronamarineparts.com/blog/${canonicalSlug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: (blog as any).image ? [(blog as any).image] : undefined,
      }
    }
  } catch (error) {
    return { title: 'Marine Industry Insights' }
  }
}

export async function generateStaticParams() {
  try {
    const blogs = await getBlogs()
    return blogs.map((blog: any) => ({
      slug: blog.slug || blog._id,
    }))
  } catch (error) {
    return []
  }
}

export default async function BlogDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlugOrId(slug);

    if (!blog) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
          <h2 className="text-3xl font-bold text-primary">Article Not Found</h2>
          <Link href="/blog" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Return to Blog</Link>
        </div>
      );
    }

    const canonicalSlug = (blog as any).slug || slug;

    return (
      <>
        <BlogStructuredData blog={blog as any} slug={canonicalSlug} />
        <BlogDetailContent blog={blog} />
      </>
    );
  } catch (err) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-bold text-primary">Connection Lost</h2>
        <Link href="/blog" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Retry Connection</Link>
      </div>
    );
  }
}
