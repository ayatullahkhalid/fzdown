"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import Link from "next/link"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty"
import { Spinner } from "./ui/spinner"

const SearchBar = () => {
  const path = usePathname()
  const isSeries = path.includes("/series")
  const isMovie = path.includes("/movies")
  const searchType = isSeries ? "series" : "movies"
  const placeholder = `Search ${searchType}`

  const [query, setQuery] = useState("")
  const [debQuery, setDebQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)

  const showResults = isFocused && (query.length > 0 || loading)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebQuery(query)
    }, 500)

    return () => clearTimeout(timeout)
  }, [query])

  const [results, setResults] = useState([])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
  if (!debQuery) return

  const fetchData = async () => {
    try {
      setLoading(true)

      if (isSeries || isMovie) {
        const res = await fetch(`/api/search?q=${debQuery}&type=${searchType}`)
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [debQuery, isSeries, isMovie])
  
  return (
    <div ref={containerRef} className="w-full py-4 px-2 br-2">
      <InputGroup>
        <InputGroupInput id="search" placeholder={placeholder} value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)} />
        <InputGroupAddon align="inline-end">
          <MagnifyingGlassIcon />
        </InputGroupAddon>
      </InputGroup>
      {showResults &&  (
        <div className="results relative ">
          {loading ? (
            <Empty className="w-full !absolute z-49 bg-muted">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-transparent">
                  <Spinner className="bg-none"/>
                </EmptyMedia>
                <EmptyTitle>Processing your request</EmptyTitle>
                <EmptyDescription>
                  Please wait while we process your request. Do not refresh the page.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : debQuery && results.length === 0 ? (
              <Empty className="w-full !absolute z-49 bg-muted">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-transparent">
                    <XCircleIcon />
                  </EmptyMedia>
                  <EmptyTitle>No results found</EmptyTitle>
                  <EmptyDescription>
                    We couldnt find any results for {debQuery} <br/>
                    Check your internet connection or try again later
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
          ) : (
            <ScrollArea className="[&>div]:max-h-[50vh] pt-4 flex !absolute z-49 bg-muted">
              <div className="w-full">
                {results.map(({ title, desc, link }) => (
                  <div key={link} className="w-full px-2">
                    <Link className="flex flex-col gap-2" href={`/${searchType}/${link}` || "/"}
                      onMouseDown={(e) => e.preventDefault()}>
                      <span className="font-bold">{title}</span>
                      <span>{desc}</span>
                    </Link>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar