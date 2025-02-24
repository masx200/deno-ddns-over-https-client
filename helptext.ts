export const helptext = `

- interval: 数值,表示更新间隔时间（单位：毫秒）,默认为 30000.
-
- ipv4: 布尔值,表示是否启用 IPv4 地址,默认为 true.
-
- ipv6: 布尔值,表示是否启用 IPv6 地址,默认为 true.
-
- tailscale: 布尔值,表示是否启用 Tailscale 地址,默认为 false.
-
- public: 布尔值,表示是否启用公共地址,默认为 true.
-
- get_ip_url:布尔值或字符串,向服务器查询本机的公共地址,可以为多个字符串,逗号分割,默认为
\`\`\`
 [
    "https://ipv6.ident.me/",
    "https://ipv4.ident.me/",
    "https://speed4.neu6.edu.cn/getIP.php",
    "https://speed.neu6.edu.cn/getIP.php",
    "https://api4.ipify.org",
    "https://api6.ipify.org/",
    "https://api-ipv6.ip.sb/ip",
    "https://api-ipv4.ip.sb/ip"
]\`\`\`。
-
-
- private: 布尔值,表示是否启用私有地址,忽略回环地址,默认为 false。
-
-
- token: 字符串,表示 API 令牌,必须的.
-
- name: 字符串,表示 主机域名,可以有多个域名,用逗号分隔,必须的.
-
- service_url: 字符串,表示 DDNS 服务 URL,必须的.
-
- 必须的参数: token /name/ service_url.
-
- interfaces:布尔值或字符串,表示是否启用接口地址,忽略回环地址,或者可以是多个 接口名,用逗号分隔,比如 eth0,eth1.默认为 false.
-
`;
