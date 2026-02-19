import { Metadata } from 'next'
import ContactFormSection from './contact-form-section'

export const metadata: Metadata = {
  title: 'Contact Us | Corona Marine Parts',
  description: 'Get in touch with Corona Marine Parts for marine spare parts, technical support, and emergency marine assistance. Contact our engineering team for a quote.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return <ContactFormSection />
}
