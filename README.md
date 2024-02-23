# deno-ddns-over-https-client

可以和 deno-dns-over-https-server 一起使用

### 使用方法

```
deno run -A ./run_ddns_interval_client.ts --name=xxxxxx-xxxx.xxxxx.xxx.xxx --service_url=https://xxxxxxxxxxxxxxxxxx.xxxxx.xxxxxxxx/dns_records --token=xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 命令参数

- interval: 数值，表示更新间隔时间（单位：毫秒）
-
- ipv4: 布尔值，表示是否启用 IPv4
-
- ipv6: 布尔值，表示是否启用 IPv6
-
- tailscale: 布尔值，表示是否启用 Tailscale
-
- public: 布尔值，表示是否启用公共 地址
-
- token: 字符串，表示 API 令牌
-
- name: 字符串，表示 主机域名
-
- service_url: 字符串，表示 DDNS 服务 URL
-
- 必须的参数: token /name/ service_url
