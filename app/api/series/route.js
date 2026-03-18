import Scraper from "@/lib/scraper"

export async function GET(req) {
  try {
    const scraper = new Scraper()
    const results = await scraper.scrapeSeries()

    return Response.json({ results })
  } catch (err) {
    return Response.json({ results: [] }, { status: 500 })
  }
}