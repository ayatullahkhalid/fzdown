import Scraper from "@/lib/scraper"

export async function GET(req) {
  const pathname = new URL(req.url).pathname
  const parts = pathname.split("/").filter(Boolean)
  const type = parts[2]
  const query = parts[3]
  

  if (!query) {
    return Response.json({ results: [], type, query })
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
    return Response.json({ results: [], type, query, err.message, err.stack }, { status: 500 })
  }
}
