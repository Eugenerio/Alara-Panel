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
            'b733509dab21.ngrok-free.app'
        ]
    }
});
