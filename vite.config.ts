import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import ViteComponents from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default ({ mode }) => {
    const __DEV__ = mode === 'development';

    return defineConfig({
        base: __DEV__ ? '/' : './',
        define: {
            'process.platform': null,
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            },
        },
        plugins: [
            vue(),
            ViteComponents({
                dts: true,
                resolvers: [
                  NaiveUiResolver()
                ],
            }),
        ],
        server: {
            open: true,
            port: 2021,
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            chunkSizeWarningLimit: 1024,
            sourcemap: false,
        },
    });
};
