"use client"
import React from "react"
import EmptyState from "./empty-state"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon } from "@phosphor-icons/react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function MediaState({
  loading,
  results,
  type,
  children,
  loadingTitle,
  loadingDesc,
  errorTitle,
  errorDesc,
  isSearch = false,
}) {
  return loading ? (
    <EmptyState isError={false} title={loadingTitle} desc={loadingDesc} />
  ) : !results?.length ? (
    <EmptyState isError={true} title={errorTitle} desc={errorDesc} />
  ) : isSearch ? (
    <ScrollArea className="[&>div]:max-h-[50vh] pt-4 flex !absolute z-49 bg-muted">
      <div className="w-full">
        {results.map(({ title, desc, link }) => (
          <React.Fragment key={link || i}>
            {typeof children === "function"
              ? children({ title, desc, link, type })
              : children}
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  ) : (
    <div className="flex">
      <div className="w-full">
        <div className="text-sm pl-2 pb-4">
          Latest {type === "series" ? "shows" : "movies"}
        </div>
        {results.map(({ title, desc, link }, i) => (
          <React.Fragment key={link || i}>
            {typeof children === "function"
              ? children({ title, desc, link, type })
              : children}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
