import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // We use standard tailwind colors, but we can extend if needed.
        // The project uses standard colors: slate, emerald, cyan, bg-white, etc.
        // No custom colors detected requiring specific extension, but we can add
        // primary/secondary aliases if desired.
        // For now, ensuring standard palette is available.
      },
      fontFamily: {
        body: ['Kedebideri', 'sans-serif'],
        sans: ['"Science Gothic', 'sans-serif'],
        heading: ['"Stack Sans Notch"', 'sans-serif']
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
