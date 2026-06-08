import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent:       '#ef233c',
        'accent-dark':'#9d0208',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl':   '24px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.4s ease both',
      },
    },
  },
  plugins: [],
}

export default config
