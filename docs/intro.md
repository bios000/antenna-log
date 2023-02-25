---
sidebar_position: 1
---

# 安装部署

让我们来尝试安装一下Antenna **本文阅读大概需要 5 minutes左右**.

## 前提准备

你需要有

1、一台**公网**服务器

2、最少一个**域名**,最好已做好NS记录配置

关于文章中需要的域名解析及DNS配置 ,可参考博客域名配置教程 [域名配置及阿里云dns服务修改教程](#)

3、你需要访问Antenna的**github地址** 来自 **[https://github.com/wuba/Antenna](https://github.com/wuba/Antenna)**.
并将项目下载到服务器上

```shell
注意:如后续部署方法选择源码部署,由于项目用到supervisor,相关初始配置默认项目安装路径为系统根目录 **/**
如果想自定义下载路径后续需修改配置文件antenna.ini,docker部署可忽略本注意

git clone https://github.com/wuba/Antenna /
```

4、填写配置

进入项目目录，首先你需要修改 **.env.example**文件，按照你的实际情况进行配置

```angular2html
#MYSQL配置
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=Antenna@58.com

#平台配置
PLATFORM_DOMAIN=test.com # 平台域名
SERVER_IP=1.1.1.1  # 平台公网IP
LOGIN_PATH='aaa'   # 隐藏后台uri,如果设置成aaa,则后台地址为http://test.com/aaa
PLATFORM_ROOT_USER=antenna@58.com  # 初始登录用户
PLATFORM_ROOT_PASSWORD=antenna@58.com  # 初始账户密码
REGISTER_TYPE=0  #平台注册配置 0代表不开放注册，1代表邀请码注册，2代表开放注册，但需要正确填写邮箱配置信息，不然用户无法收到消息

#邮件配置
EMAIL_HOST=1.1.1.1 # SMTP服务器地址
EMAIL_PORT=465 # SMTP服务器端口
EMAIL_HOST_USER=58@qq.com # SMTP账户
EMAIL_HOST_PASSWORD=123456 # SMTP密码/授权码

#消息配置
SAVE_MESSAGE_SEVEN_DAYS = 1 #保存近七天的消息记录，0代表关闭配置，1代表开启配置
OPEN_EMAIL=0 #代表平台接收到消息开启邮件通知 1开启邮箱通知 0代表关闭邮箱消息通知，注意如若开启邮箱通知，需正确填写邮箱配置信息，不然用户无法收到消息

#DNS解析记录
DNS_DOMAIN=test.cn   #DNSLOG解析的域名，可与平台域名共用
# 初始解析记录
DNS_DOMAIN_IP=127.0.0.1

# 前后端分离部署
SERVER_URL=http://test.cn

```

将文件配置好后改名为 **.env**

```shell
cp .env.example .env
```

## 源码部署(Centos 7 系统)

安装supervisor 所需相关依赖

```shell
chmod +x ./bin/install.sh
./bin/install.sh
```
检查supervisor配置文件

conf/antenna.ini文件内容
注意，如果你下载项目的地址不是根目录 需要将ini文件 **directory**的值修改
为自己项目的绝对路径
```ini
[program:antenna-server]
directory = /Antenna
command = python3 manage.py runserver 0.0.0.0:80
autostart = true
autorestart = true
redirect_stderr = true
stderr_logfile = /tmp/antenna_server_stderr.log
stdout_logfile = /tmp/antenna_server_stdout.log
stopsignal = KILL
stopasgroup = true

[program:antenna-dns]
directory = /Antenna
command = python3 modules/template/depend/listen/dnslog.py
autostart = true
autorestart = true
redirect_stderr = true
stderr_logfile = /tmp/antenna_dns_stderr.log
stdout_logfile = /tmp/antenna_dns_stdout.log
stopsignal = KILL
stopasgroup = true

[program:antenna-jndi]
directory = /Antenna
command = python3 modules/template/depend/listen/jndi.py
autostart = true
autorestart = true
redirect_stderr = true
stderr_logfile = /tmp/antenna_jndi_stderr.log
stdout_logfile = /tmp/antenna_jndi_stdout.log
stopsignal = KILL
stopasgroup = true

[program:antenna-ftp]
directory = /Antenna
command = python3 modules/template/depend/listen/ftplog.py
autostart = true
autorestart = true
redirect_stderr = true
stderr_logfile = /tmp/antenna_ftp_stderr.log
stdout_logfile = /tmp/antenna_ftp_stdout.log
stopsignal = KILL
stopasgroup = true

[program:antenna-https]
directory = /Antenna
command = python3 modules/template/depend/listen/httpslog.py
autostart = true
autorestart = true
redirect_stderr = true
stderr_logfile = /tmp/antenna_https_stderr.log
stdout_logfile = /tmp/antenna_https_stdout.log
stopsignal = KILL
stopasgroup = true


```

启动服务

```shell
chmod +x ./bin/run.sh
./bin/run.sh
```

tips:运行命令同步初始数据，注意连接的数据库需提前创建好空数据库antenna,编码需设置为utf-8

启动后可用个人设置的初始登录用户名以及密码(默认为**antenna@58.com**) `http://test.com/{LOGIN_PATH}`，
可访问系统后台

## Docker 部署

注意：Docker部署也提前配置.env文件

修改 **docker-compose.yml**文件中配置

```yaml
version: '3'

services:
  db:
    privileged: true
    image: mysql:8.0.30
    container_name: antenna-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: Antenna@58.com
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
      - ./:/Antenna
      - type: bind
        source: ./conf/antenna.ini
        target: /etc/supervisor.d/antenna.ini
    ports:
      - "21:21"
      - "80:80"
      - "2345:2345"
      - "53:53/udp"
      - "443:443"
    env_file:
      - .env
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

启动后可用个人设置的初始登录用户名以及密码(默认为**antenna@58.com**) `http://test.com/{LOGIN_PATH}`，
可访问系统后台

tips:部署前保证映射端口都未被占用，关于53端口关闭可运行命令

```shell
systemctl stop systemd-resolved
```

如果镜像部署中提示端口开启没有权限，请将docker中关于antenna的镜像增加配置**privileged: true**