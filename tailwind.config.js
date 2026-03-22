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
                primary: '#009CFF',
                light: '#F3F6F9',
                dark: '#191C24',
                emerald: {
                    50: '#eaf6ff',
                    100: '#d5edff',
                    200: '#b0deff',
                    300: '#76c8ff',
                    400: '#34aeff',
                    500: '#009CFF', // Dashmin Primary
                    600: '#008ae2',
                    700: '#006eb5',
                    800: '#005d96',
                    900: '#004d7c',
                    950: '#003154',
                }
            }
        },
    },
    plugins: [],
}
