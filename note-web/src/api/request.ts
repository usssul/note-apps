import axios from 'axios';

export const BASE_URL = process.env.NODE_ENV == 'development'? '/dev' :'/api'

const getUrlToken = () => {
  const url = window.location.href;
  const tokenRegex = /token=([^#]+)/;
  const tokenMatch = url.match(tokenRegex);
  const tokenStore = useToken()
  let tokenValue = tokenMatch ? tokenMatch[1] : '';
  if (!tokenValue) tokenValue = tokenStore.token
  if (tokenValue) tokenStore.token = tokenValue
  return tokenValue;
};

// 创建Axios实例
const instance = axios.create({
  baseURL: BASE_URL,
//   timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 设置请求头
    // config.headers.loginId = useUserInfo().loginId;
    // const urlToken = getUrlToken();
    // if (urlToken) config.headers.Authorization = urlToken;

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const { data, config } = response;
    // switch(data.code){
    //     case 0:
    //         return Promise.resolve(data);
    //     case 1001:
    //         //未登录
    //         if (window.location.pathname.includes('gdsx')) {
    //           window.location.href = '/gdsx/pc/oauth2'
    //         } else if (window.location.pathname.includes('jnu')) {
    //           window.location.href = '/bdd/pc/oauth2'
    //         }
    //         return Promise.reject(data);
    //     default:
    //         ElMessage.error(data.msg || data.errmsg || '网络请求异常');
    //         return Promise.reject(data);
    // }
    return data;
  },
  error => {
    const config = error.config || {};
    
    // 处理网络错误
    if (error.response) {
      switch (error.response.status) {
        case 502:
          ElMessage.error('网络连接异常，请稍后再试');
          break;
        default:
          ElMessage.error('请求失败，请检查网络');
      }
    }

    // 重试机制
    if (!config.FEHasRetry) config.FEHasRetry = 0;
    if (config.FEHasRetry < 3) {
      config.FEHasRetry++;
      return instance(config);
    }

    return Promise.reject(error);
  }
);

export default instance;