import ip from "https://esm.sh/ip@2.0.1/";

// const { isPrivate, isPublic } = ip;
export function isPrivate(a: string) {
    if (ip.cidrSubnet("100.64.0.0/10").contains(a)) {
        return true;
    }
    return ip.isPrivate(a);
}
