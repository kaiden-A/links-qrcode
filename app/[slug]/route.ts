const API_BASE = "https://api.motionukict.com/api/v1/link-shorterner";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const response = await fetch(`${API_BASE}/r/${slug}`);

    if (!response.ok) {
      return Response.json({ error: "Link not found on backend" }, { status: response.status });
    }

    // 1. Added `await` to properly parse the JSON body
    const data = await response.json();
    console.log("Backend response data:", data);

    // 2. Extract the destination URL directly from the JSON object
    const destination = data.destination_url;

    if (destination) {
      // Response.redirect requires a valid absolute URL string
      return Response.redirect(destination, 302);
    }
    
  } catch (error) {
    console.error("Failed to fetch short link:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  // Fallback if destination_url wasn't found in the payload
  return Response.json({ error: "Not found", slug }, { status: 404 });
}