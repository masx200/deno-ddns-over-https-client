# deno-ddns-over-https-client

可以和 deno-dns-over-https-server 一起使用

### 使用方法

```
deno run -A ./run_ddns_interval_client.ts --name=xxxxxx-xxxx.xxxxx.xxx.xxx --service_url=https://xxxxxxxxxxxxxxxxxx.xxxxx.xxxxxxxx/dns_records --token=xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 命令参数

-   interval: 数值,表示更新间隔时间（单位：毫秒）,默认为 30000.
-
-   ipv4: 布尔值,表示是否启用 IPv4 地址,默认为 true.
-
-   ipv6: 布尔值,表示是否启用 IPv6 地址,默认为 true..
-
-   tailscale: 布尔值,表示是否启用 Tailscale 地址,默认为 false.
-
-   public: 布尔值,表示是否启用公共地址,并向服务器查询本机的公共地址,默认为 true.
-
-   private: 布尔值,表示是否启用私有地址,忽略回环地址,或者可以是多个 cidr,比如
    192.168.1.0/24,100.64.0.0/10,用逗号分隔,默认为 false.
-
-   token: 字符串,表示 API 令牌,必须的.
-
-   name: 字符串,表示 主机域名,必须的.
-
-   service_url: 字符串,表示 DDNS 服务 URL,必须的.
-
-   必须的参数: token /name/ service_url.
-
-   interfaces:布尔值,表示是否启用接口地址,忽略回环地址,默认为 false,或者可以是多个
    接口名,用逗号分隔,比如 eth0,eth1.
-
