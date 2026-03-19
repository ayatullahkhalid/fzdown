import Scraper from "@/lib/scraper"
import { usePathname } from "next/navigation"

export async function GET(req) {
  const pathname = usePathname()
  const show = pathname.replace(/^\/series\//, "")
  
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