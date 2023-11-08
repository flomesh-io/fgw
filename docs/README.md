---
title: "配置"
description: ""
weight: 1
---

## 1. 全局配置（Configs）

|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|EnableDebug|是否输出调试日志信息|true，false|否|
|2|StripAnyHostPort|是否忽略 HTTP 请求头中 Host 的端口号，<br>比如：将 Host: [www.aaa.com:8080](http://www.aaa.com:8080) <br>视为 Host: [www.aaa.com](http://www.aaa.com) |true，false|否|
|3|DefaultPassthroughUpstreamPort|TLS Passthrough 场景，<br>如果没有配置上游端口，则使用此端口号|1~65535，通常设置为 443|否|
|4|SocketTimeout|配置socket网络超时时间（单位：秒）|大于0，默认是60|否|
|5|PidFile|将pipy进程id写入到文件|例子：/var/log/pipy.pid|否|
|6|ResourceUsage|配置采集pipy cpu、mem使用率|参考 1.1|否|
|7|HealthCheckLog|配置健康检查日志用的存储服务器信息|参考 1.2|否|
|8|Gzip|配置静态文本文件压缩相关参数|参考 1.3|否|
|9|ProxyRedirect|对上游返回的HTTP应答中的Location、Refresh等URL进行重写|比如："ProxyRedirect": {"http://www.flomesh.com/aa": "http://$http_host/ab", "http://www.flomesh.com/a0": "/a1"}|否|
|10|ErrorPage|对HTTP错误码返回自定义网页或链接，类型为列表 []|参考 1.4|否|
|11|HTTP1PerRequestLoadBalancing|HTTP1.1请求时，是否启用基于请求的负载均衡策略，默认为false|true、false|否|
|12|HTTP2PerRequestLoadBalancing|HTTP2请求时，是否启用基于请求的负载均衡策略，默认为true|true、false|否|

### 1.1 ResourceUsage
|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|ScrapeInterval|采集cpu、mem使用率的时间间隔（单位：秒）|大于0，建议60|是|
|2|StorageAddress|存储cpu、mem使用率的REST url|如果没有配置就不存储|否|
|3|Authorization|访问REST url用的 Basic认证信息|如果没有启用认证就不需要配置|否|

### 1.2 HealthCheckLog
|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|StorageAddress|存储健康检查日志的REST url|如果没有配置就不存储健康检查日志|否|
|2|Authorization|访问REST url用的 Basic认证信息|如果没有启用认证就不需要配置|否|

### 1.3 Gzip
|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|DisableGzip|禁用静态文本文件压缩功能，默认为false|true、false|否|
|2|GzipMinLength|文本文件压缩的最小字节数，小于此值时不压缩，默认为1024|大于等于0|否|
|3|GzipHttpVersion|文本文件压缩最低HTTP版本|1.0，1.1 等|否|
|4|GzipTypes|只对这些content-type启用压缩|["text/css", "text/html"] 等|是|
|5|GzipDisable|针对user-agent来设置禁用压缩|比如："MSIE [1-6]\."|否|

### 1.4 ErrorPage
|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Error|错误码列表|比如：[404] |是|
|2|Page|自定义网页名称或者URL地址|比如：404.html 或 http://www.flomesh.cn/404.html |是|
|3|Directory|自定义网页所在目录，如果Page是URL则忽略此参数|比如：/var/www/html/error|是|

## 2. 监听端口配置（Listeners）

|编号|配置项名称|用途描述|可选值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Port|应用使用的端口号|1~65535|是|
|2|Listen|非必须配置，监听端口号，<br>如果未配置，使用 Port 为监听端口号|1~65535|否|
|3|Protocol|端口所使用的协议|HTTP、HTTPS、TLS、TCP|是|
|4|AccessControlLists|访问控制列表，设置访问者 IP 地址黑白名单。<br>如果设置了白名单，就以白名单为准；<br>如果未设置白名单，就以黑名单为准。|参考 2.1|否|
|5|BpsLimit|网络限速（单位：字节/秒）|"BpsLimit": 10000000|否|
|6|TLS|配置 TLS 相关的证书信息| 参考 2.2 |否|

### 2.1 AccessControlLists

| 编号 | 配置项名称 | 用途描述                                                | 参考值                    | 是否必须 |
|:----:|:---------- |:------------------------------------------------------- |:------------------------- |:--------:|
|  1   | Blacklist  | 黑名单列表                                              | ["1.1.1.1", "2.2.2.0/24"] |    否    |
|  2   | Whitelist  | 白名单列表                                              | ["1.1.1.1", "2.2.2.0/24"] |    否    |
|  3   | EnableXFF  | 是否检查请求头 x-forwarded-for 中的 IP 地址，默认不检查 | true                      |    否    |
|  4   | Status     | 拒绝访问后返回的响应状态码，不指定时默认为 403          | 403                       |    否    |
|  5   | Message    | 拒绝访问后返回的响应内容，不指定时默认为空字符          | Forbidden                 | 否         |

### 2.2 TLS

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|TLSModeType|TLS 工作模式|Terminate、Passthrough|是|
|2|mTLS|是否启用客户端证书认证|true、false|否|
|3| Certificates |证书、私钥、CA 证书|参考 2.2.1|否|

#### 2.2.1 Certificates

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|CertChain|证书|"-----BEGIN CERTIFICATE-----\n"|是|
|2|PrivateKey|私钥|"-----BEGIN RSA PRIVATE KEY-----\n"|是|
|3|IssuingCA|签名证书|"-----BEGIN CERTIFICATE-----\n"|是|

## 3. 路由规则（RouteRules）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|端口号|Listeners 中端口号所使用的路由规则|"80" 或 "80, 443"|是|

### 3.1 端口号配置（Protocol 为 HTTP、HTTPS 的配置格式）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|域名|HTTP 虚拟主机所使用的域名|"*" 或 "www.test.com, api.test.com"|是|

#### 3.1.1 域名

| 编号 | 配置项名称         | 用途描述                                                                                                       | 参考值       | 是否必须 |
|:----:|:------------------ |:-------------------------------------------------------------------------------------------------------------- |:------------ |:--------:|
|  1   | RouteType          | 路由类型                                                                                                       | HTTP、GRPC   |    是    |
|  2   | Matches            | 匹配规则                                                                                                       | 参考 3.1.1.1 |    是    |
|  3   | RateLimit          | 域名限流配置                                                                                                   | 参考 3.1.1.2 |    否    |
|  4   | AccessControlLists | 访问控制列表，设置访问者 IP 地址黑白名单。如果设置了白名单，就以白名单为准；如果未设置白名单，就以黑名单为准。 |     参考 2.1    | 否         |
|  5  |Gzip|配置静态文本文件压缩相关参数|参考 1.3|否|
|  6  |ProxyRedirect|参考 1. 全局配置（Configs）说明||否|
|  7  | ErrorPage |参考 1. 全局配置（Configs）说明||否|
|  8  | AccessLog |HTTP应用访问日志的文件路径|比如："AccessLog": "/var/log/fgw-access.log"|否|
|  9  | ProxyPreserveHost |是否保持HTTP请求中的Host不变，默认为 false|true、false|否|
|  10 | Fault |注入错误，用于测试场景| 参考 3.1.1.3|否|


##### 3.1.1.1 Matches

| 编号 | 配置项名称     | 用途描述                       | 参考值                           |                  是否必须                   |
|:----:|:-------------- |:------------------------------ |:-------------------------------- |:-------------------------------------------:|
|  1   | Path           | HTTP uri path 匹配             | 参考 3.1.1.1.1                   |                     否                      |
|  2   | Headers        | HTTP header 匹配               | 参考 3.1.1.1.2                   |                     否                      |
|  3   | Methods        | 允许的 HTTP Method             | ['GET', 'POST', 'DELETE', 'PUT'] |                     否                      |
|  4   | QueryParams    | HTTP 请求参数匹配              | 参考 3.1.1.1.3                   |                     否                      |
|  5   | BackendService | 动态代理用的后端服务                       | 参考 3.1.1.1.4                  | BackendService 或 ServerRoot 必须有一个存在 |
|  6   | ServerRoot     | 静态页面所对应的目录           | "/var/www/html"                  | BackendService 或 ServerRoot 必须有一个存在 |
|  7   | Method         | RouteType 为 GRPC 时，匹配服务 | 参考 3.1.1.1.5                   |                     否                      |
|  8   | RateLimit      | 路由限流配置                   | 参考 3.1.1.2                     |                     否                      |
|  9   | AccessControlLists | 访问控制列表，设置访问者 IP 地址黑白名单。如果设置了白名单，就以白名单为准；如果未设置白名单，就以黑名单为准。 |     参考 2.1     | 否         |
|  10  |	Filters       |	过滤器配置                     |	参考 3.1.1.1.6	                 | 否                                         |
|  11  |Gzip|配置静态文本文件压缩相关参数|参考 1.3|否|
|  12  |ProxyRedirect|参考 1. 全局配置（Configs）说明||否|
|  13  | ErrorPage |参考 1. 全局配置（Configs）说明||否|


###### 3.1.1.1.1 Path

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|Path 匹配类型|Prefix、Exact、Regex|是|
|2|Path|Path 值| "/", "/prefix" 等|是|

###### 3.1.1.1.2 Headers

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Exact|精确匹配 Header|"Headers": {<br>    "Exact": {<br>        "abc": "1"<br>        },<br>       "Regex": {<br>         "xxx": "^[0-9]+"<br>    }<br>    }|否|
|2|Regex|正则匹配 Header|同上|否|

###### 3.1.1.1.3 QueryParams

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Exact|精确匹配 Params|"QueryParams": {<br>    "Exact": {<br>        "abc": "1"<br>        },<br>       "Regex": {<br>         "xxx": "^[0-9]+"<br>    }<br>    }|否|
|2|Regex|正则匹配 Params|同上|否|

###### 3.1.1.1.4 BackendService
|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|后端服务名|后端服务的名称，比如："backendService1" |参考：3.1.1.1.4.1|是|

###### 3.1.1.1.4.1 BackendService后端服务名
|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Weight|权重|整数|是|
|2|	Filters  |	过滤器配置   |	参考 3.1.1.1.6	     | 否    |

###### 3.1.1.1.5 Method

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|匹配类型|Exact|是|
|2|Service|GRPC 服务名|"com.example.GreetingService" | 是|
|3|Method|GRPC 方法名|"Hello"|是|

##### 3.1.1.2 RateLimit

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Backlog|积压值：达到限流时，允许的排队数量||否|
|2|Requests|请求值，限流窗口内分配的访问次数||是|
|3|Burst|爆发值，限流窗口内最大允许访问次数||否|
|4|StatTimeWindow|限流时间窗口（单位：秒）||是|
|5|ResponseStatusCode|发生限流时，返回的 HTTP 状态码|100～599|是|
|6|ResponseHeadersToAdd|发生限流时，添加的 HTTP header 信息||否|

##### 3.1.1.3 Fault

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1| Delay | 注入响应延时 | 参考 3.1.1.3.1|否|
|2| Abort | 注入响应错误码 | 参考 3.1.1.3.2|否|

###### 3.1.1.3.1 Delay

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1| Percent | 对请求注入失败的百分比 | 0～100|是|
|2| Fixed | 延时时间 | 大于0|否|
|3| Range | 延时时间的随机范围 | 比如："0-100"|否|
|4| Unit | 延时的时间单位，默认为 "ms" | "ms"、"s"、"m"|否|

###### 3.1.1.3.1 Abort

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1| Percent | 对请求注入失败的百分比 | 0～100|是|
|2| Status | HTTP、GRPC 的应答状态码，比如：503 |数字|是|
|3| Message | 应答提示信息 | 字符串|否|

### 3.2 端口号配置（Protocol 为 TCP 的配置格式）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|服务名: 权重|对应上游服务的名称、权重|{<br>"service1": 50,<br>"service2": 50<br>}|是|

### 3.3 端口号配置（Protocol: "TLS", TLSModeType: "Passthrough 的配置格式）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|服务域名: 上游域名|对应上游服务域名|{<br>"www.test.com": "www.abc.com:443",<br>"www.xyz.com": "www.xyz.com:8443"<br>}|是|

### 3.4 端口号配置（Protocol: "TLS", TLSModeType: "Terminate 的配置格式）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|域名|服务域名和对应的上游服务列表|"abc.com": <br>{<br> "service1": 100<br>}|是|

##### 3.1.1.1.6 Filters

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|RequestHeaderModifier| 修改 HTTP 请求头 |参考 3.1.1.1.6.1|否|
|2|ResponseHeaderModifier|修改 HTTP 应答头|参考 3.1.1.1.6.2|否|
|3|RequestRedirect|请求重定向|参考 3.1.1.1.6.3|否|
|4|URLRewrite|请求的 URL 重写|参考 3.1.1.1.6.4|否|
|5|RequestMirror|将请求镜像到其他服务|参考 3.1.1.1.6.5|否|

###### 3.1.1.1.6.1 RequestHeaderModifier

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Set|设置 HTTP header|[<br>{<br>"name": "my-header1",<br>"value": "foo"<br>}<br>]|否|
|2|Add|增加 HTTP header|[<br>{<br>"name": "my-header2",<br>"value": "bar"<br>}<br>]|否|
|3|Remove|删除 HTTP header|[<br>"my-header3",<br>"my-header4"<br>]|否|

###### 3.1.1.1.6.2 ResponseHeaderModifier

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Set|设置 HTTP header|[<br>{<br>"name": "my-header1",<br>"value": "foo"<br>}<br>]|否|
|2|Add|增加 HTTP header|[<br>{<br>"name": "my-header2",<br>"value": "bar"<br>}<br>]|否|
|3|Remove|删除 HTTP header|[<br>"my-header3",<br>"my-header4"<br>]|否|

###### 3.1.1.1.6.3 RequestRedirect

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Scheme|协议描述|http、https|否|
|2|Hostname|重定向到的域名||否|
|3|Path|重定向到的路径||是|
|4|Port|重定向到的端口||否|
|5|StatusCode|重定向返回的状态码|301、302|是|

###### 3.1.1.1.6.4 URLRewrite

| 编号 | 配置项名称 | 用途描述        | 参考值          | 是否必须 |
|:----:|:---------- |:--------------- |:--------------- |:--------:|
|  1   | Hostname   | 主机名/域名重写 | sub.example.com |    否    |
|  2   | Path           |  路径重写规则               |       参考 3.1.1.1.6.4.1          |      是     |

###### 3.1.1.1.6.4.1 URLRewrite Path 规则

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|Url 重写匹配规则|ReplacePrefixMatch：前缀匹配<br>ReplaceFullPath：全路径匹配|是|
|2|ReplacePrefixMatch|前缀匹配时替换 path||type 为 ReplacePrefixMatch 时，必须配置|
|3|ReplaceFullPath|全路径匹配时替换 path||type 位 ReplaceFullPath 时，必须配置|

###### 3.1.1.1.6.5 RequestMirror

| 编号 | 配置项名称 | 用途描述        | 参考值          | 是否必须 |
|:----:|:---------- |:--------------- |:--------------- |:--------:|
|  1   | BackendService | 接收请求的服务名 | 比如："backendService2" |    是    |

## 4. 服务配置（Services）

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|服务|对应 RouteRules 中，BackendService 配置使用的服务名|参考 4.1 |是|

### 4.1 服务 配置格式

| 编号 | 配置项名称          | 用途描述                                                                                                  | 参考值      | 是否必须 |
|:----:|:------------------- |:--------------------------------------------------------------------------------------------------------- |:----------- |:--------:|
|  1   | StickyCookieName    | 使用 cookie sticky 负载均衡时，cookie 的名称                                                              | "\_srv\_id" |    否    |
|  2   | StickyCookieExpires | 使用 cookie sticky 时，cookie 的有效期                                                                    | 3600        |    否    |
|  3   | HealthCheck         | 对上游服务的健康检查配置                                                                                  | 参考 4.1.1  |    否    |
|  4   | Endpoints           | 上游服务信息                                                                                           | 参考 4.1.2  |    是  |
|  5   | CircuitBreaking     | 熔断配置，用于 Protocol 为 HTTP、HTTPS 的场景                                                             | 参考 4.1.4  |    否    |
|  6   | RetryPolicy         | 重试配置，用于 Protocol 为 HTTP、HTTPS 的场景                                                             | 参考 4.1.5  |    否    |
|  7   | UpstreamCert        | 访问上游使用 默认使用的 TLS 证书                                                                          | 参考 4.1.6  |    否    |
|  8   | Algorithm           | 负载均衡算法，支持 RoundRobinLoadBalancer（未指定时默认使用）、HashingLoadBalancer、LeastConnectionLoadBalancer | "RoundRobinLoadBalancer"            |    否    |
|  9   | MTLS                |是否使用mTLS方式访问上游服务，不设置时默认为 false |true，false| 否 |

#### 4.1.1 HealthCheck

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Interval|主动检测的时间间隔，<br>如果不设置，不会进行主动健康检测<br>单位：秒|10|否|
|2|MaxFails|连续失败次数后，将上游设置为不可用|3|是|
|3|FailTimeout|	被动检测时，服务不可用时间间隔。<br>当连续失败次数达到 MaxFails 后，该上游将暂时禁用。<br>如果设置了主动检查，该参数被忽略。单位：秒|30|否|
|4|Path|使用 HTTP 方式进行健康检查，为 HTTP path<br>如果未设置 Path，表示用 TCP 方式进行端口健康检查||否|
|5|Matches|HTTP 健康检查时的判定条件| 参考 4.1.1.1 |否|

##### 4.1.1.1 Matches

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|StatusCodes|期望的HTTP状态码数组|比如： [ 200 ] |否|
|2|Body|期望返回Body中包含的内容|比如：OK|否|
|3|Headers|期望包含的HTTP头|比如：{"content-type": "text/html"}|否|

#### 4.1.2 Endpoints

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|上游目标地址| 参考 4.1.2.1 |是|

##### 4.1.2.1 上游目标地址

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|Weight|权重|整数|是|
|2|Tags|标记||否|
|3|UpstreamCert|访问上游用的 TLS 证书||否|
|4|UseSSL|不需要客户端SSL证书的场景，是否使用SSL连接访问上游服务|true、false|否|
|5|Host|重写HTTP请求头中的Host，默认使用上游target（ip:端口）||否|

#### 4.1.4 CircuitBreaking

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|MinRequestAmount|触发熔断必须达到的访问次数 ||是|
|2|StatTimeWindow|熔断判定统计窗口（单位：秒）||是|
|3|SlowTimeThreshold|慢访问时间阈值（单位：秒）||否|
|4|SlowAmountThreshold|触发熔断的慢访问次数||否|
|5|SlowRatioThreshold|触发熔断的慢访问占比|0.00~1.00|否|
|6|ErrorAmountThreshold|触发熔断的失败访问次数||否|
|7|ErrorRatioThreshold|触发熔断的失败访问占比|0.00~1.00|否|
|8|DegradedTimeWindow|熔断时间窗口（单位：秒）||是|
|9|DegradedStatusCode|熔断时返回的 HTTP 状态码|100~599|是|
|10|DegradedResponseContent|熔断时返回的提示信息||否|

#### 4.1.5 RetryPolicy

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|RetryOn|重试条件: 设置为 HTTP 状态码|"5xx" 等|是|
|2|NumRetries|重试次数||否|
|3|RetryBackoffBaseInterval|重试间隔（单位：秒）||否|

#### 4.1.6 UpstreamCert

|编号|配置项名称|用途描述|参考值|是否必须|
|:----:|:---------|:-----|:------|:-------:|
|1|CertChain|证书|"-----BEGIN CERTIFICATE-----......"|是|
|2|PrivateKey|私钥|"-----BEGIN RSA PRIVATE KEY-----......"|是|
|3|IssuingCA|CA 证书|"-----BEGIN CERTIFICATE-----......"|否|

## 5. 流程链（Chains）配置

可以动态增减功能模块（插件）

|编号|流程名称|模块列表|
|:----:|:----:|:----|
|1|HTTPRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/consumer.js",<br>"http/codec.js",<br>"http/auth.js",<br>"http/route.js",<br>"http/service.js",<br>"http/metrics.js",<br>"http/tracing.js",<br>"http/logging.js",<br>"http/circuit-breaker.js",<br>"http/throttle-domain.js",<br>"http/throttle-route.js",<br>"filter/request-redirect.js",<br>"filter/header-modifier.js",<br>"filter/url-rewrite.js",<br>"http/forward.js",<br>"http/default.js"|
|2|HTTPSRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/tls-termination.js",<br>"common/consumer.js",<br>"http/codec.js",<br>"http/auth.js",<br>"http/route.js",<br>"http/service.js",<br>"http/metrics.js",<br>"http/tracing.js",<br>"http/logging.js",<br>"http/circuit-breaker.js",<br>"http/throttle-domain.js",<br>"http/throttle-route.js",<br>"filter/request-redirect.js",<br>"filter/header-modifier.js",<br>"filter/url-rewrite.js",<br>"http/forward.js",<br>"http/default.js"|
|3|TLSPassthrough|"common/access-control.js",<br>"common/ratelimit.js",<br>"tls/passthrough.js",<br>"common/consumer.js"|
|4|TLSTerminate|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/tls-termination.js",<br>"common/consumer.js",<br>"tls/forward.js"|
|5|TCPRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"tcp/forward.js",<br>"server/web-server.js"|
