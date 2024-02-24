import { isPrivate } from "./isPrivate.ts";

export function isPublic(a: string) {
    return !isPrivate(a);
}
