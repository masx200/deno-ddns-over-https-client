// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

import parse from "npm:@masx200/mini-cli-args-parser@1.1.0";
import { run_ddns_update_once } from "./run_ddns_update_once.ts";

/**
 * 异步函数，用于运行DDNS间隔客户端
 * @param opts - 包含以下属性的对象：
 *   - interval: 数值，表示更新间隔时间（单位：毫秒）
 *   - ipv4: 布尔值，表示是否启用IPv4
 *   - ipv6: 布尔值，表示是否启用IPv6
 *   - tailscale: 布尔值，表示是否启用Tailscale
 *   - public: 布尔值，表示是否启用公共地址
 *   - token: 字符串，表示API令牌
 *   - name: 字符串，表示 主机域名
 *   - service_url: 字符串，表示DDNS服务URL
 * @returns 返回一个函数，用于清除定时器
 */
export async function run_ddns_interval_client(
    opts: {
        interval: number;
        ipv4: boolean;
        ipv6: boolean;
        tailscale: boolean;
        public: boolean;
        token: string;
        name: string;
        service_url: string;
    },
): Promise<() => void> {
    try {
        await run_ddns_update_once(opts); // 运行一次DDNS更新
    } catch (error) {
        console.error(error);
    }

    const interval =
        (Number.isNaN(opts.interval) || (opts.interval < 30 * 1000))
            ? 30 * 1000
            : opts.interval;
    const timer = setInterval(
        async () => {
            try {
                await run_ddns_update_once(opts); // 运行一次DDNS更新
            } catch (error) {
                console.error(error);
            } // 每隔指定时间运行一次DDNS更新
        },
        interval,
    );
    return () => clearInterval(timer); // 返回一个清除定时器的函数
}

if (import.meta.main) {
    const opts = parse(Deno.args);
    console.log(opts);
    if (
        Deno.args.length === 0 || !opts.token || !opts.name || !opts.service_url
    ) {
        console.log(`- interval: 数值，表示更新间隔时间（单位：毫秒）
        - ipv4: 布尔值，表示是否启用 IPv4
        - ipv6: 布尔值，表示是否启用 IPv6
        - tailscale: 布尔值，表示是否启用 Tailscale
        - public: 布尔值，表示是否启用公共 地址
        - token: 字符串，表示 API 令牌
        - name: 字符串，表示 主机域名
        - service_url: 字符串，表示 DDNS 服务 URL`);

        throw Error("缺少必须的参数: token /name/ service_url");
    }

    const ipv4 = Boolean(opts.ipv4 ? opts.ipv4 === "true" : true);
    const ipv6 = Boolean(opts.ipv6 ? opts.ipv6 === "true" : true);

    if (!ipv4 && !ipv6) {
        throw new Error("ipv4 and ipv6 must be true or false");
    }
    /*  const stop = */ await run_ddns_interval_client({
        interval: Number(opts.interval || 30 * 1000),
        ipv4: ipv4,
        ipv6: ipv6,
        tailscale: Boolean(opts.tailscale ? opts.tailscale === "true" : true),
        public: Boolean(opts.public ? opts.public === "true" : true),
        token: opts.token ?? "token",
        name: opts.name ?? "name",
        service_url: opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX",
    });
    // setTimeout(() => stop(), 10000);
}
