/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // 프론트에서 /api/* 호출하면 Vercel이 AWS로 프록시
            { source: "/api/:path*", destination: "http://52.79.120.146/api/:path*" },
            { source: "/demo/:path*", destination: "http://52.79.120.146/demo/:path*" },
        ];
    },
};

module.exports = nextConfig;