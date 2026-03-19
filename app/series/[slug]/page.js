"use client"
import React, { useEffect, useState } from 'react'
import { usePathname } from "next/navigation"
import SearchBar from "@/components/search";
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon } from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Show ({ params }) {
  const pathname = usePathname()
  const slug = pathname.replace(/^\/series\//, "")
  const slugText = decodeURIComponent(slug).replace("subfolder-", "").replace(".htm", "")
  const [show, setShow] = useState({})
  const [loading, setLoading] = useState(false)
  
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
  }, [])

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
                <TabsList className="w-full overflow-x-auto no-scrollbar" variant="line">
                  {seasons?.map(({ title, link }) => (
                    <TabsTrigger key={link} value={link} className="whitespace-nowrap flex-shrink-0">
                      {title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}