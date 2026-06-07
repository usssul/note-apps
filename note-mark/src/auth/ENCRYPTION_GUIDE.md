# 前后端加密交互指南

## 加密配置

### 前后端共享的加密参数

```typescript
// 密钥
const key = CryptoJS.enc.Utf8.parse("sdghj7df7h23jhy9yh94");

// 初始化向量 (IV)
const iv = CryptoJS.enc.Utf8.parse("gysd7sdg87g2487crhhu");
```

## 后端实现

后端使用 `CryptoUtil` 工具类进行加密和解密：

```typescript
import { CryptoUtil } from '../utils/crypto.util';

// 加密示例
const encrypted = CryptoUtil.encrypt('原始文本');

// 解密示例
const decrypted = CryptoUtil.decrypt('加密后的文本');
```

## 前端加密流程

### 1. 用户注册 (POST /dev/auth/register)

```javascript
// 前端代码示例
const key = CryptoJS.enc.Utf8.parse("sdghj7df7h23jhy9yh94");
const iv = CryptoJS.enc.Utf8.parse("gysd7sdg87g2487crhhu");

// 加密密码
const encryptedPassword = CryptoJS.AES.encrypt(
  password,
  key,
  {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }
).toString();

// 发送请求
const response = await axios.post('/dev/auth/register', {
  username: 'user123',
  email: 'user@example.com',
  password: encryptedPassword, // 发送加密后的密码
  firstName: 'John',
  lastName: 'Doe'
});
```

### 2. 用户登录 (POST /dev/auth/login)

```javascript
// 前端代码示例
const key = CryptoJS.enc.Utf8.parse("sdghj7df7h23jhy9yh94");
const iv = CryptoJS.enc.Utf8.parse("gysd7sdg87g2487crhhu");

// 加密密码
const encryptedPassword = CryptoJS.AES.encrypt(
  password,
  key,
  {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }
).toString();

// 发送请求
const response = await axios.post('/dev/auth/login', {
  username: 'user123',
  password: encryptedPassword // 发送加密后的密码
});

// 响应中获取 token
const token = response.data.data.token;
```

## 后端响应处理

### 注册成功响应

```json
{
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-12-17T...",
    "updatedAt": "2025-12-17T..."
  },
  "message": "注册成功",
  "timestamp": 1703066400000,
  "statusCode": 200
}
```

### 登录成功响应

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "登录成功",
  "timestamp": 1703066400000,
  "statusCode": 200
}
```

### 错误响应

```json
{
  "data": null,
  "message": "用户名或密码错误",
  "timestamp": 1703066400000,
  "statusCode": 400
}
```

## 加密工作流程

1. **前端**：使用固定的密钥和 IV 加密用户密码
2. **传输**：将加密后的密码发送到后端
3. **后端**：接收加密的密码，使用 CryptoUtil 解密
4. **验证**：使用解密后的密码与数据库中的哈希密码进行比对
5. **响应**：返回 JWT token（如果登录）或用户信息（如果注册）

## 注意事项

- 密钥和 IV 必须保持一致，否则解密会失败
- 后端使用的加密模式是 **CBC** 模式，padding 是 **PKCS7**
- 密码在数据库中存储的是 bcrypt 哈希值，不是明文或加密值
- JWT Token 用于后续的身份认证，应存储在 localStorage 或 sessionStorage 中
- 建议在生产环境中使用 HTTPS 来保护传输层安全
