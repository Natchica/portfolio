/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
        colors: {
            // Your deep ocean blue theme
            ocean: {
                50: "#f0f9ff",
                100: "#e0f2fe",
                200: "#bae6fd",
                300: "#7dd3fc",
                400: "#38bdf8",
                500: "#0ea5e9",
                600: "#0284c7",
                700: "#0369a1",
                800: "#075985",
                900: "#0c4a6e",
                950: "#083344",
            },
            // Poneglyph stone colors
            stone: {
                100: "#f7fafc",
                200: "#edf2f7",
                300: "#e2e8f0",
                400: "#cbd5e0",
                500: "#a0aec0",
                600: "#718096",
                700: "#4a5568",
                800: "#2d3748",
                900: "#1a202c",
            },
            // Blockchain connection cyan
            cyber: {
                400: "#00d4ff",
                500: "#00bfff",
                600: "#0099cc",
            },
        },
        fontFamily: {
            ancient: ["serif"],
            modern: ["sans-serif"],
        },
        animation: {
            glow: "glow 2s ease-in-out infinite alternate",
            decrypt: "decrypt 3s ease-out forwards",
        },
        keyframes: {
            glow: {
            from: { boxShadow: "0 0 10px #00bfff" },
            to: { boxShadow: "0 0 20px #00d4ff, 0 0 30px #00d4ff" },
            },
            decrypt: {
            from: { opacity: "0", transform: "translateY(20px)" },
            to: { opacity: "1", transform: "translateY(0)" },
            },
        },
        },
    },
    plugins: [],
};
