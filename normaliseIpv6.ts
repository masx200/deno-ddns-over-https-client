/**
 * Normalise a IPv6 address so that `::` are replaced with zeros.
 */

export function normaliseIpv6(ipv6: string): string {
    if (ipv6.indexOf("::") < 0) return ipv6;

    // Use :: as the pivot and split into left and right.
    const parts = ipv6.split("::");
    const leftParts = parts[0].length === 0 ? [] : parts[0].split(":");
    const rightParts = parts[1].length === 0 ? [] : parts[1].split(":");

    // Work out how many zero-groups were collapsed in :: by counting length of
    // the left and right parts, then create the missing groups.
    const missingZeros = 8 - (leftParts.length + rightParts.length);
    const newZeros = [];
    for (let i = 0; i < missingZeros; i++) {
        newZeros.push("0");
    }
    return [...leftParts, ...newZeros, ...rightParts].join(":");
}
