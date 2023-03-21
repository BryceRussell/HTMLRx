import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      registerNodeLoader: true,
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src/'),
    },
  },
});