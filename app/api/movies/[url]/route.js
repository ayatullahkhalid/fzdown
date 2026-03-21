import Scraper from "@/lib/scraper"

export async function GET(req) {
  const url = new URL(req.url)

const pathname = url.pathname
const parts = pathname.split("/").filter(Boolean)

const movie = parts[2]

  if (!movie) {
    return Response.json({ results: [] })
  }

  try {
    const scraper = new Scraper()
    const results = await scraper.getMovie(movie)

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