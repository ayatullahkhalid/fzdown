"use client"
import React from "react"
import { NavigationMenu, NavigationMenuItem } from "./ui/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
    {label: "home", href: "/",},
    {label: "series", href: "/series",},
    {label: "movies", href: "/movies",},
]
const Menu = () => {
  const path = usePathname() 
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background">
      <NavigationMenu className="flex gap-2 pt-2 px-2">
        {navItems.map(({label, href}) => {
            const isActive = path === href || (href !== "/" && path.startsWith(href))
          return(
            <NavigationMenuItem asChild key={label} className={cn(
              "py-2 text-xs transition-colors", 
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Link href={href}>{label}</Link>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenu>
    </div>
  )
}
export default Menu
