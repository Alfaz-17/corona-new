import { Metadata } from 'next'
import AboutContent from './about-content'

export const metadata: Metadata = {
  title: 'About Us | Corona Marine Parts',
  description: 'Learn about Corona Marine Parts, a reliable supplier of marine spare parts and automation systems since 2023. We support the global maritime industry with quality-checked components.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Corona Marine Parts | Marine Spare Parts Supplier',
    description: 'Our legacy of supporting maritime professionals with reliable engineering solutions and genuine spare parts.',
    url: 'https://coronamarineparts.com/about',
  }
}

export default function AboutPage() {
  return <AboutContent />
}
