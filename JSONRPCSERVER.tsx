// deno-lint-ignore-file no-explicit-any

import { JsonRpcRequest } from "./JsonRpcRequest.ts";

/**
 * JSON RPC服务器
 * @param data - JSON RPC请求数据
 * @param services - JSON RPC服务对象
 * @returns JSON RPC响应数据
 */
export async function JSONRPCSERVER<
    T extends Record<any, (...args: any) => any> = any,
>(
    data: JsonRpcRequest<any> | JsonRpcRequest<any>[],
    services: T,
): Promise<any> {
    if (Array.isArray(data)) {
        if (!data.length) {
            return {
                "jsonrpc": "2.0",
                "error": { "code": -32600, "message": "Invalid Request" },
                "id": null,
            };
        }
        return await Promise.all(data.map(async (item) => {
            return await JSONRPCSERVER(item, services);
        }));
    } else if (isObject(data)) {
        const { method, id, jsonrpc, params } = data;
        if ("2.0" !== jsonrpc) {
            return {
                "jsonrpc": "2.0",
                "error": { "code": -32600, "message": "Invalid Request" },
                "id": id,
            };
        }
        try {
            const fn = Reflect.get(services, method);
            if (!fn) {
                return {
                    "jsonrpc": "2.0",
                    "error": { "code": -32601, "message": "Method not found" },
                    "id": id,
                };
            }
            const result = await Reflect.apply(
                fn,
                services,
                params ? params : [],
            );
            return { result, id, "jsonrpc": "2.0" };
        } catch (error) {
            console.error(error);
            return {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32603,
                    "message": "Internal error\n" + String(error),
                },
                "id": id,
            };
        }
    } else {
        return {
            "jsonrpc": "2.0",
            "error": { "code": -32600, "message": "Invalid Request" },
            "id": null,
        };
    }
}
/**
 * 判断数据是否为对象
 * @param data - 待判断的数据
 * @returns 如果数据为对象则返回true,否则返回false
 */
export function isObject(data: any) {
    return "[object Object]" === Object.prototype.toString.call(data);
}
