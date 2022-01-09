# editor

## Description
一个编辑器，利用光标API去抓取元素进行操作，支持黏贴任何内容（浏览器支持的也会支持）。

### 文件上传过程 
* 读取文件，中间通过requestIdleCallback进行分块hash。

### 光标相关 
* 利用光标起始位置，获取光标的选区中的节点Text。
* 若光标在节点Text之间，则对Text进行分割。
* 格式化是提取光标选取的节点Text，该节点Text的左树与右树将会分开，节点Text将在中间插入。

### todo
1. 遍历Node树转换为wasm实现，浏览器不支持则降级为原本js []
2. e2e [-]
3. 规范git commit messgae [-]

## Product demand
### feature：
1. 支持插入表格、超链接、用户选择多图同时上传(后台node) [y]
2. 支持针对选中的文字进行格式清空 [y]
3. 支持选中文字，把选中内容全部变成大小写 [y]
4. 支持把 word 里的内容粘贴到编辑器中，保持原有格式[y]
5. 支持 pc 与移动端 [y]