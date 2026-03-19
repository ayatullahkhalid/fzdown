"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import React from "react"

const formatName = (path) => {
  return decodeURIComponent(path)
    .replace(/subfolder-|files-/g, "")
    .replace(/\.htm$/i, "")
    .replace(/-/g, " ")
    .trim()
}

const BreadcrumbMain = () => {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(path => path.length > 0)
  const bc = [{name: "home", href: "/"}]
  let href = ""
  
  paths.forEach((path) => {
    href += `/${path}`
    bc.push({
      name: formatName(path),
      href: href,
    })
  })

  return (
    <Breadcrumb className="px-2 pt-2">
      <BreadcrumbList>
        {bc.map((b, i) => (
          i === bc.length - 1 ? (
            <BreadcrumbItem key={b.href}>
              <BreadcrumbPage>{b.name}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <React.Fragment key={b.href}>
              <BreadcrumbItem>
                <BreadcrumbLink href={b.href}>{b.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          )
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbMain
