import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        // Додайте підтримку для Socket.IO
        hmr: {
            port: 5174
        },
        host: true,
        allowedHosts: [
            'localhost',
            '.ngrok-free.app',
            '.ngrok.io',
            '80d6cea75a6a.ngrok-free.app'
        ]
    }
});
