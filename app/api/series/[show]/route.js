import Scraper from "@/lib/scraper"

export async function GET(req, {params}) {
  const { show } = params
  
  if (!show) {
    return Response.json({ show: null })
  }

  try {
    const scraper = new Scraper()
    const result = await scraper.getShow(show)

    return Response.json({ show : result })
  } catch (err) {
    return Response.json({ show: [] }, { status: 500 })
  }
}