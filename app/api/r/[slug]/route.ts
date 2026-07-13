const API_BASE = "https://api.motionukict.com/api/v1/link-shorterner";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE}/r/${slug}`, { redirect: "manual" });

  const location = res.headers.get("location");
  if (location && res.status === 302) {
    return Response.redirect(location, 302);
  }

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
