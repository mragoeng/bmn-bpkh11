import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: '#2D6A4F',
                    light: '#40916C',
                    pale: '#B7E4C7',
                    dark: '#1B4332',
                },
                accent: {
                    DEFAULT: '#D4A017',
                    light: '#F5E6B8',
                    dark: '#92770E',
                },
            },
        },
    },

    plugins: [forms],
};
