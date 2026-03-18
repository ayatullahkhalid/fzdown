"use client"
import React from 'react'
import SearchBar from "@/components/search";
import { useEffect, useState } from "react"
import { ScrollArea} from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon } from '@phosphor-icons/react';

export default function Movies () {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/movies`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return(
    <div className="cnt">
     <SearchBar />
      <div className="w-full py-2 px-2 br-2">
        <div className="results">
          {loading ? (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-transparent">
                  <Spinner className="bg-none"/>
                </EmptyMedia>
                <EmptyTitle>Loading Movies</EmptyTitle>
                <EmptyDescription>
                  We'll get them for you in a jiffy
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : results.length === 0 ? (
              <Empty className="w-full bg-background">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-transparent">
                    <XCircleIcon />
                  </EmptyMedia>
                  <EmptyTitle>A problem occurred</EmptyTitle>
                  <EmptyDescription>
                    We couldnt find any movie for you <br/>
                    Check your internet connection or try again later
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
          ) : (
            <div className="flex">
              <div className="w-full">
                <div className="text-sm pl-2 pb-4">Latest Movies</div>
                {results.map(({ title, desc, link }) => (
                  <div key={link} className="w-full px-2">
                    <Link className="flex flex-col gap-2" href={`movies/${link}` || "/"}
                      onMouseDown={(e) => e.preventDefault()}>
                      <span className="font-bold">{title}</span>
                      <span>{desc}</span>
                    </Link>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}