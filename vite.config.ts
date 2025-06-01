import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    build: {
        outDir: path.resolve('./dist'),
        emptyOutDir: false,
        sourcemap: undefined,
        rollupOptions: {
            input: 'src/interactive-light.ts',
            output: {
                dir: path.resolve('./src'),
                entryFileNames: 'interactive-light.js',
            },
        },
    }
});
