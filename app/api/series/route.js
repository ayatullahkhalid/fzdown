import Scraper from "@/lib/scraper"

export async function GET(req) {
  try {
    const scraper = new Scraper()
    const results = await scraper.scrapeSeries()

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
    return Response.json({ results: [] }, { status: 500 })
  }
}
