import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetUno,
	transformerVariantGroup,
	transformerDirectives,
} from 'unocss'

import presetAutoprefixer from './presets/autoprefixer'

export default defineConfig({
	transformers: [transformerDirectives(), transformerVariantGroup()],
	presets: [
		presetAttributify(),
		presetIcons({
			autoInstall: true,
		}),
		presetUno(),
		presetTypography(),
		presetAutoprefixer(),
	],
	theme: {
		colors: {
			primary: '#3880ff',
			neutral: '#666666',
		},
	},
})
