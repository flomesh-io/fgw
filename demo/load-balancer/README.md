# 负载均衡demo  
## 操作步骤：   
### 1. 将 config.json 拷贝到 fgw/pjs 目录下，覆盖原有 config.json 文件。  
### 2. 在 fgw 目录下，运行命令： pipy pjs/main.js --admin-port=6060  
### 3. 访问 8080 端口，多次访问并观察网页内容，验证负载均衡效果。   
### 4. 访问 curl -v localhost:6060/metrics ， 查看 metrics 信息。
