import { isIPv6 } from "std:node:net";
import { isIPv4 } from "std:node:net";

import { uniqBy } from "lodash-es";
import type { DDNSClientOptions } from "./DDNSClientOptions.ts";
import { DNSRecordsRemoteJSONRPC } from "./DNSRecordsRemote.ts";
import { getPublicIpv4orv6 } from "./getPublicIpv4orv6.ts";
import { getAllTailscaleNetworkIPsAndSelfPublicIPs } from "./get_all_tailscale_ips.ts";
import { isPrivate } from "./isPrivate.ts";
import { isPublic } from "./isPublic.ts";
import type { DDNScontentContent } from "./DDNScontentContent.ts";

/**
 * 异步函数,用于执行一次DDNS更新
 * @param opts - 配置选项
 * @param opts.interval - 更新间隔时间（单位：秒）
 * @param opts.ipv4 - 是否使用IPv4地址
 * @param opts.ipv6 - 是否使用IPv6地址
 * @param opts.tailscale - 是否使用Tailscale网络地址
 * @param opts.public - 是否使用公共IP地址
 * @param opts.token - 访问令牌
 * @param opts.name - DNS记录名称
 * @param opts.service_url - 服务URL
 */
export async function run_ddns_update_once(opts: DDNSClientOptions) {
    const localdata = await fetchAndFilterLocalAndPublicIPs(opts);

    return await Promise.all(
        opts.name.map(async (name) => {
            name = name.trim();
            const { ipv4, ipv6 } = opts;
            const client = new DNSRecordsRemoteJSONRPC(
                opts.service_url,
                opts.token,
            );

            let remotedata = await client.ListDNSRecords({
                name: name,

                type: ipv4 && !ipv6 ? "A" : ipv6 && !ipv4 ? "AAAA" : undefined,
            });

            remotedata = remotedata.filter((a) =>
                ["A", "AAAA"].includes(a.type)
            );

            console.log("本地地址信息", localdata);

            console.log("远程地址信息", remotedata);
            if (!localdata.length) {
                console.error("本地地址信息为空,不进行更新");
                return;
            }
            const localset = new Set(localdata.map((a) => a.content));
            const remoteset = new Set(remotedata.map((a) => a.content));
            if (
                localset.size === remoteset.size &&
                [...localset].every((value) => remoteset.has(value))
            ) {
                console.log("两个地址记录完全相等");
                return;
            } else {
                console.log("两个地址记录不相等");
                const differencelocalsetToremoteset = new Set(
                    [...localset].filter((x) => !remoteset.has(x)),
                );
                console.log("需要添加的地址", differencelocalsetToremoteset);
                const differenceremotesetTolocalset = new Set(
                    [...remoteset].filter((x) => !localset.has(x)),
                );
                console.log("需要删除的地址", differenceremotesetTolocalset);
                const recordstobedeletedids = [...differenceremotesetTolocalset]
                    .map((b) => remotedata.filter((a) => a.content === b))
                    .flat();

                const 需要删除的记录ID = recordstobedeletedids.map((a) => ({
                    id: a.id,
                }));
                const 需要添加的记录内容 = [
                    ...differencelocalsetToremoteset,
                ].map((a) => ({
                    content: a,
                    name: name,
                    type: isIPv6(a) ? "AAAA" : "A",
                }));
                console.log(
                    await Promise.all(
                        [
                            需要添加的记录内容.length &&
                            client.CreateDNSRecord(需要添加的记录内容),
                            需要删除的记录ID.length &&
                            client.DeleteDNSRecord(需要删除的记录ID),
                        ].filter(Boolean),
                    ),
                );
                console.log("更新完成", {
                    需要删除的记录ID,
                    需要添加的记录内容,
                });
            }
        }),
    );
}

async function fetchAndFilterLocalAndPublicIPs(opts: DDNSClientOptions) {
    const { ipv4, ipv6 } = opts;

    let localdata = await getAllTailscaleNetworkIPsAndSelfPublicIPs({
        name: name,
        public: Boolean(opts.public && opts.get_ip_url.length),
        tailscale: opts.tailscale,
        ipv4: opts.ipv4,
        ipv6: opts.ipv6,
    });

    localdata = localdata.filter((a) => ["A", "AAAA"].includes(a.type));

    if (opts.interfaces) {
        const networkInterfaces = Deno.networkInterfaces().filter(
            (a) =>
                a.address !== "127.0.0.1" &&
                a.address !== "::1" &&
                !a.address.startsWith("fe80::"),
        );
        console.log(networkInterfaces);
        for (const networkInterfaceInfo of networkInterfaces) {
            if (typeof opts.interfaces === "boolean" && opts.interfaces) {
                localdata.push({
                    name: name,
                    content: networkInterfaceInfo.address,
                    type: networkInterfaceInfo.family === "IPv4" ? "A" : "AAAA",
                });
            } else if (
                Array.isArray(opts.interfaces) &&
                opts.interfaces.includes(networkInterfaceInfo.name)
            ) {
                localdata.push({
                    name: name,
                    content: networkInterfaceInfo.address,
                    type: networkInterfaceInfo.family === "IPv4" ? "A" : "AAAA",
                });
            }
        }
    }

    if (opts.public && opts.get_ip_url.length) {
        try {
            localdata.push(
                ...((
                    await Promise.allSettled(
                        opts.get_ip_url.map(async (a) => {
                            const ip = await getPublicIpv4orv6(a);
                            console.log({
                                get_ip_url: a,
                                ip_address: ip,
                            });
                            return {
                                name: name,
                                content: ip,
                                type: isIPv6(ip) ? "AAAA" : "A",
                            };
                        }),
                    )
                )
                    .filter((a) => {
                        if (a.status === "rejected") {
                            console.error(a.reason);
                        }
                        return a.status === "fulfilled";
                    })
                    .map((a) => (a.status === "fulfilled" ? a.value : null))
                    .filter(Boolean) as DDNScontentContent[]),
            );
        } catch (error) {
            console.error(error);
        }
    }
    localdata = localdata
        .filter(function (a) {
            if (ipv6 && isIPv6(a.content)) {
                return true;
            }
            if (ipv4 && isIPv4(a.content)) {
                return true;
            }
        })
        .filter(function (a) {
            if (opts.private && isPrivate(a.content)) {
                return true;
            }
            if (opts.public && isPublic(a.content)) {
                return true;
            }
        });

    localdata = uniqBy(localdata, (a: { content: any }) => a.content);
    return localdata;
}
