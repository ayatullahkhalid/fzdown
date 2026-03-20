"use client"
import React, { useEffect, useState, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import SearchBar from "@/components/search"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon, CopyIcon } from "@phosphor-icons/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Show() {
  const pathname = usePathname()
  const slug = pathname.replace(/^\/series\//, "")
  const slugText = decodeURIComponent(slug)
    .replace("subfolder-", "")
    .replace(".htm", "")
  const [show, setShow] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("")
  const [episodesMap, setEpisodesMap] = useState({})
  const [loadingTab, setLoadingTab] = useState(null)

  const listRef = useRef(null)
  const episodesRef = useRef({}) // Track current episodesMap

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/series/${slug}`)
      const data = await res.json()
      setShow(data.show || {})
    } catch (err) {
      setShow({})
    } finally {
      setLoading(false)
    }
  }

  const fetchEpisodes = useCallback(async (link, loadMore = false) => {
    const PAGE_SIZE = 5
    setLoadingTab(link)
    
    setEpisodesMap(prev => {
      const current = prev[link] || { episodes: [], start: 1, hasMore: true, loading: false }
      if (current.loading) return prev
      return { ...prev, [link]: { ...current, loading: true } }
    })

    const currentData = episodesRef.current[link] || { episodes: [] }
    const start = loadMore ? currentData.episodes.length + 1 : 1
    const end = start + PAGE_SIZE - 1

    try {
      const res = await fetch(`/api/series/${slug}/${link}?start=${start}&end=${end}`)
      console.log(`/api/series/${slug}/${link}?start=${start}&end=${end}`)
      const data = await res.json()

      setEpisodesMap(prev => {
        const existing = prev[link]?.episodes || []
        const newEpisodes = loadMore ? [...existing, ...data.eps] : data.eps
        const updated = {
          ...prev,
          [link]: {
            episodes: newEpisodes,
            start: newEpisodes.length + 1,
            hasMore: newEpisodes.length < data.count,
            loading: false,
          },
        }
        episodesRef.current = updated // Sync ref
        return updated
      })
    } catch (err) {
      console.error(err)
      setEpisodesMap(prev => ({
        ...prev,
        [link]: { ...prev[link], loading: false },
      }))
    } finally {
      setLoadingTab(null)
    }
  }, [slug]) // Stable deps

  // Sync episodesRef with episodesMap
  useEffect(() => {
    episodesRef.current = episodesMap
  }, [episodesMap])

  // Fetch show data
  useEffect(() => {
    if (!slug) return
    fetchData()
  }, [slug])

  // Set initial tab and fetch episodes
  useEffect(() => {
    if (show?.seasons?.length && !activeTab) {
      const firstLink = show.seasons[0].link
      setActiveTab(firstLink)
      fetchEpisodes(firstLink)
    }
  }, [show])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = 0
    }
  }, [])

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
  }

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    if (!episodesRef.current[newTab]?.episodes?.length) {
      fetchEpisodes(newTab)
    }
  }

  const { title, desc, running, genres, seasons } = show

  return (
    <div className="cnt">
      <SearchBar />
      <div className="w-full py-2 px-2 br-2">
        <div className="results">
          {loading ? (
            <Empty className="w-full bg-background">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-transparent">
                  <Spinner className="bg-none" />
                </EmptyMedia>
                <EmptyTitle>Loading {slugText}</EmptyTitle>
                <EmptyDescription>
                  We'll get the data for you in a jiffy
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : !show.title ? (
            <Empty className="w-full bg-background">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-transparent">
                  <XCircleIcon />
                </EmptyMedia>
                <EmptyTitle>A problem occurred</EmptyTitle>
                <EmptyDescription>
                  We couldn't extract the show {slugText} for you <br />
                  Check your internet connection or try again later
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex w-full gap-2 px-2 flex-col">
              <span className="text-sm font-bold">{title}</span>
              <span>{desc}</span>
              <span>
                aired: {running}, seasons: {seasons?.length}
              </span>
              <span>genres: {genres?.join(", ")}</span>

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList
                  ref={listRef}
                  className="w-full overflow-x-auto no-scrollbar"
                  variant="line"
                >
                  {seasons?.map(({ title: seasonTitle, link }) => (
                    <TabsTrigger
                      key={link}
                      value={link}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      {seasonTitle}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {seasons?.map(({ title: seasonTitle, link }) => (
                  <TabsContent key={link} value={link}>
                    <Card className="px-2">
                      <CardContent className="flex flex-col gap-2 p-4">
                        {(() => {
                          const tabData = episodesMap[link]
                          const isLoading = loadingTab === link

                          if (isLoading && !tabData?.episodes?.length) {
                            return (
                              <Empty className="w-full bg-background">
                                <EmptyHeader>
                                  <EmptyMedia variant="icon">
                                    <Spinner />
                                  </EmptyMedia>
                                  <EmptyTitle>Loading episodes...</EmptyTitle>
                                  <EmptyDescription>
                                    We'll get the files for you in a jiffy,
                                    please dont refresh this page
                                  </EmptyDescription>
                                </EmptyHeader>
                              </Empty>
                            )
                          }

                          if (!tabData?.episodes?.length && !isLoading) {
                            return (
                              <Empty className="w-full bg-background">
                                <EmptyHeader>
                                  <EmptyMedia variant="icon">
                                    <XCircleIcon />
                                  </EmptyMedia>
                                  <EmptyTitle>No episodes found</EmptyTitle>
                                  <EmptyDescription>
                                    We couldn't extract episodes for this season.
                                  </EmptyDescription>
                                </EmptyHeader>
                              </Empty>
                            )
                          }

                          return tabData?.episodes?.map(
                            ({ title, desc, mp4, webm }, i) => (
                              <div
                                key={`${link}-${i}`} // Better key using link + index
                                className="flex flex-col gap-2 p-3 border rounded"
                              >
                                <span className="font-bold lowercase">
                                  {title}
                                </span>
                                <span className="lowercase">{desc}</span>
                                <div className="flex gap-2 flex-wrap items-center">
                                  <span>mp4 ({mp4?.size})</span>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => copyToClipboard(mp4?.url)}
                                  >
                                    <CopyIcon />
                                  </Button>
                                  <Button asChild variant="outline" size="xs">
                                    <Link href={mp4?.url}>Download</Link>
                                  </Button>

                                  <span>webm ({webm?.size})</span>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => copyToClipboard(webm?.url)}
                                  >
                                    <CopyIcon />
                                  </Button>
                                  <Button asChild variant="outline" size="xs">
                                    <Link href={webm?.url}>Download</Link>
                                  </Button>
                                </div>
                              </div>
                            ),
                          )
                        })()}
                        {episodesMap[link]?.hasMore && (
                          <Button
                            onClick={() => fetchEpisodes(link, true)}
                            disabled={episodesMap[link]?.loading}
                          >
                            {episodesMap[link]?.loading
                              ? "Loading..."
                              : "Load More"}
                          </Button>
                        )}
                      </CardContent>
                      <Separator />
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
