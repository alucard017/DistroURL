"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, LinkIcon, TrendingUp, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { format, subDays } from "date-fns"
import { Chart, ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"
import { Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Mock user data
const user = {
  name: "John Doe",
  email: "john@example.com",
  image: "",
}

// Generate mock data for charts
const generateDailyData = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - i - 1)
    return {
      date: format(date, "MMM dd"),
      clicks: Math.floor(Math.random() * 100) + 20,
      uniqueVisitors: Math.floor(Math.random() * 70) + 10,
      newUrls: Math.floor(Math.random() * 10) + 1,
    }
  })
}

const generateSourceData = () => {
  return [
    { source: "Direct", value: 45 },
    { source: "Social Media", value: 28 },
    { source: "Email", value: 15 },
    { source: "Other", value: 12 },
  ]
}

const generateDeviceData = () => {
  return [
    { device: "Mobile", value: 62 },
    { device: "Desktop", value: 32 },
    { device: "Tablet", value: 6 },
  ]
}

const generateLocationData = () => {
  return [
    { country: "United States", value: 40 },
    { country: "United Kingdom", value: 15 },
    { country: "Germany", value: 12 },
    { country: "Canada", value: 8 },
    { country: "Australia", value: 7 },
    { country: "France", value: 6 },
    { country: "Other", value: 12 },
  ]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  // Generate data based on selected time range
  const getDaysFromRange = (range: string) => {
    switch (range) {
      case "7d":
        return 7
      case "30d":
        return 30
      case "90d":
        return 90
      default:
        return 7
    }
  }

  const dailyData = generateDailyData(getDaysFromRange(timeRange))
  const sourceData = generateSourceData()
  const deviceData = generateDeviceData()
  const locationData = generateLocationData()

  // Calculate summary metrics
  const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0)
  const totalVisitors = dailyData.reduce((sum, day) => sum + day.uniqueVisitors, 0)
  const totalNewUrls = dailyData.reduce((sum, day) => sum + day.newUrls, 0)

  // Calculate percentage changes (mock data)
  const clicksChange = "+12.5%"
  const visitorsChange = "+8.3%"
  const newUrlsChange = "+15.2%"

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
              <Link href="/shortener">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ShortLink</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <UserAvatar user={user} />
          </motion.div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-xl text-muted-foreground">Track and analyze the performance of your shortened URLs</p>
        </motion.div>

        <div className="mb-6">
          <Tabs defaultValue="7d" value={timeRange} onValueChange={setTimeRange}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Overview</h2>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{totalClicks.toLocaleString()}</div>
                <div className="text-sm font-medium text-green-500 flex items-center">
                  {clicksChange}
                  <TrendingUp className="ml-1 h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{totalVisitors.toLocaleString()}</div>
                <div className="text-sm font-medium text-green-500 flex items-center">
                  {visitorsChange}
                  <Users className="ml-1 h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New URLs Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{totalNewUrls.toLocaleString()}</div>
                <div className="text-sm font-medium text-green-500 flex items-center">
                  {newUrlsChange}
                  <Activity className="ml-1 h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Click and visitor trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ChartContainer>
                  <Chart>
                    <ResponsiveContainer width="100%" height="100%">
                      <Line data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend content={<ChartLegend />} />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          name="Clicks"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="uniqueVisitors"
                          name="Unique Visitors"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </Line>
                    </ResponsiveContainer>
                  </Chart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-2 h-full">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer>
                    <Chart>
                      <ResponsiveContainer width="100%" height="100%">
                        <Bar data={sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                          <XAxis dataKey="source" />
                          <YAxis />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </Bar>
                      </ResponsiveContainer>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="border-2 h-full">
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Devices used to access your links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer>
                    <Chart>
                      <ResponsiveContainer width="100%" height="100%">
                        <Bar data={deviceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                          <XAxis dataKey="device" />
                          <YAxis />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" name="Percentage" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </Bar>
                      </ResponsiveContainer>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Where your visitors are located</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ChartContainer>
                  <Chart>
                    <ResponsiveContainer width="100%" height="100%">
                      <Bar data={locationData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="country" />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </Bar>
                    </ResponsiveContainer>
                  </Chart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t py-6 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
  )
}
