"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Globe, FileText, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { submitUrl } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface AddContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const urlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
})

export function AddContentDialog({ open, onOpenChange }: AddContentDialogProps) {
  const [activeTab, setActiveTab] = useState("url")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  })

  async function onSubmit(values: z.infer<typeof urlSchema>) {
    setIsSubmitting(true)
    try {
      const result = await submitUrl(values.url)

      if (result.success) {
        toast({
          title: "URL submitted successfully",
          description: "We'll process your content and convert it to audio.",
        })
        form.reset()
        onOpenChange(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error submitting URL",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting URL",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <DialogDescription>
            Add content to convert to audio. You can add a URL, upload a file, or subscribe to a newsletter.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url">
              <Globe className="mr-2 h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="mr-2 h-4 w-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="newsletter">
              <Rss className="mr-2 h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="rounded-lg border border-dashed p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag and drop a file, or click to browse</p>
              <Button variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
            <DialogFooter>
              <Button disabled>Upload</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subscribe to newsletters to automatically convert them to audio.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/settings/subscriptions">Manage Newsletter Subscriptions</a>
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
