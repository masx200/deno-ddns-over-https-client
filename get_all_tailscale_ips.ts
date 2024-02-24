import { isIPv6 } from "https://deno.land/std@0.143.0/node/internal/net.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import { runCommand } from "./runCommand.ts";
import {
    getPublicIpv4,
    getPublicIpv6,
} from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/mod.ts";
import { isIPv4 } from "https://deno.land/std@0.169.0/node/internal/net.ts";
/**
 * 获取所有Tailscale网络IP和自定义公共IP
 * @param opts - 选项参数
 * @returns Promise<DDNScontentContent[]>
 */
export async function getAllTailscaleNetworkIPsAndSelfPublicIPs(
    opts: {
        name: string;
        public: boolean;
        tailscale: boolean;
        ipv4: boolean;
        ipv6: boolean;
    },
): Promise<DDNScontentContent[]> {
    const { name, tailscale, ipv4, ipv6 } = opts;
    const selfIPs: string[] = [];
    const config = {
        [name]: selfIPs,
    };

    if (tailscale) {
        try {
            const text = await runCommand("tailscale", ["status", "--json"]);
            const data: {
                Self: { DNSName: string; TailscaleIPs: string[] };
                // Peer: Record<string, { DNSName: string; TailscaleIPs: string[] }>;
            } = JSON.parse(text);
            selfIPs.push(...Array.from(data.Self.TailscaleIPs));
            const tailscale_name = tailscale
                ? data.Self.DNSName.slice(0, -1)
                : name;
            config[tailscale_name] = selfIPs;
        } catch (error) {
            console.error(error);
        }
    }

    // for (const v of Object.values(data.Peer)) {
    //     Object.assign(config, {
    //         [v.DNSName.slice(0, -1)]: v.TailscaleIPs,
    //     });
    // }
    if (opts.public) {
        if (ipv4) {
            try {
                selfIPs.push(await getPublicIpv4());
            } catch (error) {
                console.error(error);
            }
        }
        if (ipv6) {
            try {
                selfIPs.push(await getPublicIpv6());
            } catch (error) {
                console.error(error);
            }
        }
    }
    // console.log(JSONSTRINGIFYNULL4(config, null, 4))
    // return config;
    const result = new Array<DDNScontentContent>();
    for (const [k, v] of Object.entries(config)) {
        for (const ip of v) {
            if (opts.ipv4 && isIPv4(ip)) {
                result.push({
                    name: k,
                    content: ip,
                    type: isIPv6(ip) ? "AAAA" : "A",
                });
            }
            if (opts.ipv6 && isIPv6(ip)) {
                result.push({
                    name: k,
                    content: ip,
                    type: isIPv6(ip) ? "AAAA" : "A",
                });
            }
        }
    }
    return result;
}
