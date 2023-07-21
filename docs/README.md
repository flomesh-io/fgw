**config.json配置字典**
===================

# 1. **全局配置（Configs）**
|**编号**|**配置项名称**|**用途描述**|**可选值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|EnableDebug|是否输出调试日志信息|true，false|否|
|2|StripAnyHostPort|是否忽略HTTP请求头中Host的端口号，<br>比如：将 Host: [www.aaa.com:8080](http://www.aaa.com:8080) <br>视为 Host: [www.aaa.com](http://www.aaa.com) |true，false|否|
|3|DefaultPassthroughUpstreamPort|TLS Passthrough 场景，<br>如果没有配置上游端口，则使用此端口号|1~65535，通常设置为443|否|

# 2. **监听端口配置（Listeners）**
|**编号**|**配置项名称**|**用途描述**|**可选值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Port|应用使用的端口号|1~65535|是|
|2|Listen|非必须配置，监听端口号，<br>如果未配置，使用 Port 为监听端口号|1~65535|否|
|3|Protocol|端口所使用的协议|HTTP、HTTPS、TLS、TCP|是|
|4|AccessControlLists|访问控制列表，设置访问者IP地址黑白名单。<br>如果设置了白名单，就以白名单为准；<br>如果未设置白名单，就以黑名单为准。|参考 2.1|否|
|5|bpsLimit|网络限速（单位：字节/秒）|"bpsLimit": 10000000|否|
|6|TLS|配置 TLS相关的证书信息| 参考 2.2 |否|

## 2.1 **AccessControlLists**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|blacklist|黑名单列表| ['1.1.1.1', '2.2.2.0/24']|否|
|2|whitelist|白名单列表| ['1.1.1.1', '2.2.2.0/24']|否|

## 2.2 **TLS**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|TLSModeType|TLS工作模式|Terminate、Passthrough|是|
|2|mTLS|是否启用客户端证书认证|true、false|是|
|3| Certificates |证书、私钥、CA证书|参考 2.2.1|是|

### 2.2.1 **Certificates**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|CertChain|证书|"-----BEGIN CERTIFICATE-----\n"|是|
|2|PrivateKey|私钥|"-----BEGIN RSA PRIVATE KEY-----\n"|是|
|3|IssuingCA|签名证书|"-----BEGIN RSA PRIVATE KEY-----\n"|是|
 
# 3. **路由规则（RouteRules）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|端口号|Listeners中端口号所使用的路由规则|"80" 或 "80, 443"|是|

## 3.1 **端口号配置（Protocol 为 HTTP、HTTPS 的配置格式）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|域名|HTTP虚拟主机所使用的域名|"*" 或 "www.test.com, api.test.com"|是|

### 3.1.1 **域名**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|RouteType|路由类型|HTTP、GRPC|是|
|2|Matches|匹配规则| 参考 3.1.1.1 |是|
|3|RateLimit|域名限流配置|参考 3.1.1.2|否|

#### 3.1.1.1 **Matches**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Path|HTTP uri path匹配|参考 3.1.1.1.1 |否|
|2|Headers|HTTP header匹配|参考 3.1.1.1.2|否|
|3|Methods|允许的HTTP Method| ['GET', 'POST', 'DELETE', 'PUT']|否|
|4|QueryParams|HTTP 请求参数匹配|参考 3.1.1.1.3|否|
|5|BackendService|后端服务|{<br> "服务名": 100<br>}|BackendService或ServerRoot必须有一个存在|
|6|ServerRoot|静态页面所对应的目录| "/var/www/html" |BackendService或ServerRoot必须有一个存在|
|7|Method|RouteType为 GRPC时，匹配服务| 参考 3.1.1.1.4|否|
|8|RateLimit|域名限流配置|参考 3.1.1.2|否|

##### 3.1.1.1.1 **Path**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|Path 匹配类型|Prefix、Exact、Regex|是|
|2|Path|Path 值| "/", "/prefix" 等|是|

##### 3.1.1.1.2 **Headers**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|Header 匹配类型|Exact、Regex|是|
|2|Headers|匹配的内容|{          <br> "abc": "1",<br> "xyz": "2"<br>} | 是|

##### 3.1.1.1.3 **QueryParams**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|Param 匹配类型|Exact、Regex|是|
|2|Params|匹配的内容|{          <br> "abc": "1",<br> "xyz": "2"<br>} | 是|

##### 3.1.1.1.4 **Method**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|匹配类型|Exact|是|
|2|Service|GRPC服务名|"com.example.GreetingService" | 是|
|3|Method|GRPC方法名|"Hello"|是|

#### 3.1.1.2 **RateLimit**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Backlog|积压值：达到限流时，允许的排队数量||否|
|2|Requests|请求值，限流窗口内分配的访问次数||是|
|3|Burst|爆发值，限流窗口内最大允许访问次数||否|
|4|StatTimeWindow|限流时间窗口（单位：秒）||是|
|5|ResponseStatusCode|发生限流时，返回的 HTTP状态码|100～599|是|
|6|ResponseHeadersToAdd|发生限流时，添加的HTTP header信息||否|

## 3.2 **端口号配置（Protocol 为 TCP 的配置格式）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|服务名:权重|对应上游服务的名称、权重|{<br>"service1": 50,<br>"service2": 50<br>}|是|

## 3.3 **端口号配置（Protocol: "TLS", TLSModeType: "Passthrough 的配置格式）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|服务域名:上游域名|对应上游服务域名|{<br>"www.test.com": "www.abc.com:443",<br>"www.xyz.com": "www.xyz.com:8443"<br>}|是|

## 3.4 **端口号配置（Protocol: "TLS", TLSModeType: "Terminate 的配置格式）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|域名|服务域名和对应的上游服务列表|"abc.com": <br>{<br> "service1": 100<br>}|是|

# 4. **服务配置（Services）**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|服务|对应RouteRules中，BackendService配置使用的服务名|参考 4.1 |是|

## 4.1 **服务 配置格式**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|StickyCookieName|使用 cookie sticky负载均衡时，cookie的名称|"_srv_id"|否|
|2|StickyCookieExpires|使用 cookie sticky时，cookie的有效期|3600|否|
|3|HealthCheck|对上游服务的健康检查配置| 参考 4.1.1 |否|
|4|Endpoints|上游服务信息| 参考 4.1.2 |是|
|5|Filters|过滤器配置 | 参考 4.1.3 | 否|
|6|CircuitBreaking|熔断配置，用于 Protocol 为 HTTP、HTTPS 的场景| 参考 4.1.4 | 否|
|7|RetryPolicy| 重试配置，用于 Protocol 为 HTTP、HTTPS 的场景| 参考 4.1.5 | 否 |
|8|UpstreamCert| 访问上游使用 默认使用的 TLS证书| 参考 4.1.6 | 否|

### 4.1.1 **HealthCheck**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Interval|主动检测的时间间隔，<br>如果不设置，不会进行主动健康检测<br>单位：秒|10|否|
|2|MaxFails|连续失败次数后，将上游设置为不可用|3|是|
|3|FailTimeout|	被动检测时，服务不可用时间间隔。<br>当连续失败次数达到 MaxFails 后，该上游将暂时禁用。<br>如果设置了主动检查，该参数被忽略。单位：秒|30|否|
|4|Uri|使用HTTP方式进行健康检查，为 HTTP path<br>如果未设置 Uri，表示用 TCP 方式进行端口健康检查||否|
|5|Matches|HTTP 健康检查时的判定条件| 参考 4.1.1.1 |否|

#### 4.1.1.1 **Matches**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Type|匹配类型|status、body、headers|是|
|2|Value|期望的数据||是|
|3|Name|type为headers时，http 头字段名||否|
  
### 4.1.2 **Endpoints**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|  
|1|上游目标地址| 参考 4.1.2.1 |是|

#### 4.1.2.1 **上游目标地址**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|Weight|权重|整数|是|
|2|Tags|标记||是|
|3|UpstreamCert|访问上游用的TLS证书||否|

### 4.1.3 **Filters**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|  
|1|RequestHeaderModifier| 修改HTTP请求头 |参考 4.1.3.1|否|
|2|ResponseHeaderModifier|修改HTTP应答头|参考 4.1.3.2|否|
|3|RequestRedirect|请求重定向|参考 4.1.3.3|否|
|4|HTTPURLRewriteFilter|请求的URL重写|参考 4.3.1.4|否|

#### 4.1.3.1 **RequestHeaderModifier**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|set|设置 HTTP header|[<br>{<br>"name": "my-header1",<br>"value": "foo"<br>}<br>]|否|
|2|add|增加 HTTP header|[<br>{<br>"name": "my-header2",<br>"value": "bar"<br>}<br>]|否|
|3|remove|删除 HTTP header|[<br>"my-header3",<br>"my-header4"<br>]|否|

#### 4.1.3.2 **ResponseHeaderModifier**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|set|设置 HTTP header|[<br>{<br>"name": "my-header1",<br>"value": "foo"<br>}<br>]|否|
|2|add|增加 HTTP header|[<br>{<br>"name": "my-header2",<br>"value": "bar"<br>}<br>]|否|
|3|remove|删除 HTTP header|[<br>"my-header3",<br>"my-header4"<br>]|否|

#### 4.1.3.3 **RequestRedirect**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|scheme|协议描述|http、https|否|
|2|hostname|重定向到的域名||否|
|3|path|重定向到的路径||是|
|4|port|重定向到的端口||否|
|5|statusCode|重定向返回的状态码|301、302|是|

#### 4.1.3.4 **HTTPURLRewriteFilter**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|
|1|type|Url 重写匹配规则|ReplacePrefixMatch：前缀匹配<br>ReplaceFullPath：全路径匹配|是|
|2|replacePrefixMatch|前缀匹配时的path||type为ReplacePrefixMatch时，必须配置|
|3|replacePrefix|前缀匹配时替换成这个path|默认为："/"|type为ReplacePrefixMatch时，可配置|
|4|replaceFullPath|全路径匹配时的path||type位ReplaceFullPath时，必须配置|

### 4.1.3 **CircuitBreaking**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|  
|1|MinRequestAmount|触发熔断必须达到的访问次数 ||是|
|2|StatTimeWindow|熔断判定统计窗口（单位：秒）||是|
|3|SlowTimeThreshold|慢访问时间阈值（单位：秒）||否|
|4|SlowAmountThreshold|触发熔断的慢访问次数||否|
|5|SlowRatioThreshold|触发熔断的慢访问占比|0.00~1.00|否|
|6|ErrorAmountThreshold|触发熔断的失败访问次数||否|
|7|ErrorRatioThreshold|触发熔断的失败访问占比|0.00~1.00|否|
|8|DegradedTimeWindow|熔断时间窗口（单位：秒）||是|
|9|DegradedStatusCode|熔断时返回的HTTP状态码|100~599|是|
|10|DegradedResponseContent|熔断时返回的提示信息||否|

### 4.1.4 **RetryPolicy**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|  
|1|RetryOn|重试条件:设置为HTTP状态码|"5xx"等|是|
|2|NumRetries|重试次数||否|
|3|RetryBackoffBaseInterval|重试间隔（单位：秒）||否|

### 4.1.5 **UpstreamCert**
|**编号**|**配置项名称**|**用途描述**|**参考值**|**是否必须**|
|:----:|:---------|:-----|:------|:-------:|  
|1|CertChain|证书|"-----BEGIN CERTIFICATE-----......"|是|
|2|PrivateKey|私钥|"-----BEGIN RSA PRIVATE KEY-----......"|是|
|3|IssuingCA|CA证书|"-----BEGIN CERTIFICATE-----......"|否|

# 5. **流程链（Chains）配置**
可以动态增减功能模块（插件）  
|**编号**|**流程名称**|**模块列表**|
|:----:|:----:|:----|
|1|HTTPRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/consumer.js",<br>"http/codec.js",<br>"http/auth.js",<br>"http/route.js",<br>"http/service.js",<br>"http/metrics.js",<br>"http/tracing.js",<br>"http/logging.js",<br>"http/circuit-breaker.js",<br>"http/throttle-domain.js",<br>"http/throttle-route.js",<br>"filter/request-redirect.js",<br>"filter/header-modifier.js",<br>"filter/url-rewrite.js",<br>"http/forward.js",<br>"http/default.js"|
|2|HTTPSRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/tls-termination.js",<br>"common/consumer.js",<br>"http/codec.js",<br>"http/auth.js",<br>"http/route.js",<br>"http/service.js",<br>"http/metrics.js",<br>"http/tracing.js",<br>"http/logging.js",<br>"http/circuit-breaker.js",<br>"http/throttle-domain.js",<br>"http/throttle-route.js",<br>"filter/request-redirect.js",<br>"filter/header-modifier.js",<br>"filter/url-rewrite.js",<br>"http/forward.js",<br>"http/default.js"|
|3|TLSPassthrough|"common/access-control.js",<br>"common/ratelimit.js",<br>"tls/passthrough.js",<br>"common/consumer.js"|
|4|TLSTerminate|"common/access-control.js",<br>"common/ratelimit.js",<br>"common/tls-termination.js",<br>"common/consumer.js",<br>"tls/forward.js"|
|5|TCPRoute|"common/access-control.js",<br>"common/ratelimit.js",<br>"tcp/forward.js",<br>"server/web-server.js"|

