import parse from "@masx200/mini-cli-args-parser";
import { assert } from "https://deno.land/std@0.217.0/assert/assert.ts";
import { helptext } from "./helptext.ts";
import { IPADDRESSLOOKUPURLdefault } from "./IPADDRESSLOOKUPURLdefault.ts";
import { run_ddns_interval_client } from "./run_ddns_interval_client.ts";

export async function main() {
    const opts = parse(Deno.args);

    console.log(opts);

    if (
        Deno.args.length === 0 ||
        !opts.token ||
        !opts.name ||
        !opts.service_url
    ) {
        console.log(helptext);

        throw Error("缺少必须的参数: token /name/ service_url");
    }

    const ipv4 = Boolean(opts.ipv4 ? opts.ipv4 === "true" : true);

    const interfaces: boolean | string[] = opts.interfaces
        ? opts.interfaces === "true"
            ? true
            : opts.interfaces === "false"
            ? false
            : String(opts.interfaces)?.split(",")
        : false;
    const ipv6 = Boolean(opts.ipv6 ? opts.ipv6 === "true" : true);
    const private_param = Boolean(
        opts.private ? opts.private === "true" : false,
    );

    const interval = Number(opts.interval || 30 * 1000);

    assert(Number.isFinite(interval), "interval 必须是数字");

    if (!ipv4 && !ipv6) {
        throw new Error("ipv4 and ipv6 must be true or false");
    }
    const get_ip_url: string[] = typeof opts.get_ip_url == "string"
        ? opts.get_ip_url === "false" ? [] : (
            String(opts.get_ip_url)?.split(",") ??
                IPADDRESSLOOKUPURLdefault
        ).filter(Boolean)
        : IPADDRESSLOOKUPURLdefault;
    const tailscale = Boolean(
        opts.tailscale ? opts.tailscale === "true" : false,
    );
    const public_param = Boolean(opts.public ? opts.public === "true" : true);
    /*  const stop = */ await run_ddns_interval_client({
        interval: interval,
        get_ip_url,
        ipv4: ipv4,
        private: private_param,
        interfaces,
        ipv6: ipv6,

        tailscale: tailscale,

        public: public_param,

        token: String(opts.token ?? "token"),

        name: (String(opts.name)?.split(",") ?? ["name"]).map((name) =>
            name.trim()
        ),

        service_url: String(opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX"),
    });
}
