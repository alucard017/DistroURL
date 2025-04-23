"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, MoreHorizontal, QrCode } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UrlData {
  id: string
  originalUrl: string
  shortUrl: string
  createdAt: Date
  expiresAt: Date
  clicks: number
  isActive: boolean
}

export function UrlHistory() {
  // Mock data for URL history
  const [urls, setUrls] = useState<UrlData[]>([
    {
      id: "1",
      originalUrl: "https://example.com/very/long/url/that/needs/to/be/shortened/for/better/usability",
      shortUrl: "https://short.url/abc123",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      clicks: 145,
      isActive: true,
    },
    {
      id: "2",
      originalUrl: "https://anotherexample.com/some/long/path/with/parameters?id=123&source=email",
      shortUrl: "https://short.url/def456",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      expiresAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      clicks: 89,
      isActive: true,
    },
    {
      id: "3",
      originalUrl: "https://expired-example.com/this/url/is/no/longer/active",
      shortUrl: "https://short.url/ghi789",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      clicks: 37,
      isActive: false,
    },
  ])

  const [selectedUrl, setSelectedUrl] = useState<UrlData | null>(null)
  const [showQrDialog, setShowQrDialog] = useState(false)

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied to clipboard",
      description: "The URL has been copied to your clipboard.",
    })
  }

  const deleteUrl = (id: string) => {
    setUrls((prev) => prev.filter((url) => url.id !== id))
    toast({
      title: "URL deleted",
      description: "The shortened URL has been deleted.",
    })
  }

  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  const showQrCode = (url: UrlData) => {
    setSelectedUrl(url)
    setShowQrDialog(true)
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle>Your Shortened URLs</CardTitle>
        <CardDescription>Track the performance of your shortened links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {urls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't created any shortened URLs yet.</p>
              </div>
            ) : (
              urls.map((url) => (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Original URL</h3>
                        <p className="text-sm text-muted-foreground break-all">{url.originalUrl}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={url.isActive ? "default" : "destructive"}
                          className={`${
                            url.isActive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                          } text-white`}
                        >
                          {url.isActive ? "Active" : "Expired"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(url.shortUrl)}>Copy URL</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => showQrCode(url)}>Show QR Code</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteUrl(url.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">Shortened URL</h3>
                        <div className="flex items-center">
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center"
                          >
                            {url.shortUrl}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => copyToClipboard(url.shortUrl)}
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy URL</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => showQrCode(url)}>
                            <QrCode className="h-3 w-3" />
                            <span className="sr-only">Show QR Code</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">Clicks</h3>
                        <p className="text-sm font-semibold">{url.clicks}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">Created</h3>
                        <p className="text-sm">{format(url.createdAt, "MMM d, yyyy")}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">Expires</h3>
                        <p className="text-sm">{format(url.expiresAt, "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>QR Code for Shortened URL</DialogTitle>
            <DialogDescription>Scan this QR code to access your shortened URL</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {selectedUrl && (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                      selectedUrl.shortUrl,
                    )}&size=200x200&color=000000&bgcolor=ffffff`}
                    alt="QR Code"
                    className="w-[200px] h-[200px]"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mb-2">
                  Scan to open: <span className="font-mono">{selectedUrl.shortUrl}</span>
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedUrl.shortUrl)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        selectedUrl.shortUrl,
                      )}&size=300x300&color=000000&bgcolor=ffffff`
                      link.download = "qrcode.png"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    Download QR
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
