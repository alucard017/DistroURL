"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, LinkIcon, Users, Link2, BarChart3, Shield, Search, Trash2, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock user data
const user = {
  name: "Admin User",
  email: "admin@example.com",
  image: "",
}

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    urlsCreated: 24,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "active",
    role: "user",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    urlsCreated: 56,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "suspended",
    role: "user",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    urlsCreated: 3,
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    status: "active",
    role: "admin",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    urlsCreated: 128,
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "active",
    role: "user",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    urlsCreated: 17,
  },
]

// Mock URLs data
const mockUrls = [
  {
    id: "1",
    originalUrl: "https://example.com/very/long/url/that/needs/to/be/shortened",
    shortUrl: "https://short.url/abc123",
    userId: "1",
    userName: "John Doe",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    clicks: 145,
    status: "active",
  },
  {
    id: "2",
    originalUrl: "https://anotherexample.com/some/long/path/with/parameters?id=123&source=email",
    shortUrl: "https://short.url/def456",
    userId: "2",
    userName: "Jane Smith",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    clicks: 89,
    status: "active",
  },
  {
    id: "3",
    originalUrl: "https://malicious-example.com/phishing/attempt",
    shortUrl: "https://short.url/ghi789",
    userId: "3",
    userName: "Bob Johnson",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    clicks: 12,
    status: "flagged",
  },
  {
    id: "4",
    originalUrl: "https://expired-example.com/this/url/is/no/longer/active",
    shortUrl: "https://short.url/jkl012",
    userId: "5",
    userName: "Charlie Brown",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    clicks: 37,
    status: "expired",
  },
  {
    id: "5",
    originalUrl: "https://example.org/legitimate/resource/page",
    shortUrl: "https://short.url/mno345",
    userId: "4",
    userName: "Alice Williams",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    clicks: 256,
    status: "active",
  },
]

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("users")
  const [isLoading, setIsLoading] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedUrl, setSelectedUrl] = useState<any>(null)

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter URLs based on search query
  const filteredUrls = mockUrls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.userName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUserAction = (action: string, userId: string) => {
    setIsLoading(true)

    // Find the user
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) return

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      let message = ""
      switch (action) {
        case "suspend":
          message = `User ${user.name} has been suspended`
          break
        case "activate":
          message = `User ${user.name} has been activated`
          break
        case "delete":
          message = `User ${user.name} has been deleted`
          break
        case "makeAdmin":
          message = `${user.name} has been promoted to admin`
          break
        case "removeAdmin":
          message = `Admin privileges removed from ${user.name}`
          break
      }

      toast({
        title: "Action completed",
        description: message,
      })

      setShowUserDialog(false)
    }, 1000)
  }

  const handleUrlAction = (action: string, urlId: string) => {
    setIsLoading(true)

    // Find the URL
    const url = mockUrls.find((u) => u.id === urlId)
    if (!url) return

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      let message = ""
      switch (action) {
        case "disable":
          message = `URL ${url.shortUrl} has been disabled`
          break
        case "enable":
          message = `URL ${url.shortUrl} has been enabled`
          break
        case "delete":
          message = `URL ${url.shortUrl} has been deleted`
          break
        case "extend":
          message = `Expiration for ${url.shortUrl} has been extended by 30 days`
          break
      }

      toast({
        title: "Action completed",
        description: message,
      })

      setShowUrlDialog(false)
    }, 1000)
  }

  const openUserDetails = (user: any) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const openUrlDetails = (url: any) => {
    setSelectedUrl(url)
    setShowUrlDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>
      case "suspended":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Suspended</Badge>
      case "flagged":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Flagged</Badge>
      case "expired":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
            <Badge className="ml-2 bg-red-500 hover:bg-red-600 text-white">Admin</Badge>
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage users, URLs, and system settings</p>
        </motion.div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-3xl font-bold">{mockUsers.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Link2 className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-3xl font-bold">{mockUrls.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-3xl font-bold">1</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs defaultValue="users" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="urls" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                URLs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${selectedTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
        </div>

        <TabsContent value="users" className="mt-0">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>URLs Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No users found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.role === "admin" ? (
                              <Badge variant="outline" className="border-primary text-primary">
                                Admin
                              </Badge>
                            ) : (
                              "User"
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.urlsCreated}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">Open menu</span>
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openUserDetails(user)}>View Details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem onClick={() => handleUserAction("suspend", user.id)}>
                                    Suspend User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserAction("activate", user.id)}>
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                {user.role === "admin" ? (
                                  <DropdownMenuItem onClick={() => handleUserAction("removeAdmin", user.id)}>
                                    Remove Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserAction("makeAdmin", user.id)}>
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleUserAction("delete", user.id)}
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="mt-0">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>URL Management</CardTitle>
              <CardDescription>View and manage shortened URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUrls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No URLs found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUrls.map((url) => (
                        <TableRow key={url.id}>
                          <TableCell className="font-medium">{url.shortUrl}</TableCell>
                          <TableCell>{url.userName}</TableCell>
                          <TableCell>{url.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell>{url.expiresAt.toLocaleDateString()}</TableCell>
                          <TableCell>{url.clicks}</TableCell>
                          <TableCell>{getStatusBadge(url.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">Open menu</span>
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openUrlDetails(url)}>View Details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {url.status === "active" ? (
                                  <DropdownMenuItem onClick={() => handleUrlAction("disable", url.id)}>
                                    Disable URL
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUrlAction("enable", url.id)}>
                                    Enable URL
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleUrlAction("extend", url.id)}>
                                  Extend Expiration
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleUrlAction("delete", url.id)}
                                >
                                  Delete URL
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>View system performance and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Analytics dashboard is under development</p>
                  <p className="text-sm">Check back soon for detailed system metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View and manage user information</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                  {selectedUser.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedUser.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p>
                    {selectedUser.role === "admin" ? (
                      <Badge variant="outline" className="border-primary text-primary">
                        Admin
                      </Badge>
                    ) : (
                      "User"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p>{selectedUser.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">URLs Created</p>
                  <p>{selectedUser.urlsCreated}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {selectedUser.status === "active" ? (
                <Button variant="destructive" onClick={() => handleUserAction("suspend", selectedUser.id)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend User
                </Button>
              ) : (
                <Button variant="default" onClick={() => handleUserAction("activate", selectedUser.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate User
                </Button>
              )}
              <Button variant="destructive" onClick={() => handleUserAction("delete", selectedUser.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* URL Details Dialog */}
      {selectedUrl && (
        <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>URL Details</DialogTitle>
              <DialogDescription>View and manage URL information</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Short URL</p>
                <p className="font-medium break-all">{selectedUrl.shortUrl}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Original URL</p>
                <p className="break-all text-sm bg-muted p-2 rounded">{selectedUrl.originalUrl}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p>{selectedUrl.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedUrl.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{selectedUrl.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p>{selectedUrl.expiresAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p>{selectedUrl.clicks}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {selectedUrl.status === "active" ? (
                <Button variant="destructive" onClick={() => handleUrlAction("disable", selectedUrl.id)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Disable URL
                </Button>
              ) : (
                <Button variant="default" onClick={() => handleUrlAction("enable", selectedUrl.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enable URL
                </Button>
              )}
              <Button variant="destructive" onClick={() => handleUrlAction("delete", selectedUrl.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete URL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  )
}
