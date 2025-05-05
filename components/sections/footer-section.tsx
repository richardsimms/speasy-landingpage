import Link from "next/link"
import {  Linkedin,  } from "lucide-react"
import { Logo } from "@/components/logo"


export default function FooterSection() {
  return (
    <footer className="w-full bg-muted/30">


      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center" aria-label="Speasy Home">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
            <p className="text-sm text-muted-foreground">
              Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries.
            </p>
            <div className="flex space-x-4">
{/*               <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link> */}
              <Link href="https://www.linkedin.com/company/speasytts/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
{/*               <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link> */}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                Blog
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Speasy. Built with clarity, read with ease, listened with joy.
        </div>
      </div>
    </footer>
  )
}
