/**
 * @description 响应码枚举
 */
export enum RESPONSE_CODE {
    NOSUCCESS = -1, // 表示请求成功,但操作未成功
    SUCCESS = 200, //请求成功
    BAD_REQUEST = 400, // 请求参数错误
    UNAUTHORIZED = 401, // 未授权
    FORBIDDEN = 403, // 禁止访问
    NOT_FOUND = 404, // 资源未找到
    INTERNAL_SERVER_ERROR = 500, // 服务器错误
}

/**
 * @description 响应消息枚举
 */
export enum RESPONSE_MESSAGE {
    FAILURE = '请求失败',
    SUCCESS = '请求成功',
}
