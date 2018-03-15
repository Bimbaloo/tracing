# 注意事项

npm i 后将文件替换和增加


将go.js替换 project\node_modules\gojs\release
![添加图例](https://ooo.0o0.ooo/2017/06/14/5940e8f302bb3.png)


## 该项目使用 standard 标准 --https://github.com/standard/standard/blob/master/docs/README-zhcn.md

vscode插件：vscode-standardjs、ESlint--(其他主流开发工具插件也可以在以上网站上找到)
配置项修改(文件--首选项--设置)：
```json
{
  "workbench.startupEditor": "welcomePage",
  "editor.tabSize": 2,
  "eslint.autoFixOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "html",
      "autoFix": true
    },
    {
      "language": "vue",
      "autoFix": true
    }
  ],
  "files.autoSave": "off"
}```