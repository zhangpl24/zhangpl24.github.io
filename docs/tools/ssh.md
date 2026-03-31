---
date: 2026-03-31
icon: lucide/key-round
description: SSH 基本用法、密钥原理、ssh/config 与远程开发配置。
---

# 基本用法
```bash
ssh username@ip 
```
- 这会尝试连接到一个远程ip中的一个用户，并且将远程shell中的信息转发到本地界面
	- 其中ip可以是url，也可以是数字加.组成的普通ip
- 这可以执行shell命令并查看远程文件
- 输入logout可以退出连接
- 复制：scp
	- scp local.txt username@ip:remote.txt（代表将本地文件copy至远程服务器）
- ssh可以直接执行远程命令：
	- ssh foobar@server ls -al | grep PATTERN
	- 会将远程ls得到的结果通过管道传递给本地grep

# ssh密钥简易操作方法（具体原理见后文）

- 生成密钥对：ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519
- 将公钥推送：ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote.example.com
	- 这里要输入登录密码
- 先尝试登录：ssh user@remote.example.com -i ~/.ssh/id_ed25519
	-  这里如果有-p指定了端口，也要加入-p
- 再配置文件：（~/.ssh/config）
```txt
Host server_alias                   #自己取的别名，之后直接ssh server_alias即可
	Hostname remote.example.com     #ip
	User user                       #username
	Port 31122                      #端口
	IdentityFile ~/.ssh/id_ed25519  #私钥文件位置
```
- 直接使用 ssh server_alias 即可直接登录
# ssh密钥
## 1. **公钥和私钥的运作原理**

SSH（Secure Shell）使用 **公钥加密技术**（非对称加密）来实现安全的身份验证和通信。公钥和私钥是一对数学上相关的密钥，基于特定加密算法（如 RSA 或 Ed25519）。以下是其基本原理：

### **1.1 公钥和私钥的概念**

- **私钥**（Private Key）：
    - 保存在客户端（你的本地机器），必须严格保密。
    - 用于签名或解密数据，只有持有私钥的用户才能完成身份验证。
- **公钥**（Public Key）：
    - 可以公开分享，放置在远程服务器的 ~/.ssh/authorized_keys 文件中。
    - 用于验证客户端的身份或加密数据，只有对应的私钥能解密。

### **1.2 运作原理**

SSH 公钥认证的过程如下：

1. **密钥生成**：
    - 使用 ssh-keygen 生成一对密钥（公钥和私钥），基于算法（如 RSA 或 Ed25519）。
    - 私钥保存在本地，公钥分发到目标服务器。
2. **身份验证流程**：
    - **客户端发起连接**：你运行 ssh user@server，客户端向服务器发送请求。
    - **服务器发送挑战**：服务器从 ~/.ssh/authorized_keys 获取你的公钥，生成一个随机挑战数据（nonce），用公钥加密后发送给客户端。
    - **客户端解密挑战**：客户端使用私钥解密挑战数据，并生成一个响应（通常是签名）。
    - **服务器验证**：服务器用公钥验证客户端的响应。如果匹配，证明客户端持有正确的私钥，允许登录。
3. **加密通信**：
    - 认证成功后，客户端和服务器协商一个对称会话密钥（更快），用于加密后续通信。
    - 公钥认证只用于初始身份验证，数据传输使用对称加密。

### **1.3 为什么安全？**

- **非对称性**：公钥可以加密数据，但只有对应的私钥能解密；反之，私钥签名的数据只有公钥能验证。
- **私钥保密**：只要私钥不泄露，攻击者无法伪装身份。
- **密码保护**：私钥可以设置密码（passphrase），即使私钥文件被窃取，没有密码也无法使用。

### **1.4 优势**

- 比密码登录更安全（避免暴力破解）。
- 支持无密码登录（通过 ssh-agent 或无密码密钥）。
- 可用于自动化任务（如脚本、Git 推送）。

---

## 2. **ssh-copy-id 的作用**

ssh-copy-id 是一个便捷工具，用于将本地的 SSH 公钥复制到远程服务器的 ~/.ssh/authorized_keys 文件中，使服务器信任你的客户端。以下是其详细作用和工作原理：

### **2.1 功能**

- 自动将公钥追加到远程服务器的 ~/.ssh/authorized_keys 文件。
- 确保目标目录（~/.ssh）和文件的权限正确（如 700 和 600）。
- 支持指定特定的公钥文件或身份文件。

### **2.2 工作原理**

运行 ssh-copy-id user@remote_host 时：

1. 读取本地默认公钥（通常是 ~/.ssh/id_rsa.pub 或 id_ed25519.pub）。
2. 使用 SSH 连接到远程服务器（需要密码或其他现有认证方式）。
3. 在远程服务器的 ~/.ssh/ 目录下创建 authorized_keys 文件（如果不存在）。
4. 将本地公钥追加到 authorized_keys 文件。
5. 设置正确的权限（chmod 700 ~/.ssh 和 chmod 600 ~/.ssh/authorized_keys）。

### **2.3 示例**

bash

```
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote.example.com
```

- -i：指定公钥文件（可选，默认使用 ~/.ssh/id_*.pub）。
- user@remote.example.com：目标服务器的用户名和地址。
- 运行后，提示输入服务器密码（如果没有其他认证方式）。

### **2.4 输出示例**

text

```
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
user@remote.example.com's password: 
Number of key(s) added: 1
Now try logging into the machine, with:   "ssh 'user@remote.example.com'"
and check to make sure that only the key(s) you wanted were added.
```

### **2.5 手动替代方法**

如果 ssh-copy-id 不可用，可以手动完成：

bash

```
cat ~/.ssh/id_ed25519.pub | ssh user@remote.example.com 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
```

- cat：输出公钥内容。
- ssh：通过 SSH 管道将公钥发送到远程服务器。
- mkdir -p ~/.ssh：确保 ~/.ssh 目录存在。
- cat >> ~/.ssh/authorized_keys：追加公钥到文件。
- chmod：设置正确权限。

### **2.6 注意事项**

- 确保远程服务器的 SSH 配置（/etc/ssh/sshd_config）启用了公钥认证（PubkeyAuthentication yes）。
- 如果目标文件已包含公钥，ssh-copy-id 会跳过重复添加。
- 手动添加公钥时，注意不要覆盖 authorized_keys 中的其他密钥。

---

## 3. **生成密钥完整流程中每步代码的作用**

以下是生成和使用 SSH 密钥的完整流程（以 Ed25519 算法为例），并详细解释每步代码的作用：

#### **3.1 流程**

bash

```
# 1. 生成密钥对
ssh-keygen -t ed25519 -C "user@mycomputer"

# 2. 将公钥复制到远程服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote.example.com

# 3. 测试 SSH 连接
ssh user@remote.example.com

# 4. （可选）配置 SSH 客户端
cat >> ~/.ssh/config << EOL
Host server1
    HostName remote.example.com
    User user
    IdentityFile ~/.ssh/id_ed25519
EOL

# 5. 使用配置登录
ssh server1
```

### **3.2 每步代码的作用**

1. **生成密钥对**：
    
    bash
    
    ```
    ssh-keygen -t ed25519 -C "user@mycomputer"
    ```
    
    - -t ed25519：指定使用 Ed25519 算法（高效、安全）。
    - -C "user@mycomputer"：为公钥添加注释，便于识别（例如，在服务器的 authorized_keys 中显示）。
    - 作用：生成私钥（~/.ssh/id_ed25519）和公钥（~/.ssh/id_ed25519.pub）。
    - 提示用户输入文件名（默认 ~/.ssh/id_ed25519）和密码（可选，保护私钥）。
2. **复制公钥到服务器**：
    
    bash
    
    ```
    ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote.example.com
    ```
    
    - -i ~/.ssh/id_ed25519.pub：指定要复制的公钥文件。
    - user@remote.example.com：目标服务器的用户名和地址。
    - 作用：将公钥追加到远程服务器的 ~/.ssh/authorized_keys，并设置正确权限，允许客户端使用对应私钥登录。
3. **测试连接**：
    
    bash
    
    ```
    ssh user@remote.example.com
    ```
    
    - 作用：尝试使用公钥认证登录服务器。如果公钥正确配置，连接将无需密码（或仅需私钥密码）。
    - 如果失败，可能需要检查 authorized_keys 内容、权限或服务器的 SSH 配置。
4. **配置 SSH 客户端**：
    
    bash
    
    ```
    cat >> ~/.ssh/config << EOL
    Host server1
        HostName remote.example.com
        User user
        IdentityFile ~/.ssh/id_ed25519
    EOL
    ```
    
    - cat >> ~/.ssh/config：将配置追加到 ~/.ssh/config 文件。
    - Host server1：定义一个别名（server1），方便登录。
    - HostName remote.example.com：指定实际服务器地址。
    - User user：指定登录用户名。
    - IdentityFile ~/.ssh/id_ed25519：指定使用的私钥文件。
    - 作用：简化 SSH 命令（用 ssh server1 替代 ssh user@remote.example.com -i ~/.ssh/id_ed25519）。
5. **使用配置登录**：
    
    bash
    
    ```
    ssh server1
    ```
    
    - 作用：通过 ~/.ssh/config 中的别名 server1 登录服务器，自动应用配置中的用户名、地址和密钥文件。

---

## 4. **登录另一个服务器的密钥生成流程区别**

如果你需要登录另一个服务器（例如 user2@another.example.com），生成密钥的流程可以有以下几种方式，具体取决于你的需求：

### **4.1 使用同一密钥对**

- **适用场景**：你希望用同一对密钥（例如 ~/.ssh/id_ed25519）登录多个服务器。
- **流程**：
    1. **无需重新生成密钥**：如果你已经有一对密钥（通过 ssh-keygen 生成），可以直接复用。
    2. **复制公钥到新服务器**：
        
        bash
        
        ```
        ssh-copy-id -i ~/.ssh/id_ed25519.pub user2@another.example.com
        ```
        
        - 将同一公钥添加到新服务器的 ~/.ssh/authorized_keys。
    3. **测试登录**：
        
        bash
        
        ```
        ssh user2@another.example.com
        ```
        
    4. **（可选）更新 .ssh/config**：
        
        bash
        
        ```
        cat >> ~/.ssh/config << EOL
        Host server2
            HostName another.example.com
            User user2
            IdentityFile ~/.ssh/id_ed25519
        EOL
        ```
        
        - 添加新服务器的配置，指定相同的 IdentityFile。
- **区别**：无需运行 ssh-keygen，只需将现有公钥复制到新服务器。
- **优点**：简单，管理单一密钥对。
- **缺点**：如果私钥泄露，所有服务器都可能受影响。

### **4.2 为新服务器生成新密钥对**

- **适用场景**：出于安全考虑，你希望为每个服务器使用不同的密钥对。
- **流程**：
    1. **生成新密钥对**：
        
        bash
        
        ```
        ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_server2 -C "user2@another.example.com"
        ```
        
        - -f ~/.ssh/id_ed25519_server2：指定新密钥文件名，避免覆盖默认密钥。
        - 结果：生成 id_ed25519_server2（私钥）和 id_ed25519_server2.pub（公钥）。
    2. **复制公钥到新服务器**：
        
        bash
        
        ```
        ssh-copy-id -i ~/.ssh/id_ed25519_server2.pub user2@another.example.com
        ```
        
    3. **测试登录**：
        
        bash
        
        ```
        ssh -i ~/.ssh/id_ed25519_server2 user2@another.example.com
        ```
        
        - -i：指定使用的私钥文件。
    4. **（可选）更新 .ssh/config**：
        
        bash
        
        ```
        cat >> ~/.ssh/config << EOL
        Host server2
            HostName another.example.com
            User user2
            IdentityFile ~/.ssh/id_ed25519_server2
        EOL
        ```
        
        - 指定新密钥文件。
- **区别**：
    - 需要运行 ssh-keygen 生成新密钥对，指定不同文件名（-f）。
    - 每个服务器使用独立的密钥对，需分别管理。
- **优点**：安全性更高，单台服务器密钥泄露不影响其他服务器。
- **缺点**：需要管理多个密钥对，增加复杂度。

### **4.3 选择建议**

- 如果是个人使用或低风险场景，复用同一密钥对更简单。
- 如果是高安全需求（如企业环境或敏感服务器），为每个服务器生成独立密钥对。
- 使用 ~/.ssh/config 可以有效管理多服务器和多密钥的配置。

---

## 5. **.ssh/config 是否限制只能登录一个服务器？**

**答案**：.ssh/config 不仅不限制登录单一服务器，反而是为管理多个服务器设计的强大工具。它允许你为不同服务器定义别名、用户名、地址和密钥文件，简化登录流程。

### **5.1 .ssh/config 的作用**

- **简化命令**：通过别名（如 ssh server1）替代复杂的 ssh user@host -i key。
- **多服务器支持**：可以为任意数量的服务器定义配置块。
- **灵活性**：支持指定不同的密钥、端口、用户名等。

### **5.2 示例：配置多个服务器**

假设你需要登录两个服务器：

- server1（user@remote.example.com，使用 id_ed25519）。
- server2（user2@another.example.com，使用 id_ed25519_server2）。

.ssh/config 文件内容如下：

bash

```
Host server1
    HostName remote.example.com
    User user
    IdentityFile ~/.ssh/id_ed25519

Host server2
    HostName another.example.com
    User user2
    IdentityFile ~/.ssh/id_ed25519_server2
```

- **作用**：
    - Host server1：定义别名 server1，运行 ssh server1 相当于 ssh user@remote.example.com -i ~/.ssh/id_ed25519。
    - Host server2：定义别名 server2，运行 ssh server2 相当于 ssh user2@another.example.com -i ~/.ssh/id_ed25519_server2。
- **登录**：
    
    bash
    
    ```
    ssh server1  # 登录第一个服务器
    ssh server2  # 登录第二个服务器
    ```
    

### **5.3 为什么支持多服务器？**

- **独立配置块**：每个 Host 块定义一个独立的服务器配置，互不干扰。
- **匹配规则**：SSH 客户端根据 Host 别名或 HostName 匹配配置，自动应用对应的参数。
- **扩展性**：你可以添加任意数量的 Host 块，支持数十或数百个服务器。

### **5.4 高级配置示例**

- **通配符**：支持通配符匹配多个服务器：
    
    bash
    
    ```
    Host *.example.com
        User user
        IdentityFile ~/.ssh/id_ed25519
    ```
    
    - 匹配所有 *.example.com 的服务器。
- **非标准端口**：
    
    bash
    
    ```
    Host server3
        HostName remote.example.com
        User user
        Port 2222
        IdentityFile ~/.ssh/id_ed25519
    ```
    
    - 指定非默认的 SSH 端口（默认 22）。
- **代理跳转**：
    
    bash
    
    ```
    Host server4
        HostName internal.example.com
        User user
        ProxyJump server1
        IdentityFile ~/.ssh/id_ed25519
    ```
    
    - 通过 server1 跳转登录 server4。

### **5.5 注意事项**

- **权限**：确保 ~/.ssh/config 文件权限为 600（chmod 600 ~/.ssh/config）。
- **优先级**：SSH 按文件顺序匹配 Host，第一个匹配的配置生效。
- **调试**：如果配置失败，用 ssh -v server1 查看详细日志。

# 对于ssh密钥的自己理解

- 密钥和公钥可以当作访问任何服务器的通用密码（在使用同一对密钥和公钥的时候）
- 为了建立起和服务器的联系，把公钥推送给服务器
	- 注意，这里是用到**实际密码**的地方
	- 这就好比密码登录了一次后，对于这个设备就免密登录了
	- 以后的登录就是通过服务器发送公钥，本地返回私钥的方式，不需要重新输入密码了
- 因此对于多台服务器的登录，如果不用很考虑安全性，只需：
	- 将已经存在的公钥推送给服务器（这时要输入一次登录密码）
	- 然后就直接可以用本地私钥访问了
	- 这里注意，如果公钥和私钥真的只有一对，且名称是默认的
		- 推送公钥的时候可以直接ssh-copy-id username@ip，因为默认参数就是公钥
		- 可以直接ssh username@ip，因为默认参数就是私钥
	- 但如果有多对公钥和私钥，或者自定义了公私钥的名字
		- 推送公钥的时候要用-i显式指定哪一个公钥
		- ssh username@ip时要 -i 显式指定哪一个私钥
- 因此，考虑安全性，即对不同的服务器有不同的公钥和私钥的时候
	- 常用 .ssh/config 避免显式手动指定-i
	- 会根据配置自动选择正确的私钥，但公钥仍旧得手动推送
	- 见 [5.2 示例：配置多个服务器](ssh.md#52)


# 一些零碎的注意事项：

- 登陆服务器时的-p选项代表端口，这在推送公钥和~/.ssh/config里面都要注意加上