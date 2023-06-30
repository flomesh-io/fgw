# fgw (flomesh-gateway)
## 1. 工程代码  
在 pjs 目录下
## 2. 测试  
在 tests/shpec 目录下  
### 2.1 测试用到的 TCP 端口  
80、443、2000、3000、4000、8443、8844、8845、8846、8847、8848、8849、8850、9443  
### 2.2 测试用到的工具   
pipy、netstat、cat、grep、openssl、curl、shpec  
### 2.3 测试方法
在 tests/shpec 目录下，先运行 pre_test.sh 检查测试环境，再运行 shpec 测试所有用例。   
