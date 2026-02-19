import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Corona Marine Parts',
    short_name: 'Corona Marine',
    description: 'Marine Spare Parts & Services Supplier',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E2A47',
    theme_color: '#0E2A47',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
