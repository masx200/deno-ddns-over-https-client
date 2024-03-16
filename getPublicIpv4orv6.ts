import { isIPv6 } from "https://deno.land/std@0.143.0/node/internal/net.ts";
import { isIPv4 } from "https://deno.land/std@0.169.0/node/internal/net.ts";
import { assert } from "https://deno.land/std@0.217.0/assert/assert.ts";
import { check_response_ok } from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/check_response_ok.ts";
/**
 * 异步获取公共IPv4或IPv6地址
 * @param get_ip_url 用于获取IP地址的URL字符串
 * @returns 返回一个字符串Promise，该字符串为解析出的IPv4或IPv6地址
 */
export async function getPublicIpv4orv6(get_ip_url: string): Promise<string> {
    const request = new Request(get_ip_url);
    console.log({ request });
    const response = await fetch(request);
    console.log({ response, request });
    await check_response_ok(response);
    const text = (await response.text()).trim();
    assert(
        isIPv4(text) || isIPv6(text),
        "isIPv4orv6" + "\n" + get_ip_url + "\n" + text,
    );

    console.log({ get_ip_url, ip_address: text });
    return text;
}
