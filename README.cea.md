# tabby-cea

tabby terminal

`+` **C**ustom **E**laborate **A**dditional

* [原项目](https://tabby.sh)
* [HACKING](./HACKING.md)

## 新增功能

### TOTP二次验证

登录脚本语法

```
${{TOTP::Secret_Key}}
```

TOTP算法配置

* Algorithm: SHA1
* Period: 30s
* Digits: 6
* SeedFormat: base32

## 变动文件

* [electron-builder.yml](electron-builder.yml)
* [package.json](package.json)
* [.env](.env)
* script
  * [vars.mjs](scripts/vars.mjs)
* tabby-terminal
  * [package.json](tabby-terminal/package.json)
  * [src/middleware/loginScriptProcessing.ts](tabby-terminal/src/middleware/loginScriptProcessing.ts)

## 问题的解决方案

### `electron install`提示`certificate has expired`

设置环境变量`NODE_TLS_REJECT_UNAUTHORIZED=0`

```powershell
# ps
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
```

```bash
# shell
export NODE_TLS_REJECT_UNAUTHORIZED="0"
```

```cmd
rem cmd
set NODE_TLS_REJECT_UNAUTHORIZED=0
```
