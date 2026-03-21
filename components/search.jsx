"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

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
          const res = await fetch(`/api/search/${searchType}/${debQuery}`)
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
        <InputGroupInput
          id="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        <InputGroupAddon align="inline-end">
          <MagnifyingGlassIcon />
        </InputGroupAddon>
      </InputGroup>
      {showResults && (
        <div className="results relative ">
          <MediaState
            loading={loading}
            results={results}
            type={searchType}
            isSearch={true}
            loadingTitle="Processing your request"
            loadingDesc="Please wait while we process your request. Do not refresh the page."
            errorTitle="No results found"
            errorDesc={
              <>
                We couldnt find any results for {debQuery} <br />
                Check your internet connection or try again later
              </>
            }
          >
            {({ title, desc, link, type }) => (
              <MediaList title={title} desc={desc} link={link} type={type} />
            )}
          </MediaState>
          )
        </div>
      )}
    </div>
  )
}

export default SearchBar
