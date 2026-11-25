import { Metadata } from 'next'
import BlogContent from './blog-content'
import { getBlogs } from '@/lib/catalog-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Industry Insights & Marine Technical Guides | Corona Marine Parts',
  description: 'Read the latest news, technical guides, and industry insights from the maritime world. Our editorial team shares expert knowledge on marine automation and machinery.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Maritime Industry Insights | Corona Marine Blog',
    description: 'Expert technical guides and latest news from the global marine industry specialists.',
    url: 'https://coronamarineparts.com/blog',
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  return <BlogContent initialBlogs={blogs} />
}
