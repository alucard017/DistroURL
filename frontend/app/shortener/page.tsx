"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Share2, ArrowLeft, LinkIcon, Zap, Database, Server } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"

interface RequestLog {
  id: string
  timestamp: Date
  service: "redis" | "nginx" | "zookeeper"
  action: string
  details: string
}

export default function ShortenerPage() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Simulate backend request logs
  useEffect(() => {
    const services = ["redis", "nginx", "zookeeper"]
    const actions = {
      redis: ["CACHE_SET", "CACHE_GET", "EXPIRE_KEY"],
      nginx: ["PROXY_REQUEST", "LOAD_BALANCE", "CACHE_RESPONSE"],
      zookeeper: ["REGISTER_NODE", "HEARTBEAT", "LEADER_ELECTION"],
    }

    const interval = setInterval(() => {
      if (shortUrl) {
        const service = services[Math.floor(Math.random() * services.length)] as "redis" | "nginx" | "zookeeper"
        const serviceActions = actions[service]
        const action = serviceActions[Math.floor(Math.random() * serviceActions.length)]

        const newLog: RequestLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          service,
          action,
          details: `Processing ${shortUrl} - ${action.toLowerCase().replace("_", " ")}`,
        }

        setRequestLogs((prev) => [newLog, ...prev].slice(0, 20))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shortUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const randomString = Math.random().toString(36).substring(2, 7)
      setShortUrl(`https://short.url/${randomString}`)
      setIsLoading(false)

      // Add initial logs
      const initialLogs: RequestLog[] = [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          service: "nginx",
          action: "PROXY_REQUEST",
          details: "Received URL shortening request",
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          service: "zookeeper",
          action: "REGISTER_NODE",
          details: "Assigned worker node for processing",
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          service: "redis",
          action: "CACHE_SET",
          details: `Stored mapping for ${url}`,
        },
      ]

      setRequestLogs(initialLogs)
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    toast({
      title: "Copied to clipboard",
      description: "The shortened URL has been copied to your clipboard.",
    })
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this shortened URL",
          text: "I shortened this URL with an awesome tool",
          url: shortUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyToClipboard()
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing. URL copied to clipboard instead.",
      })
    }
  }

  const getServiceColor = (service: string) => {
    switch (service) {
      case "redis":
        return "bg-red-500 text-white dark:bg-red-500"
      case "nginx":
        return "bg-green-500 text-white dark:bg-green-500"
      case "zookeeper":
        return "bg-yellow-500 text-black dark:bg-yellow-500"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "redis":
        return <Database className="h-3 w-3" />
      case "nginx":
        return <Server className="h-3 w-3" />
      case "zookeeper":
        return <Zap className="h-3 w-3" />
      default:
        return null
    }
  }

  const filteredLogs = activeTab === "all" ? requestLogs : requestLogs.filter((log) => log.service === activeTab)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ShortLink</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
            Shorten Your URL
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your long URLs into short, manageable links with our powerful URL shortener.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <Card className="overflow-hidden border-2 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    placeholder="Enter your long URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 text-base transition-all duration-200 focus-within:ring-2 h-12"
                    required
                  />
                  <Button
                    type="submit"
                    className="transition-all duration-300 hover:scale-105 h-12 px-8 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-t-transparent border-white rounded-full"
                      />
                    ) : (
                      "Shorten URL"
                    )}
                  </Button>
                </div>
              </form>

              <AnimatePresence>
                {shortUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 pt-8 border-t"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 w-full bg-muted p-4 rounded-md font-mono text-base overflow-hidden">
                        {shortUrl}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          size="lg"
                          className="transition-all duration-200 hover:scale-110 h-12 px-6"
                        >
                          <Copy className="h-5 w-5 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={shareUrl}
                          variant="outline"
                          size="lg"
                          className="transition-all duration-200 hover:scale-110 h-12 px-6"
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">System Activity</CardTitle>
              <CardDescription>Real-time monitoring of Redis, Nginx, and Zookeeper services</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-6 grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  <TabsTrigger value="redis">Redis</TabsTrigger>
                  <TabsTrigger value="nginx">Nginx</TabsTrigger>
                  <TabsTrigger value="zookeeper">Zookeeper</TabsTrigger>
                </TabsList>

                <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
                  <AnimatePresence initial={false}>
                    {filteredLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Server className="h-12 w-12 mb-4 opacity-20" />
                        <p>Submit a URL to see system activity</p>
                      </div>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className={`py-3 px-4 mb-3 rounded-md border ${index === 0 ? "bg-background shadow-sm" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="secondary"
                              className={`${getServiceColor(log.service)} flex items-center gap-1.5`}
                            >
                              {getServiceIcon(log.service)}
                              {log.service.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="font-mono text-xs bg-background px-2 py-1 rounded border">{log.action}</div>
                            <div className="text-sm">{log.details}</div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t py-6 px-4 mt-12">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Your Name. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
