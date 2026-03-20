import Scraper from "@/lib/scraper"

export async function GET(req, { params }) {
  const { type, query } = params
  console.log(params)

  if (!query) {
    return Response.json({ params })
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
