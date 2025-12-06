/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to right, #14c2e7, #1eb8e5, #2babe3, #4d8ae0, #6374de)',
        'chat_bg': 'url("/src/assets/chat_background2.png")',
        'bg-ai-chat-bg': 'url("/src/assets/ai_chat_bg.png")',
      },
      colors: {
        "custom-white": "#f8f9fd",
        "custom-blue": "#2babe3",
        "custom-button": "#00407c",
        "custom-button-light": "#174C7D",
      },
      fontFamily: {
        custom: ["Montserrat", "sans-serif"],
        custom2: ["Fredoka", "sans-serif"],
      },
    },
  },
  plugins: [],
};
