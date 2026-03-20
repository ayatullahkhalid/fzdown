import Scraper from "@/lib/scraper"

export async function GET(req) {
  const { searchParams } = new URL(req.url)

  const query = searchParams.get("q")
  const type = searchParams.get("type") || "series"

  if (!query) {
    return Response.json({ results: [] })
  }

  try {
    const scraper = new Scraper()
    const results = await scraper.search(query, type)

    return Response.json(
      { results },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, max-age=86400, stale-while-revalidate=3600",
        },
      },
    )
  } catch (err) {
    console.error(err)
    return Response.json({ results: [] }, { status: 500 })
  }
}
