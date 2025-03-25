/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'grey': {
                    1: '#F6F5F3',
                    2: '#E5E5E5',
                    3: '#B9B9C8',
                    //   "200": "#E5E5E5",
                    //   "400": "#6B6C89",
                    //   backgrounds: {
                    //     "400": "#6B6C89",
                    //   },
                },
                'dark': {
                    strong: '#1B1F39',
                    medium: '#5B5E70',
                    soft: '#9395A1',
                },
                'light': {
                    strong: '#FFFFFF',
                    medium: 'rgba(255, 255, 255, 64%)',
                },
                'primary': {
                    DEFAULT: '#5214DC',
                    pressed: '#4614B8',
                    active: '#3A1098',
                },
                'secondary': {
                    DEFAULT: '#EFE7FF',
                    pressed: '#D6C2FF',
                },
                'destructive': {
                    DEFAULT: '#EB5757',
                    pressed: '#E33333',
                },
                'unique-product-colours-dark': '#3903B2',
                // tint: "#EEE8FB",
                'scrim': 'rgba(27, 31, 57, 0.32)',
                'error': '#B20101',
                'status': {
                    error: '#FFCFCC',
                },
            },
            fontSize: {
                'p': ['1.125rem', '1.5rem'],
                'p-small': ['1rem', '1.25rem'],
                'caption': ['0.875rem', '1.125rem'],
                'fine-print': ['0.75rem', '1rem'],
                'all-caps': ['0.875rem', '1.5rem'],
                'h2': ['2.25rem', '2.5rem'],
                'h3': ['2rem', '2.25rem'],
                'h5': ['1.5rem', '2rem'],
                'h6': ['1.25rem', '1.625rem'],
            },
            fontFamily: {
                'mier-a': 'MierA',
            },
            boxShadow: {
                'dialogue':
          '0px 2px 2px 0px rgba(0, 0, 0, 0.10), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 22px 80px -4px rgba(0, 0, 0, 0.15)',
                'bottom-line': '0px -1px 0px 0px #e5e5e5 inset',
                'top-line-plus-shadow': '0px -3px 3px 0px rgba(0, 0, 0, 0.05), 0px 1px 0px 0px #E5E5E5 inset',
                'card': '0px 2px 2px 0px rgba(0, 0, 0, 0.10)',
            },
        },
    },
    plugins: [],
};