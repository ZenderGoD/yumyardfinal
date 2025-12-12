import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      keyframes: {
        "fade-scale": {
          "0%": { opacity: "0", transform: "translateY(-50%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(-50%) scale(1)" },
        },
      },
      animation: {
        "fade-scale": "fade-scale 0.2s ease-out",
      },
    },
  },
} satisfies Config;

export default config;




