import { isIPv6 } from "https://deno.land/std@0.143.0/node/internal/net.ts";
import { isIPv4 } from "https://deno.land/std@0.169.0/node/internal/net.ts";
import { assert } from "https://deno.land/std@0.217.0/assert/assert.ts";
import { check_response_ok } from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/check_response_ok.ts";

export async function getPublicIpv4orv6(get_ip_url: string): Promise<string> {
    const request = new Request(get_ip_url);
    console.log({ request });
    const response = await fetch(request);
    console.log({ response, request });
    await check_response_ok(response);
    const text = await response.text();
    assert(isIPv4(text) || isIPv6(text), "isIPv4orv6");
    return text;
}
