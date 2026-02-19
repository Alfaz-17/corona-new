import { Metadata } from 'next'
import api from '@/lib/api'
import BlogDetailContent from './blog-detail-content'
import { MarineLoader } from '@/components/common/marine-loader'
import Link from 'next/link'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { data: blog } = await api.get(`/blogs/${slug}`)
    
    if (!blog) return { title: 'Article Not Found' }

    return {
      title: `${blog.title} | Marine Engineering Blog`,
      description: blog.excerpt,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        images: [blog.image],
        type: 'article',
        publishedTime: blog.date,
        url: `https://coronamarineparts.com/blog/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.excerpt,
        images: [blog.image],
      }
    }
  } catch (error) {
    return { title: 'Marine Industry Insights' }
  }
}

export default async function BlogDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
    const { data: blog } = await api.get(`/blogs/${slug}`);
    
    if (!blog) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
          <h2 className="text-3xl font-bold text-primary">Article Not Found</h2>
          <Link href="/blog" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Return to Blog</Link>
        </div>
      );
    }

    return <BlogDetailContent blog={blog} />;
  } catch (err) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-bold text-primary">Connection Lost</h2>
        <Link href="/blog" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Retry Connection</Link>
      </div>
    );
  }
}
