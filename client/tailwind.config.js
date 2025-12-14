/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FDFBF7',
                'saffron-start': '#FF8E53',
                'saffron-end': '#E65100',
                'premium-green': '#2E7D32',
                'chocolate': '#3E2723',
                'maroon': '#880E4F',
            },
            fontFamily: {
                playfair: ['"Playfair Display"', 'serif'],
                poppins: ['"Poppins"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
