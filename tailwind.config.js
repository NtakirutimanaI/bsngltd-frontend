/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode manually
    theme: {
        extend: {
            colors: {
                // Integrating some custom colors if needed, but keeping it simple
            }
        },
    },
    plugins: [],
}
