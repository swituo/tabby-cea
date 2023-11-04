# tabby-cea

tabby terminal

`+` **C**ustom **E**laborate **A**dditional

* [原项目](https://tabby.sh)
* [原README](README.origin.md)

## 新增功能

### TOTP二次验证

登录脚本语法

```json
${{TOTP:"secret key"}}
```

TOTP算法配置

* Algorithm: SHA1
* Period: 30s
* Digits: 6
* SeedFormat: base32

## 变动文件

* [electron-builder.yml](electron-builder.yml)
* [package.json](package.json)
* script
  * [vars.mjs](scripts/vars.mjs)
* tabby-terminal
  * [package.json](tabby-terminal/package.json)
  * [src/middleware/loginScriptProcessing.ts](tabby-terminal/src/middleware/loginScriptProcessing.ts)
