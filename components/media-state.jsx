"use client"
import React from "react"
import  EmptyState from "./empty-state"
import { Spinner } from "@/components/ui/spinner"
import { XCircleIcon } from "@phosphor-icons/react"

export default function MediaState({
  loading,
  results,
  type,
  children,
  loadingTitle,
  loadingDesc,
  errorTitle,
  errorDesc,
}) {
  return loading ? (
    <EmptyState isError={false} title={loadingTitle} desc={loadingDesc} />
  ) : !results?.length ? (
    <EmptyState isError={true} title={errorTitle} desc={errorDesc} />
  ) : (
    <div className="flex">
      <div className="w-full">
        <div className="text-sm pl-2 pb-4">
          Latest {type === "series" ? "shows" : "movies"}
        </div>
        {results.map((m, i) => (
          <React.Fragment key={m.link || i}>
            {typeof children === "function" ? children(m) : children}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
