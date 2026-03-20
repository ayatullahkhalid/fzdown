import * as cheerio from "cheerio"
import { headers } from "next/headers"
import pLimit from "p-limit"

export default class Scraper {
  constructor(clientHeaders, concurrency = 10) {
    this.clientHeaders = clientHeaders
    this.concurrency = concurrency
    this.baseSeriesURL = "https://tvseries.in"
    this.baseMoviesURL = "https://fzmovies.live"
    this.movieCookieJar = ""
    this.seriesCookieJar = ""
    this.series = "series"
    this.movies = "movies"
  }

  buildHeaders = async (referer = "") => {
    const headersList = await headers()

    this.clientHeaders = {
      "user-agent": headersList.get("user-agent") || "",
      "accept-language": headersList.get("accept-language") || "",
      accept: headersList.get("accept") || "",
      connection: headersList.get("connection") || "",
      referer: referer || "https://google.com",
      origin: referer ? new URL(referer).origin : "",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": referer ? "same-origin" : "cross-site",
    }

    return this.clientHeaders
  }

  makeUrl = (url, base) => new URL(url, base).href

  parseCookies = (cookieHeader, kind = this.movies) => {
    if (!cookieHeader) return
    const cookies = cookieHeader.split(/,\s*(?=[^=]+=(?!$))/)
    cookies.forEach((cookieStr) => {
      const parts = cookieStr.split(";").map((p) => p.trim())
      const cookiePair = parts[0]
      const jar = kind === this.movies ? "movieCookieJar" : "seriesCookieJar"
      const currentJar = this[jar]
      if (cookiePair && !currentJar.includes(cookiePair)) {
        this[jar] = currentJar + (currentJar ? "; " : "") + cookiePair
      }
    })
  }

  fetchUrl = async (url, kind = this.movies, retry = 3) => {
    const cookieJar =
      kind == this.movies ? this.movieCookieJar : this.seriesCookieJar

    for (let i = 0; i < retry; i++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const res = await fetch(url, {
          headers: { ...this.clientHeaders, cookie: cookieJar },
          cache: "no-store",
          signal: controller.signal,
        })

        const cookies = res.headers.get("set-cookie")

        if (kind == this.series) this.parseCookies(cookies, this.series)
        else this.parseCookies(cookies)

        clearTimeout(timeout)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return await res.text()
      } catch (err) {
        if (i === retry - 1) throw err
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }

  parseSeries = async ($, count = 20) => {
    const shows = []
    $(".mainbox3 > table")
      .parent(".mainbox3")
      .slice(0, count)
      .each((i, el) => {
        const title = $(el)
          .find("span a b")
          .first()
          .text()
          .trim()
          .replace("_", " ")
        const imgSrc = $(el).find("img").attr("src")
        const img = imgSrc ? this.makeUrl(imgSrc, this.baseSeriesURL) : null
        const desc = $(el).find("span small").last().text().trim()
        const link = $(el).find("span a").attr("href")

        if (!title || !desc) return
        shows.push({ title, link, img, desc })
      })
    return shows
  }

  parseMovies = async ($, count = 5) => {
    const movies = []
    $(".mainbox > table")
      .parent(".mainbox")
      .slice(0, count)
      .each((_, el) => {
        if (movies.length === count) return
        const title = $(el)
          .find("span a b")
          .first()
          .text()
          .trim()
          .replace("_", " ")
        const imgSrc = $(el).find("img").attr("src")
        const img = imgSrc ? this.makeUrl(imgSrc, this.baseMoviesURL) : null
        const link = $(el).find("a").attr("href")
        const tagDesc = $(el).find("span small").last()
        const desc = tagDesc
          .contents()
          .filter((_, node) => node.type === "text")
          .text()
          .trim()
        const tags = []
        tagDesc.find("div[id^='showmore_'] a").each((_, a) => {
          tags.push($(a).text().trim())
        })
        const imdb = $(el).find("span.imdbRatingPlugin").attr("data-title")

        if (!title || !desc) return
        movies.push({ title, img, link, desc, imdb, tags })
      })
    return movies
  }

  scrapeSeries = async () => {
    //await this.buildHeaders(this.baseSeriesURL)
    const html = await this.fetchUrl(
      this.makeUrl("/trending.php", this.baseSeriesURL),
    )
    const $ = cheerio.load(html)
    return this.parseSeries($)
  }

  scrapeMovies = async () => {
    //await this.buildHeaders(this.baseMoviesURL)
    const html = await this.fetchUrl(
      this.makeUrl("/movieslist.php", this.baseMoviesURL),
    )
    const $ = cheerio.load(html)
    return this.parseMovies($)
  }

  search = async (query, kind = this.series) => {
    const baseURL =
      kind === this.series ? this.baseSeriesURL : this.baseMoviesURL
    query = encodeURIComponent(query)
    const movieSearch = `csearch.php?searchname=${query}&Search=Search&searchby=Name&category=All&vsearch=`
    const seriesSearch = `search.php?search=${query}&beginsearch=Search&vsearch=&by=series`
    const searchQuery = kind === this.series ? seriesSearch : movieSearch

    const html = await this.fetchUrl(this.makeUrl(searchQuery, baseURL))
    const $ = cheerio.load(html)

    return kind === this.series
      ? this.parseSeries($, 20)
      : this.parseMovies($, 20)
  }

  getMovieFiles = async (url, referer) => {
    await this.buildHeaders(referer)
    url = url + "&pt=jRGarGzOo2"
    const fullUrl = this.makeUrl(url, this.baseMoviesURL)
    let html = await this.fetchUrl(fullUrl)
    let $ = cheerio.load(html)

    const downloadLink = $("a#downloadlink").first().attr("href")
    if (!downloadLink) return null

    html = await this.fetchUrl(this.makeUrl(downloadLink, this.baseMoviesURL))
    $ = cheerio.load(html)

    const directLink = $("p input").attr("value")
    return this.makeUrl(directLink, this.baseMoviesURL) || null
  }

  getMovie = async (url) => {
    await this.buildHeaders()
    const referer = this.makeUrl(url, this.baseMoviesURL)
    const html = await this.fetchUrl(referer)
    const $ = cheerio.load(html)

    const title = $(".moviename span").text().trim()
    const desc = $(".moviedesc textcolor1").text().trim()
    const runtime = $(".moviedesc textcolor2").first().text().trim()
    const releaseDate = $(".moviedesc meta").first().attr("content")
    const files = []
    const extq = []

    $(".moviesfiles li a#downloadoptionslink2").each((_, el) => {
      const link = this.makeUrl($(el).attr("href"), this.baseMoviesURL)
      const n = $(el).text().trim()
      const m = n.match(/(\d{3,4}p)\.(\w+)$/)
      if (m) {
        const qty = m[1]
        const ext = m[2]
        files.push({ link })
        extq.push({ qty, ext })
      }
    })

    const dlinks = await Promise.all(
      files.map((file) =>
        this.getMovieFiles(file.link, referer).catch(() => null),
      ),
    ).then((links) => links.filter(Boolean))

    return { title, desc, runtime, releaseDate, dlinks, extq }
  }

  getShow = async (url) => {
    //await this.buildHeaders();
    const referer = this.makeUrl(url, this.baseSeriesURL)
    const html = await this.fetchUrl(referer, this.series)
    const $ = cheerio.load(html)

    const title = $(".mainbox3 a small b").text().trim().replace("_", " ")
    let info = $(".mainbox3 span small").last()
    const textNodes = []
    const seasons = []
    info.contents().filter(function () {
      if (this.type === "text") textNodes.push($(this).text().trim())
    })
    const desc = textNodes[0] || ""
    const running = textNodes[1].replace(/[(),:_]/g, "").trim() || ""
    const genres =
      textNodes[2]
        .replace(":", "")
        ?.split(",")
        ?.map((g) => g.trim()) || ""
    const rating = textNodes[3].replace(":", "").trim() || ""

    $('[itemprop="containsSeason"] .mainbox2 a').each((_, el) => {
      const link = $(el).attr("href")
      const title = $(el).text().trim()
      seasons.push({ link, title })
    })

    return { title, desc, running, genres, seasons, html }
  }

  getEpisodeList = async (url) => {
    //await this.buildHeaders();
    const referer = this.makeUrl(url, this.baseSeriesURL)
    const html = await this.fetchUrl(referer, this.series)
    const $ = cheerio.load(html)
    const eps = []

    $(".mainbox > table")
      .parent(".mainbox")
      .each((_, el) => {
        const title =
          $(el)?.find("span b")?.text()?.replace(/_/g, " ")?.trim() || ""
        const link = $(el)?.find("span a")?.first()?.attr("href")
          ? this.makeUrl(
              $(el)?.find("span a")?.first()?.attr("href"),
              this.baseSeriesURL,
            )
          : ""
        const airing =
          $(el)
            ?.find("span i")
            ?.first()
            ?.text()
            ?.split(":")[1]
            ?.replace(/[(),:_]/g, "")
            .trim() || ""
        const desc =
          $(el)
            ?.find("small")
            .last()
            .contents()
            .filter((i, el) => el.type === "text" && $(el).text().trim())
            .first()
            ?.text()
            ?.trim() || ""
        const img = $(el)?.find("img")?.attr("src") || null

        eps.push({ title, desc, link, img, airing })
      })
    return eps
  }

  getEpisodeMp4 = async (url, referer) => {
    //await this.buildHeaders(referer);
    url = this.makeUrl(url + "&ftype=2", this.baseSeriesURL)

    let html = await this.fetchUrl(url, this.series)
    let $ = cheerio.load(html)

    const downloadLink = $(".mainbox3 a#dlink2").attr("href")
    html = await this.fetchUrl(
      this.makeUrl(downloadLink, this.baseSeriesURL),
      this.series,
    )
    $ = cheerio.load(html)

    const fileSize = $(".filedownload textcolor2").text().trim()
    if (!fileSize) return null
    const dLink = $(".downloadlinks2 p input").attr("value")

    return {
      url: dLink,
      size: fileSize,
    }
  }

  getEpisodeWebm = async (url, referer) => {
    //await this.buildHeaders(referer);
    url = this.makeUrl(url + "&ftype=3", this.baseSeriesURL)

    let html = await this.fetchUrl(url, this.series)
    let $ = cheerio.load(html)

    const downloadLink = $(".mainbox3 a#dlink2").attr("href")

    html = await this.fetchUrl(
      this.makeUrl(downloadLink, this.baseSeriesURL),
      this.series,
    )
    $ = cheerio.load(html)

    const fileSize = $(".filedownload textcolor2").text().trim()
    if (!fileSize) return null
    const dLink = $(".downloadlinks2 p input").attr("value")

    return {
      url: dLink,
      size: fileSize,
    }
  }

  getEpisodeAvi = async (url, referer) => {
    //await this.buildHeaders(referer);
    url = this.makeUrl(u, this.baseSeriesURL)

    let html = await this.fetchUrl(url, this.series)
    let $ = cheerio.load(html)

    const downloadLink = $(".mainbox3 a#dlink2").attr("href")

    html = await this.fetchUrl(
      this.makeUrl(downloadLink, this.baseSeriesURL),
      this.series,
    )
    $ = cheerio.load(html)

    const fileSize = $(".filedownload textcolor2").text().trim()
    if (!fileSize) return null
    const dLink = $(".downloadlinks2 p input").attr("value")

    return {
      url: dLink,
      size: fileSize,
    }
  }

  getEpisodes = async (episodes, referer, start = 1, end = 5) => {
    const count = episodes.length
    const slicedEpisodes = episodes.slice(start - 1, end)
    const limit = pLimit(3)

    const results = await Promise.all(
      slicedEpisodes.map((episode) =>
        limit(async () => {
          const [mp4Res, webmRes] = await Promise.allSettled([
            this.getEpisodeMp4(episode.link, referer),
            this.getEpisodeWebm(episode.link, referer),
          ])

          let mp4 = mp4Res.status === "fulfilled" ? mp4Res.value : null
          let webm = webmRes.status === "fulfilled" ? webmRes.value : null
          let avi = null

          if (!mp4 && !webm) {
            try {
              avi = await this.getEpisodeAvi(episode.link, referer)
            } catch (err) {
              avi = null
            }
          }

          return {
            ...episode,
            mp4,
            webm,
            avi,
          }
        }),
      ),
    )

    return { results, count }
  }
}
