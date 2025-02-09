import type { DDNSClientOptions } from "./DDNSClientOptions.ts";
import { run_ddns_update_once } from "./run_ddns_update_once.ts";
import { main } from "./main.ts";
// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

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
    opts: DDNSClientOptions,
): Promise<() => void> {
    console.log(opts);
    try {
        await run_ddns_update_once(opts); // 运行一次DDNS更新
    } catch (error) {
        console.error(error);
    }

    const interval = Number.isNaN(opts.interval) || opts.interval < 30 * 1000
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
if (import.meta.main) {
    await main();
}
