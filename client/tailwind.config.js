/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary:  { DEFAULT: '#1A56DB', 50: '#EBF3FF', 100: '#C7DFFE', 500: '#3B82F6', 600: '#1A56DB', 700: '#1448B8', 900: '#0C2F7A' },
        owner:    { DEFAULT: '#0E9F6E', 50: '#E6F9F3', 500: '#10B981', 600: '#0E9F6E', 700: '#087A55' },
        tenant:   { DEFAULT: '#FF5A1F', 50: '#FFF2EE', 500: '#F97316', 600: '#FF5A1F', 700: '#D94515' },
        admin:    { DEFAULT: '#7E3AF2', 50: '#F3EEFE', 500: '#8B5CF6', 600: '#7E3AF2', 700: '#6521D4' },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
