import Tov from './presets'
import { defineConfig } from 'vite'
import path from 'path'
import { useEnv } from './presets/shared/detect'
const env = useEnv()

const prefixPath = env.VITE_APP_PREFIX

export default defineConfig({
	plugins: [Tov()],
	base: prefixPath,

	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,
		assetsInlineLimit: 0,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
		rollupOptions: {
			output: {
				manualChunks: {
					'vue-vendor': ['vue', 'vue-router', 'pinia'],
					'element-plus': ['element-plus', '@element-plus/icons-vue'],
					'echarts': ['echarts', 'vue-echarts'],
					'utils': ['axios', 'dayjs'],
				},
				assetFileNames: (assetInfo) => {
					if (assetInfo.name && /\.(woff2?|eot|ttf|otf)(\?.*)?$/.test(assetInfo.name)) {
						return 'assets/fonts/[name]-[hash][extname]'
					}
					return 'assets/[name]-[hash][extname]'
				},
			},
		},
	},
	server: {
		port: 5174,
		host: '0.0.0.0',
		proxy: {
			'/dev': {
				target: 'http://127.0.0.1:6090',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/dev/, ''),
			},
		},
	},
})
