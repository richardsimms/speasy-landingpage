"use client"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-3xl font-bold tracking-tight mt-8 mb-4", className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn("text-2xl font-bold tracking-tight mt-8 mb-4", className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn("text-xl font-bold tracking-tight mt-6 mb-3", className)} {...props} />
          ),
          p: ({ className, ...props }) => <p className={cn("leading-7 mb-4", className)} {...props} />,
          ul: ({ className, ...props }) => (
            <ul className={cn("list-disc list-outside pl-6 mb-4", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("list-decimal list-outside pl-6 mb-4", className)} {...props} />
          ),
          li: ({ className, ...props }) => <li className={cn("mt-2", className)} {...props} />,
          a: ({ className, ...props }) => (
            <a className={cn("text-primary underline underline-offset-4", className)} {...props} />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote className={cn("border-l-4 border-primary pl-4 italic", className)} {...props} />
          ),
          code: ({ className, ...props }) => (
            <code className={cn("bg-muted rounded px-1 py-0.5 text-sm", className)} {...props} />
          ),
          pre: ({ className, ...props }) => (
            <pre className={cn("bg-muted p-4 rounded-md overflow-x-auto", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
