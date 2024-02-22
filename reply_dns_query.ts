// import config from "./config.ts";
import { get_ttl_min } from "./get_ttl_min.ts";
import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.169.0/node/internal/net.ts";
import { DNSServer } from "./DNSServer.ts";
import { DNSConfig } from "./DNSConfig.ts";
import { DNSRecordType } from "./DNSRecordType.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
import { dNSRecordsInstance } from "./dNSRecordsInstance.ts";
// import { DNSPACKET } from "./DNSPACKET.ts";
/**
 * 回复DNS查询
 * @param packet DNSPACKET对象
 * @param data Uint8Array对象
 * @returns { success: boolean; result: Uint8Array | null | undefined }对象
 */
export async function reply_dns_query(
    packet: DNSPACKETInterface,
    data: Uint8Array,
): Promise<{ success: boolean; result: Uint8Array | null | undefined }> {
    const name = packet.question[0]?.name;
    const address: string[] | undefined = (await Promise.all([
        dNSRecordsInstance.ListDNSRecords({
            name: name,
            type: "A",
        }),
        dNSRecordsInstance.ListDNSRecords({
            name: name,
            type: "AAAA",
        }),
    ])).flat().map((a) => a.content);
    if (
        address?.length && name &&
        ([DNSRecordType.A, DNSRecordType.AAAA].includes(
            packet.question[0]?.type,
        ))
    ) {
        const ipv4 = address.filter((a) => isIPv4(a));
        const ipv6 = address.filter((a) => isIPv6(a));
        const records: DNSConfig = {
            [name]: {
                ttl: get_ttl_min(),
                class: {
                    "IN": {
                        "A": ipv4.length ? ipv4 : null,
                        // TODO: Currently only A is returned as logic in dns_server shortcircuits the AAAA record.
                        "AAAA": ipv6.length ? ipv6 : null,
                        // "TXT": "This is some text.",
                    },
                },
            },
        } as DNSConfig;
        // console.log(records);
        return {
            success: true,
            result: new DNSServer(records).HandleRequest(data),
        };
    } else {
        return { success: false, result: null };
    }
}
