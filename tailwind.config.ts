import {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add other paths if your content is located elsewhere
  ],
    plugins: [require("@tailwindcss/typography")],
  };

  export default config;
