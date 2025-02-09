import ip from "npm:ip@2.0.1";


export function isPrivate(a: string) {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    if (ip.default.cidrSubnet("100.64.0.0/10").contains(a)) {
        return true;
    }
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    return ip.default.isPrivate(a);
}
