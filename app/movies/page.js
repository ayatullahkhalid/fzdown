"use client"
import React from "react"
import SearchBar from "@/components/search"
import { useEffect, useState } from "react"
import MediaState from "@/components/media-state"
import MediaList from "@/components/media-list"

export default function Movies() {
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
  return (
    <div className="cnt">
      <SearchBar />
      <div className="w-full py-2 px-2 br-2">
        <div className="results">
          <MediaState
            loading={loading}
            results={results}
            type="movies"
            loadingTitle="Loading Movies"
            loadingDesc={`We'll get them for you in a jiffy`}
            errorTitle="A problem occurred"
            errorDesc={
              <>
                We couldnt find any shows for you <br />
                Check your internet connection or try again later
              </>
            }
          >
            {({ title, desc, link, type }) => (
              <MediaList title={title} desc={desc} link={link} type={type} />
            )}
          </MediaState>
        </div>
      </div>
    </div>
  )
}
