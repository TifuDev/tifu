module.exports = {
    darkMode: 'media',
    variants: {
        extend: {},
    },
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        colors: {
            blue: '#2962ff',
            black: {
                800: '#424242',
                900: '#212121'
            },
            white: '#F5F5F5' 
        },
        fontFamily: {
            sans: ['Open Sans', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
        },
        extend: {
            spacing: {
              '128': '32rem',
              '144': '36rem',
            },
            borderRadius: {
              '4xl': '2rem',
            },
            fontFamily: {
                'sans': ['Open Sans']
            }
        }
    },
    // purge: {
    //     enabled: true,
    //     content: ['./src/**/*.html'],
    //     options: {
    //         safelist: ['my-2', 'text-2xl', 'underline', 'font-semibold', 'font-light', 'list-disc', 'p-2', 'rounded-md', 'mx-auto'],
    //         blocklist: [/^debug-/],
    //         keyframes: true,
    //         fontFace: true,
    //     } 
    // },
    mode: 'jit',
    plugins: []
};