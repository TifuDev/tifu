module.exports = {
    darkMode: 'media',
    variants: {
        extend: {},
    },
    purge: {
        enabled: true,
        content: ['./src/**/*.html'],
        options: {
            safelist: ['my-2', 'text-2xl', 'underline', 'font-semibold', 'font-light', 'list-disc', 'p-2', 'rounded-md', 'mx-auto'],
            blocklist: [/^debug-/],
            keyframes: true,
            fontFace: true,
        } 
    },
    mode: 'jit',
    plugins: []
};