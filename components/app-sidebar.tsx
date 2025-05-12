"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  LayoutDashboard,
  Headphones,
  Bookmark,
  History,
  PlusCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddContentDialog } from "@/components/add-content-dialog"

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddContentOpen, setIsAddContentOpen] = useState(false)
  const isMobile = useIsMobile()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Player",
      icon: Headphones,
      href: "/player",
      active: pathname === "/player",
    },
    {
      label: "Saved",
      icon: Bookmark,
      href: "/saved",
      active: pathname === "/saved",
    },
    {
      label: "History",
      icon: History,
      href: "/history",
      active: pathname === "/history",
    },
  ]

  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="grid h-16 grid-cols-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                className={cn(
                  "h-full flex-col gap-1 rounded-none",
                  route.active && "bg-accent/40"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className={cn("h-5 w-5", route.active ? "text-primary" : "text-primary/80")} />
                  <span className="text-xs">{route.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <AddContentDialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen} />
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[240px]",
        )}
      >
        <div className="flex h-[60px] items-center border-b px-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 transition-opacity group-hover:opacity-100"
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-primary dark:text-primary" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-primary dark:text-primary" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 px-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-2" : "px-4",
                  route.active && "bg-accent/40"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className={cn("h-5 w-5", route.active ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="ml-2">{route.label}</span>}
                </Link>
              </Button>
            ))}
          </div>

{/*           <div className="mt-4 px-2">
            <Button
              className={cn("w-full justify-start", isCollapsed ? "px-2" : "px-4")}
              onClick={() => setIsAddContentOpen(true)}
            >
              <PlusCircle className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">Add Content</span>}
            </Button>
          </div> */}
        <div className="mt-auto border-t p-2">
          <Button variant="ghost" className={cn("w-full justify-start", isCollapsed ? "px-2" : "px-4")} asChild>
            <Link href="/settings/profile">
              <Settings className="h-5 w-5 text-muted-foreground" />
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Link>
          </Button>
        </div>
        </ScrollArea>

      </div>
      {/* <AddContentDialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen} /> */}

    </>
  )
}
