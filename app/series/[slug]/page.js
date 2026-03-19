"use client"
import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from "next/navigation"
import SearchBar from "@/components/search";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon, CopyIcon } from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader,  CardTitle } from "@/components/ui/card"

export default function Show () {
  const pathname = usePathname()
  const slug = pathname.replace(/^\/series\//, "")
  const slugText = decodeURIComponent(slug).replace("subfolder-", "").replace(".htm", "")
  const [show, setShow] = useState({})
  const [loading, setLoading] = useState(false)
  
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = 0
    }
  }, [])
  
  const fetchData = async () => {
    
    try {
      setLoading(true)
      const res = await fetch(`/api/series/${slug}`)
      const data = await res.json()
      setShow(data.show || {})
    } catch (err) {
      console.error(err)
      setShow({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(!slug) return
    fetchData()
  }, [slug])

  const { title, desc, running, genres, seasons } = show

  return(
    <div className="cnt">
      <SearchBar />
      <div className="w-full py-2 px-2 br-2">
        <div className="results">
          {loading ? (
            <Empty className="w-full bg-background">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-transparent">
                  <Spinner className="bg-none"/>
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
                  We couldn't extract the show {slugText} for you <br/>
                  Check your internet connection or try again later
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex w-full gap-2 px-2 flex-col">
              <span className="text-sm font-bold">{title}</span>
              <span>{desc}</span>
              <span>aired: {running}, seasons: {seasons?.length}</span>
              <span>genres: {genres?.join(", ")}</span>

              <Tabs defaultValue={seasons?.[0]?.link || ""} className="w-full">
                <TabsList ref={listRef} className="w-full overflow-x-auto no-scrollbar" variant="line">
                  {seasons?.map(({ title, link }) => (
                    <TabsTrigger key={link} value={link} className="whitespace-nowrap flex-shrink-0">
                      {title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {seasons?.map(({ title, link }) => (
                  <TabsContent key={link} value={link}>
                    <Card className="px-2">
                      <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="flex flex-col gap-2">
                <span className="font-bold lowercase">Title Here</span>
                <span className="lowercase">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis posuere sagittis risus a aliquet. Praesent nec semper tellus, sit amet mattis tellus. Donec ultrices, nisi vitae sollicitudin vulputate.</span>
                <span className="flex">mp4: 
                  <Button variant="outline" size="icon">
                    <CopyIcon />
                  </Button>
                  <Button asChild variant="outline" size="xs"><Link href="/">Download</Link></Button>
                </span>
              </div>
            )}
          </CardContent>

                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}