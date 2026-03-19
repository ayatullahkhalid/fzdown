import Scraper from "@/lib/scraper"

export async function GET(req) {
  const url = new URL(req.url)
  const pathname = url.pathname
  const show = pathname.replace(/^\/api/series\//, "")
  
  if (!show) {
    return Response.json({ show: null })
  }

  try {
    const scraper = new Scraper()
    const result = await scraper.getShow(show)

    return Response.json({ show : result })
  } catch (err) {
    return Response.json({ message: err.message, stack: err.stack, url: show}, { status: 500 })
  }
}