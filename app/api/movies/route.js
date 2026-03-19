import Scraper from "@/lib/scraper"

export async function GET(req) {
  try {
    const scraper = new Scraper()
    const results = await scraper.scrapeMovies()

    return Response.json({ results })
  } catch (err) {
      console.error("Error: ", err)
    return Response.json({ results: [] }, { status: 500 })
  }
}