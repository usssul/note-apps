// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css' // unocss reset
import 'virtual:uno.css'
import 'virtual:unocss-devtools'

import './styles/font-awwsome.min.css'
import './styles/main.css'

import App from './App.vue'

const app = createApp(App)

app.mount('#app')
