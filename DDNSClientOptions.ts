/**
 * DDNS客户端选项接口
 */
export interface DDNSClientOptions {
    /**
     * 更新间隔时间（单位：秒）
     */
    interval: number;
    /**
     * 是否启用IPv4
     */
    ipv4: boolean;
    /**
     * 是否启用IPv6
     */
    ipv6: boolean;
    /**
     * 是否启用Tailscale
     */
    tailscale: boolean;
    /**
     * 是否启用公共IP
     */
    public: boolean;
    /**
     * 获取IP地址的URL地址列表
     */
    get_ip_url: string[];
    /**
     * 是否启用私有IP
     */
    private: boolean;
    /**
     * 接口列表或接口名称列表
     */
    interfaces: boolean | string[];
    /**
     * DDNS服务令牌
     */
    token: string;
    /**
     * DDNS服务名称
     */
    name: string[];
    /**
     * DDNS服务URL地址
     */
    service_url: string;
}
