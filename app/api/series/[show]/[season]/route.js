import Scraper from "@/lib/scraper"

export async function GET(req) {
  const url = new URL(req.url)

const pathname = url.pathname
const parts = pathname.split("/").filter(Boolean)

const season = parts[3]

const start = url.searchParams.get("start")
const end = url.searchParams.get("end")
  
  if (!season) {
    return Response.json({ eps: null })
  }

  try {
    const scraper = new Scraper()
    const result = await scraper.getEpisodes(await scraper.getEpisodeList(season), scraper.baseSeriesURL, start, end)
    
    return Response.json({ eps : result }, count: count)
  } catch (err) {
    return Response.json({ message: err.message, stack: err.stack, url: show}, { status: 500 })
  }
}