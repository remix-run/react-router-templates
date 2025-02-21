import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

// Create a defaultPreset function to mirror the vercelPreset structure
const defaultPreset = () => ({
  name: 'local-development',
  // Include any necessary preset configurations for local development
  vite: {
    // Any vite configurations needed
  },
});

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  presets: [process.env.VERCEL ? vercelPreset() : defaultPreset()],
} satisfies Config;
