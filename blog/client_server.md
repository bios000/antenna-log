# 前后端分离部署

## 关于server与client

Antenna的v1.0版本支持了前端源码单独部署，并增加了**docker-compose.yml** 文件方便用户docker部署
这是因为部分用户对于前端代码单独部署的声音越来越多。所以我们将前端代码放入了项目的**templates**目录中
这样做我们可以将后端源码作为server单独部署到远程服务器上，而前端只要在配置文件中填写后端的地址就
可以直接在本地进行部署控制远程server。前端也就可以看做client。
那接下来，我们看一下关于这种方式的部署教程

## 前端本地部署教程

### 源码部署

如果您选择了前端在本地进行源码部署，你必须拥有node环境以及安装yarn等依赖
您可以选择执行下面的命令保证后续本地部署的顺利

```shell
npm config set registry https://registry.npm.taobao.org \
    && npm install -g vue-cli \
    && PATH=$PATH:./node_modules/.bin \
    && npm install -g pm2  \
    && yarn config set registry https://registry.npm.taobao.org \
    && yarn config set ignore-engines true
   ```

安装好所需依赖后，您需进入到项目的**templates** 目录下

```shell
cd templates 
```

打开目录下的 **.env.example**文件，填写您部署在远程的server地址

填写示例

```dotenv
SERVER_URL="http://test.com"
```

然后将 **.env.example** 改成 **.env** 文件

接下来需要执行启动命令

```shell
yarn \
&& yarn prepare
&& yarn start
```
接下来访问本地的**8000**端口，就可以访问到sever端

### Docker 部署

打开 **templates**目录下的docker-compose.yml**文件
```dockerfile
version: '3'

services:
  antenna_client:
    build: ./
    image: antenna_client
    container_name: antenna_client
    volumes:
      - ./:/antenna
    ports:
      - "80:8080"   #如果前端想开启在本地的其他端口，请填写其余
    environment:
      SERVER_URL: "http://test.com"  # SERVER接口地址
    networks:
      - antenna_client

networks:
  antenna_client:
    driver: bridge

```

填写**SERVER_URL** 的环境变量地址后，运行命令
```shell
docker-compose up 
```
访问本地的80端口，便可以进行使用