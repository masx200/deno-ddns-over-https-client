import ip from "npm:ip@2.0.1";

// const { isPrivate, isPublic } = ip;
export function isPrivate(a: string) {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    if (ip.cidrSubnet("100.64.0.0/10").contains(a)) {
        return true;
    }
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    return ip.isPrivate(a);
}
