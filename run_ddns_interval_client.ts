const IPADDRESSLOOKUPURLdefault = [
    "https://ipv6.ident.me/",
    "https://ipv4.ident.me/",
    "https://speed4.neu6.edu.cn/getIP.php",
    "https://speed.neu6.edu.cn/getIP.php",
    "https://api4.ipify.org",
    "https://api6.ipify.org/",
    "https://api-ipv6.ip.sb/ip",
    "https://api-ipv4.ip.sb/ip",
    "https://ifconfig.co/",
];
// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

import { assert } from "https://deno.land/std@0.217.0/assert/assert.ts";
import parse from "@masx200/mini-cli-args-parser";
import { run_ddns_update_once } from "./run_ddns_update_once.ts";
import type { DDNSClientOptions } from "./DDNSClientOptions.ts";
/**
 * 异步函数,用于运行DDNS间隔客户端
 * @param opts - 包含以下属性的对象：
 *   - interval: 数值,表示更新间隔时间（单位：毫秒）
 *   - ipv4: 布尔值,表示是否启用IPv4地址
 *   - ipv6: 布尔值,表示是否启用IPv6地址
 *   - tailscale: 布尔值,表示是否启用Tailscale地址
 *   - public: 布尔值,表示是否启用公共地址
 *   - token: 字符串,表示API令牌
 *   - name: 字符串,表示 主机域名
 *   - service_url: 字符串,表示DDNS服务URL
 * - interfaces:布尔值,表示是否启用接口地址,忽略回环地址
 * @returns 返回一个函数,用于清除定时器
 */
export async function run_ddns_interval_client(
    opts: DDNSClientOptions
): Promise<() => void> {
    console.log(opts);
    try {
        await run_ddns_update_once(opts); // 运行一次DDNS更新
    } catch (error) {
        console.error(error);
    }

    const interval =
        Number.isNaN(opts.interval) || opts.interval < 30 * 1000
            ? 30 * 1000
            : opts.interval;
    const timer = setInterval(async () => {
        try {
            await run_ddns_update_once(opts); // 运行一次DDNS更新
        } catch (error) {
            console.error(error);
        } // 每隔指定时间运行一次DDNS更新
    }, interval);
    return () => clearInterval(timer); // 返回一个清除定时器的函数
}
const helptext = `

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
if (import.meta.main) {
    await main();
}

export async function main() {
    const opts = parse(Deno.args);

    console.log(opts);

    if (
        Deno.args.length === 0 ||
        !opts.token ||
        !opts.name ||
        !opts.service_url
    ) {
        console.log(helptext);

        throw Error("缺少必须的参数: token /name/ service_url");
    }

    const ipv4 = Boolean(opts.ipv4 ? opts.ipv4 === "true" : true);

    const interfaces = Boolean(
        opts.interfaces
            ? opts.interfaces === "true"
                ? true
                : opts.interfaces === "false"
                ? false
                : String(opts.interfaces)?.split(",")
            : false
    );
    const ipv6 = Boolean(opts.ipv6 ? opts.ipv6 === "true" : true);
    const private_param = Boolean(
        opts.private ? opts.private === "true" : false
    );

    const interval = Number(opts.interval || 30 * 1000);

    assert(Number.isFinite(interval), "interval 必须是数字");

    if (!ipv4 && !ipv6) {
        throw new Error("ipv4 and ipv6 must be true or false");
    }
    const get_ip_url: string[] =
        typeof opts.get_ip_url == "string"
            ? opts.get_ip_url === "false"
                ? []
                : (
                      String(opts.get_ip_url)?.split(",") ??
                      IPADDRESSLOOKUPURLdefault
                  ).filter(Boolean)
            : IPADDRESSLOOKUPURLdefault;
    const tailscale = Boolean(
        opts.tailscale ? opts.tailscale === "true" : false
    );
    const public_param = Boolean(opts.public ? opts.public === "true" : true);
    /*  const stop = */ await run_ddns_interval_client({
        interval: interval,
        get_ip_url,
        ipv4: ipv4,
        private: private_param,
        interfaces,
        ipv6: ipv6,

        tailscale: tailscale,

        public: public_param,

        token: String(opts.token ?? "token"),

        name: (String(opts.name)?.split(",") ?? ["name"]).map((name) =>
            name.trim()
        ),

        service_url: String(opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX"),
    });
}
