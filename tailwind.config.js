module.exports = {
    content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            boxShadow: {
                glow: '0 0 40px rgba(249, 115, 22, 0.15)',
                orangeGlow: '0 0 40px rgba(249, 115, 22, 0.2)',
                redGlow: '0 0 45px rgba(239, 68, 68, 0.25)',
            },
            backgroundImage: {
                'hero-gradient': 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.15), transparent 45%), radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.12), transparent 40%), linear-gradient(180deg, #080303 0%, #160a0a 100%)',
                'magma-gradient': 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08), transparent 50%)',
            },
        },
    },
    plugins: [],
};