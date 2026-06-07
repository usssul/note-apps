/**
 * base 安全的路径解析
 * @param path 路径
 */
export function assertSafeResolve(path: string) {
	return BASE_URL_WITHOUT_TAIL + path
}

export function safeResolve(path: string) {
	return BASE_URL_WITHOUT_TAIL.replace(import.meta.env.VITE_APP_PREFIX, '') + path
}
