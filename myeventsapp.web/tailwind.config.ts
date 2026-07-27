import type {Config} from "tailwindcss";

const config: Config ={
    content:[
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend:{
            colors:{
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand:{
                    dark: "#111111",
                    gray: "#666666",
                    accent: "#FF4c3b",
                    accentHover: "#f7f7f7",
                }
            },
            fonteFamily: {
                sans: ["var(--font-outfit)", "sans-serif"],
            }
        },
    },
    plugins :[],
};

export default config;