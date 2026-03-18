
"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Film, Tv, Search } from "lucide-react"
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

const navItems = [
  {icon: House, href: "/", label: "Home"},
  {icon: Film, href: "/movies", label: "Movies"},
  {icon: Tv, href: "/series", label: "Series"},
]

export default BottomNav = () => {
  const pathname = usePathname()
  return (
    <Tabs value={pathname} className="fixed bottom-0 left-0 z-50 w-full md:hidden border-t bg-background">
      <TabsList className="grid w-full grid-cols-4 p-0 m-0 h-auto rounded-none">
        {navItems.map(({icon: Icon, href, label})=>{
          <TabsTrigger key={href} value={href} asChild className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-3 py-2 md:py-0">
            <Link className="flex flex-col items-center gap-1 p-2">
              <Icon className="h-5 w-5"></Icon>
              <span className="text-xs">{label}</span>
            </Link>
          </TabsTrigger>
        })}
      </TabsList>
    </Tabs>
  )
}