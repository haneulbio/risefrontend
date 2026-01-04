/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            { source: "/api/:path*", destination: "http://localhost:8080/api/:path*" },

            // demo도 쓰면 같이
            { source: "/demo/:path*", destination: "http://localhost:8080/demo/:path*" },
        ];
    },
};

module.exports = nextConfig;
