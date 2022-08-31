---
sidebar_position: 1
---

# 安装部署

让我们来尝试安装一下Antenna **本文阅读大概需要 5 minutes左右**.

## 前提准备

你需要有

1、一台**公网**服务器

2、一个**域名**,最好已解析绑定上述服务器

关于文章中需要的域名解析及DNS配置 ,可参考博客域名配置教程 [域名配置及阿里云dns服务修改教程](#)

3、你需要访问Antenna的**github地址** 来自 **[https://github.com/wuba/Antenna](https://github.com/wuba/Antenna)**.
并将项目下载到服务器上

```shell
git clone https://github.com/wuba/Antenna
```

## 源码部署
进入项目目录，首先你需要修改 **.env.example**文件，按照你的实际情况进行配置

```angular2html
MYSQL_HOST=127.0.0.1   #数据库地址
MYSQL_PORT=3306        #数据库端口
MYSQL_USERNAME=root    #数据库账户
MYSQL_PASSWORD=123456  #数据库密码
PLATFORM_DOMAIN=127.0.0.1    #系统平台域名
PLATFORM_IP=127.0.0.1        #系统平台公网IP地址
LOGIN_PATH=''    #系统登录系统路径，此配置帮助隐藏登录后台，默认为空，如需设置，填写示例如'/login'
```

将文件配置好后改名为 **.env**

tips:运行命令同步初始数据，注意连接的数据库需提前创建好空数据库antenna,编码需设置为utf-8

```shell
python3 manage.py makemigrations
python3 manage.py migrate       
python3 manage.py runserver 0.0.0.0:80 --noreload
```

系统会自动创建初始管理员账户**antenna@58.com** 密码：**antenna@58.com** `http://test.com/{LOGIN_PATH}`，
可访问系统后台

## Docker 部署

修改 **docker-compose.yml**文件中配置

```yaml
version: '3'

services:

  db:
    image: mysql:8.0.30
    container_name: antenna-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: Antenna@58.com   #建议更换初始数据库密码
      MYSQL_DATABASE: antenna
    networks:
      - antenna
    restart: always

  antenna:
    build: ./
    image: antenna:latest
    depends_on:
      - db
    container_name: antenna
    volumes:
      - ./:/antenna
    ports:
      - "80:80"
      - "2345:2345"
      - "53:53/udp"
    environment:
      MYSQL_HOST: db
      MYSQL_PORT: 3306
      MYSQL_USERNAME: root
      MYSQL_PASSWORD: Antenna@58.com    #保证与上面mysql镜像设置密码一致
      PLATFORM_DOMAIN: 127.0.0.1  #需配置提前准备的域名
      PLATFORM_IP: 127.0.0.1      #需配置提前准备的公网IP
      LOGIN_PATH: ''   #系统登录系统路径，此配置帮助隐藏登录后台，默认为空，如需设置，填写示例如'/login'

    networks:
      - antenna
    restart: always

networks:
  antenna:
    driver: bridge
```

配置好后运行命令

```shell
docker-compose up -d 
```

系统会自动创建初始管理员账户**antenna@58.com** 密码：**antenna@58.com**访问`http://test.com/{LOGIN_PATH}`即可使用，

tips:部署前保证映射端口都未被占用，关于53端口关闭可运行命令

```shell
systemctl stop systemd-resolved
```

如果镜像部署中提示端口开启没有权限，请删除Docker