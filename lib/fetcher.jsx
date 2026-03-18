import { headers } from "next/headers"

export const fetchHtml = async (url) => {
  const headersList = await headers()
  const allHeaders = {}

  headersList.forEach((value, key) => {
    allHeaders[key] = value
  })

  console.log(allHeaders)

  const header = {
    "user-agent": headersList.get('user-agent') || "",
    "Accept-Language": headersList.get("accept-language") || "",
    "Accept": headersList.get("accept") || "",
    "Accept-Encoding": headersList.get("accept-encoding") || "",
    "Connection": headersList.get("connection") || "",

  }
  const res = await retryFetch(url, {headersList})
}

const retryFetch = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try{
      const res = await fetch(url, options)

      if (!res.ok) {
        throw new Error(`Status ${res.status}`)
      }

      return res
    } catch (err) {
      if (i === retries - 1) throw err

      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
