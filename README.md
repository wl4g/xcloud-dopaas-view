### 快速开始

1. 编译安装
```
npm install
# 开发环境启动
npm run dev
# 生产环境打包
npm run build
```

2. 配置hosts
C:\Windows\System32\drivers\etc 或 vim /etc/hosts
```
127.0.0.1  wl4g.debug
```

3. 浏览器访问
http://wl4g.debug


### 项目结构:
- /src 主要编辑代码
- /build 打包配置代码
- /node_modules 依赖包文件夹
- /static 某些静态文件
- /config 生产环境和开发环境下的配置
- /config/index.js 可配置开发环境的端口,代理地址等

[对应后端项目](../../../xcloud-devops)
