"use client"
import React, { useEffect, useState } from 'react'
import { usePathname } from "next/navigation"
import SearchBar from "@/components/search";
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon } from '@phosphor-icons/react';

export default function Show ({ params }) {
  const pathname = usePathname()
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
    if(!pathname) return
    let slug = decodeURIComponent(pathname.replace(/^\/series\//, ""))
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
                <EmptyTitle>Loading {pathname}</EmptyTitle>
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
                  We couldn't extract the show {slug} for you <br/>
                  Check your internet connection or try again later {pathname}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex w-full gap-2 px-2 flex-col">
              <span className="text-sm font-bold">{title}</span>
              <span>{desc}</span>
              <span>aired: {running}, seasons: {seasons?.length}</span>
              <span>genres: {genres?.join(", ")}</span>
              <div className="flex flex-col gap-2 pl-2">
                <span className="font-bold">Seasons</span>
                {seasons?.map(({ title, link }) => (
                  <Link key={link} href={`/series/${slug}/${link}`}>
                    {title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}