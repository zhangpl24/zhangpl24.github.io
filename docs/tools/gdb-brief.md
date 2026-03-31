---
date: 2026-03-31
icon: lucide/bug
description: GDB 常用指令与 print / x 查看内存速查。
---

# 常用指令

|指令|全称|描述|
|---|---|---|
|r|run|开始执行程序，直到下一个断点或程序结束|
|q|quit|退出 GDB 调试器|
|ni|nexti|执行下一条指令，但不进入函数内部|
|si|stepi|执行当前指令，如果是函数调用则进入函数|
|b|break|在指定位置设置断点|
|c|cont|从当前位置继续执行程序，直到下一个断点或程序结束|
|p|print|打印变量的值|
|x||打印内存中的值|
|j|jump|跳转到程序指定位置|
|disas||反汇编当前函数或指定的代码区域|
|layout asm||显示汇编代码视图|
|layout regs||显示当前的寄存器状态和它们的值|
关闭 `layout` 的方式为，按下 `Ctrl + x`，然后再按下 `a`。

关于 `p` 和 `x`，最重要的就是记得 `p` 命令用于打印表达式的值，而 `x` 命令则主要用于检查内存的内容。几个常用示例如下：

```bash
p $rax  # 打印寄存器 rax 的值
p $rsp  # 打印栈指针的值
p/x $rsp  # 打印栈指针的值，以十六进制显示
p/d $rsp  # 打印栈指针的值，以十进制显示

x/2x $rsp  # 以十六进制格式查看栈指针 %rsp 指向的内存位置 M[%rsp] 开始的两个单位。
x/2d $rsp # 以十进制格式查看栈指针 %rsp 指向的内存位置 M[%rsp] 开始的两个单位。
x/2c $rsp # 以字符格式查看栈指针 %rsp 指向的内存位置 M[%rsp] 开始的两个单位。
x/s $rsp # 把栈指针指向的内存位置 M[%rsp] 当作 C 风格字符串来查看。

x/b $rsp # 检查栈指针指向的内存位置 M[%rsp] 开始的 1 字节。
x/h $rsp # 检查栈指针指向的内存位置 M[%rsp] 开始的 2 字节（半字）。
x/w $rsp # 检查栈指针指向的内存位置 M[%rsp] 开始的 4 字节（字）。
x/g $rsp # 检查栈指针指向的内存位置 M[%rsp] 开始的 8 字节（双字）。

info registers  # 打印所有寄存器的值
info breakpoints  # 打印所有断点的信息

delete breakpoints 1  # 删除第一个断点，可以简写为 d 1
```
这些命令在 `/` 后面的后缀（如 `2x`、`2d`、`s`、`g`、`20c`）指定了查看内存的方式和数量。具体来说：

- 第一个数字（如 `2`、`20`）指定要查看的单位数量。
    
- 第二个字母（如 `x`、`d`、`s`、`g`、`c`）指定单位类型和显示格式，其中：
    
    - `c` / `d` / `x` 分别代表以字符 / 十进制 / 十六进制格式显示内存内容。
        
    - `s` 代表以字符串格式显示内存内容。
        
    - `b` / `h` / `w` / `g` 分别代表以 1 / 2 / 4 / 8 字节为单位（`unit`）显示内存内容。
        
        当使用 `x/b`、`x/h`、`x/w`、`x/g` 时，`unit` 会保留对应改变，直到你再次使用这些命令。
        

# .gdbinit

- `gdb` 有一个很实用的功能，就是我们可以使用 `.gdbinit` 文件来设置 `gdb` 进入时的一些默认配置，这样我们就不用每次都手动输入一大堆的指令。

- 为了实现此功能，我们首先进行如下配置：

```bash
# 创建当前目录下的 .gdbinit 文件 
touch .gdbinit 
# 创建 .config/gdb 文件夹 
mkdir -p ~/.config/gdb 
# 允许 gdb 预加载根目录下所有的文件 
echo "set auto-load safe-path /" > ~/.config/gdb/gdbinit
```

- 常用指令：基本上所有正常的指令都可以初始输入
	- set args xxx：设置默认的运行参数
	- b xxx：设置默认断点
	- r ：打开后直接运行
- 特殊的操作：断点编程
	- 在一个断点后输入command和end包括一个代码块
	- 代码块中的指令会在进入断点时执行
		- 比如可以在块中输入 jump xxx直接跳过这段
- **example：**

```
# ./gdbinit
# 设置默认文件输入，这样我们不必每次手动输入答案
set args psol.txt

# 可以为 explode_bomb 函数设置断点，这样我们就可以在爆炸之前打断程序的执行
# 但是由于其会打印输出信息，所以后面有更具有针对性的设置，跳过信息发送函数
# 所以这里就不再设置断点了
# b explode_bomb

# 为各个 phase 函数设置断点，用以观察其执行过程
# 如果你做完了某个 phase，可以将其注释掉，这样就不会再进入该 phase 了
b phase_1
b phase_2
b phase_3
b phase_4
b phase_5
b phase_6

# 为校验函数设置断点
b phase_defused
# 为此断点编程
command
# 直接跳到返回语句处，跳过校验流程
jump *(phase_defused + 0x2A)
end


# 以下代码务必保留!!!

# 为 explode_bomb 中触发 send_msg 函数的地方设置断点
b *(explode_bomb + 0x44)
# 为此断点编程
command
# 直接跳到 exit 退出函数处，跳过发送信息流程
j *(explode_bomb + 0x81)
end

# 炸弹已经安全化，可以放心地拆弹了，开始运行程序
r
```