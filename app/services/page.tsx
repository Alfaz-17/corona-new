import { Metadata } from 'next'
import ServicesContent from './services-content'

export const metadata: Metadata = {
  title: 'Marine Services & Engineering Support | Corona Marine Parts',
  description: 'Specialized marine engineering services including automation control, engine room maintenance, and electronic systems support. Reliable technical solutions for the global maritime fleet.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Marine Engineering Services | Technical Support',
    description: 'Expert marine services from automation to machinery spares. Certified technical support worldwide.',
    url: 'https://coronamarineparts.com/services',
  }
}

export default function ServicesPage() {
  return <ServicesContent />
}


