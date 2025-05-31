import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    build: {
        outDir: path.resolve('./dist'),
        emptyOutDir: true,
        sourcemap: undefined,
        rollupOptions: {
            input: 'src/interactive-light.ts',
            output: {
                dir: path.resolve('./dist/src'),
                entryFileNames: 'interactive-light.js',
            },
        },
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'module.json',
                    dest: './'
                },
                {
                    src: 'LICENSE',
                    dest: './'
                },
                {
                    src: 'readme.md',
                    dest: './'
                },
                {
                    src: 'lang/*',
                    dest: './lang/'
                }
            ]
        })
    ]
});
