import Image from 'next/image'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = "", variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-27 w-auto',
    md: 'h-27 w-auto',
    lg: 'h-27 w-auto'
  }

  const textColors = {
    dark: 'text-primary',
    light: 'text-foreground',
    white: 'text-white'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizes[size]}`}>
        <img 
          src="/logo.png" 
          alt="Corona Marine Logo" 
          className="h-full w-auto object-contain"
          onError={(e) => {
            // Fallback if logo.png fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  )
}
