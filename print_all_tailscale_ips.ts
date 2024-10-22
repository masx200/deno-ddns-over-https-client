import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.143.0/node/internal/net.ts";
import type { DDNScontentContent } from "./DDNScontentContent.ts";
import { getAllTailscaleNetworkIPsAndSelfPublicIPs } from "./get_all_tailscale_ips.ts";
import { runCommand } from "./runCommand.ts";
if (import.meta.main) {
    console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

    console.log(await getPeersTailscaleNetworkIPs());
}

export async function getPeersTailscaleNetworkIPs(
    opts: {
        name: string;
        public: boolean;
        tailscale: boolean;
        ipv4: boolean;
        ipv6: boolean;
    } = { name: "", public: true, tailscale: true, ipv4: true, ipv6: true },
): Promise<DDNScontentContent[]> {
    const { name, tailscale /* , ipv4, ipv6  */ } = opts;
    const selfIPs: string[] = [];
    const config = name
        ? {
            [name]: selfIPs,
        }
        : {};
    let data1: {
        Self: { DNSName: string; TailscaleIPs: string[] };
        Peer: Record<string, { DNSName: string; TailscaleIPs: string[] }>;
    } | null = null;
    if (tailscale) {
        try {
            const text = await runCommand("tailscale", ["status", "--json"]);
            const data: {
                Self: { DNSName: string; TailscaleIPs: string[] };
                Peer: Record<
                    string,
                    { DNSName: string; TailscaleIPs: string[] }
                >;
            } = JSON.parse(text);
            data1 = data;
            selfIPs.push(...Array.from(data.Self.TailscaleIPs));
            const tailscale_name = tailscale
                ? data.Self.DNSName.slice(0, -1)
                : name;
            config[tailscale_name] = selfIPs;
        } catch (error) {
            console.error(error);
        }
    }
    if (data1) {
        for (const v of Object.values(data1.Peer)) {
            Object.assign(config, {
                [v.DNSName.slice(0, -1)]: v.TailscaleIPs,
            });
        }
    }
    // if (opts.public) {
    //     if (ipv4) {
    //         try {
    //             selfIPs.push(await getPublicIpv4());
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     if (ipv6) {
    //         try {
    //             selfIPs.push(await getPublicIpv6());
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    // }
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
