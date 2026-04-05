const BRAND_LOGO_URL =
  "https://scontent-lhr8-2.cdninstagram.com/v/t51.2885-19/72435197_546724839415422_3231847368504639488_n.jpg";

export async function GET() {
  const response = await fetch(BRAND_LOGO_URL, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return new Response("Logo unavailable", { status: 502 });
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const body = await response.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
