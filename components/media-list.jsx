"use client"
import React from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function MediaList({ title, desc, link, type }) {
  return (
    <div key={link} className="w-full px-2">
      <Link
        className="flex flex-col gap-2"
        href={`/${type}/${link}` || "/"}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="font-bold">{title}</span>
        <span>{desc}</span>
      </Link>

      <Separator className="my-4" />
    </div>
  )
}
