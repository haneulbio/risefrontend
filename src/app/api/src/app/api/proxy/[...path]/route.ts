import { NextResponse } from "next/server";

export const runtime = "nodejs"; // (기본 node지만 명시해두면 안전)

const UPSTREAM = process.env.UPSTREAM_ORIGIN;

function copyHeaders(req: Request) {
    const headers = new Headers(req.headers);

    // hop-by-hop / 문제될 수 있는 헤더 제거
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    // upstream이 gzip 등 해도 Vercel이 처리하므로 없어도 됨
    // headers.delete("accept-encoding");

    return headers;
}

async function handler(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
    if (!UPSTREAM) {
        return NextResponse.json({ error: "UPSTREAM_ORIGIN is not set" }, { status: 500 });
    }

    const { path } = await ctx.params;

    // /api/proxy/<...>  ->  http://52.79.../<...>
    // 네 백엔드가 /api/... 로 시작하니까 프론트는 /api/proxy/api/... 형태로 부르면 됨
    const upstreamPath = "/" + path.join("/");
    const url = new URL(upstreamPath, UPSTREAM);

    // querystring 유지
    const inUrl = new URL(req.url);
    inUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

    const method = req.method.toUpperCase();
    const headers = copyHeaders(req);

    // body는 GET/HEAD 제외하고 전달
    const body =
        method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

    const upstreamRes = await fetch(url.toString(), {
        method,
        headers,
        body,
        redirect: "manual",
    });

    // 응답 헤더 복사 (Set-Cookie 포함)
    const resHeaders = new Headers(upstreamRes.headers);

    // 보안상/호환상 정리
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");

    // 쿠키를 HTTPS에서 쓰려면 Secure 필요. upstream이 Secure 안 붙이면 브라우저가 안 저장함.
    // 그래서 Set-Cookie를 가공해서 Secure; SameSite=None 을 붙여주는 걸 추천.
    const setCookie = upstreamRes.headers.get("set-cookie");
    if (setCookie) {
        // 단일 set-cookie만 get 되는 환경도 있어. multiple이면 아래 방식이 완벽하진 않지만 실전에서 종종 충분함.
        // 확실히 하려면 headers.getSetCookie()가 있는 런타임이면 그걸 쓰는 게 베스트.
        let patched = setCookie;

        // Secure 추가 (없을 때)
        if (!/;\s*Secure/i.test(patched)) patched += "; Secure";

        // SameSite=None 추가/교체 (크로스사이트 쿠키 필요하면)
        // (Vercel 도메인과 upstream이 다르므로 쿠키 기반 세션이면 보통 필요)
        if (/;\s*SameSite=/i.test(patched)) {
            patched = patched.replace(/;\s*SameSite=[^;]*/i, "; SameSite=None");
        } else {
            patched += "; SameSite=None";
        }

        resHeaders.set("set-cookie", patched);
    }

    const resBody = await upstreamRes.arrayBuffer();

    return new NextResponse(resBody, {
        status: upstreamRes.status,
        headers: resHeaders,
    });
}

export async function GET(req: Request, ctx: any) { return handler(req, ctx); }
export async function POST(req: Request, ctx: any) { return handler(req, ctx); }
export async function PUT(req: Request, ctx: any) { return handler(req, ctx); }
export async function PATCH(req: Request, ctx: any) { return handler(req, ctx); }
export async function DELETE(req: Request, ctx: any) { return handler(req, ctx); }
export async function OPTIONS(req: Request, ctx: any) { return handler(req, ctx); }
