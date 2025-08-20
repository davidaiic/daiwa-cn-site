/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
    theme: {
        extend: {
            colors: { brand: '#0F4C81', brandAlt: '#1F6FB5', accent: '#6BB5FF' },
            borderRadius: { sm: '6px', md: '10px', lg: '16px' },
            boxShadow: { card: '0 8px 24px rgba(0,0,0,.06)' }
        }
    },
    plugins: []
};
