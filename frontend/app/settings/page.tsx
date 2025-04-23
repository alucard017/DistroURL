"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Bell, LinkIcon, Lock, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Mock user data
const user = {
  name: "John Doe",
  email: "john@example.com",
  image: "",
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    defaultUrlExpiration: "30",
    language: "en",
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    urlClickNotifications: false,
    urlExpirationReminders: true,
    marketingEmails: false,
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    passwordChangeInterval: "never",
  })

  // URL settings
  const [urlSettings, setUrlSettings] = useState({
    customDomainEnabled: false,
    trackClicks: true,
    trackGeolocation: true,
    trackDeviceInfo: true,
    privateUrls: false,
  })

  const handleSaveSettings = (section: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: `Your ${section} settings have been updated successfully.`,
      })
    }, 1000)
  }

  const handleToggleChange = (section: string, setting: string, value: boolean) => {
    switch (section) {
      case "notification":
        setNotificationSettings((prev) => ({ ...prev, [setting]: value }))
        break
      case "security":
        setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
        break
      case "url":
        setUrlSettings((prev) => ({ ...prev, [setting]: value }))
        break
    }
  }

  const handleInputChange = (section: string, setting: string, value: string) => {
    switch (section) {
      case "account":
        setAccountSettings((prev) => ({ ...prev, [setting]: value }))
        break
      case "security":
        setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
        break
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
          variant: "destructive",
        })

        // Redirect to home page after account deletion
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      }, 1500)
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

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Account Settings</h1>
          <p className="text-xl text-muted-foreground">Manage your account preferences and settings</p>
        </motion.div>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">URL Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultUrlExpiration">Default URL Expiration</Label>
                      <Select
                        value={accountSettings.defaultUrlExpiration}
                        onValueChange={(value) => handleInputChange("account", "defaultUrlExpiration", value)}
                      >
                        <SelectTrigger id="defaultUrlExpiration">
                          <SelectValue placeholder="Select expiration period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={accountSettings.language}
                        onValueChange={(value) => handleInputChange("account", "language", value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={() => handleSaveSettings("account")} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 mt-8">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-destructive/20 rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleToggleChange("notification", "emailNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="urlClickNotifications">URL Click Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone clicks your URLs</p>
                      </div>
                      <Switch
                        id="urlClickNotifications"
                        checked={notificationSettings.urlClickNotifications}
                        onCheckedChange={(checked) =>
                          handleToggleChange("notification", "urlClickNotifications", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="urlExpirationReminders">URL Expiration Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded before your URLs expire</p>
                      </div>
                      <Switch
                        id="urlExpirationReminders"
                        checked={notificationSettings.urlExpirationReminders}
                        onCheckedChange={(checked) =>
                          handleToggleChange("notification", "urlExpirationReminders", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about new features and offers</p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => handleToggleChange("notification", "marketingEmails", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={() => handleSaveSettings("notification")} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => handleToggleChange("security", "twoFactorAuth", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="loginNotifications">Login Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch
                        id="loginNotifications"
                        checked={securitySettings.loginNotifications}
                        onCheckedChange={(checked) => handleToggleChange("security", "loginNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="passwordChangeInterval">Password Change Interval</Label>
                      <Select
                        value={securitySettings.passwordChangeInterval}
                        onValueChange={(value) => handleInputChange("security", "passwordChangeInterval", value)}
                      >
                        <SelectTrigger id="passwordChangeInterval">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">Every 30 days</SelectItem>
                          <SelectItem value="60">Every 60 days</SelectItem>
                          <SelectItem value="90">Every 90 days</SelectItem>
                          <SelectItem value="180">Every 6 months</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={() => handleSaveSettings("security")} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="url">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>URL Settings</CardTitle>
                  <CardDescription>Configure how your shortened URLs behave</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="customDomainEnabled">Custom Domain</Label>
                        <p className="text-sm text-muted-foreground">Use your own domain for shortened URLs</p>
                      </div>
                      <Switch
                        id="customDomainEnabled"
                        checked={urlSettings.customDomainEnabled}
                        onCheckedChange={(checked) => handleToggleChange("url", "customDomainEnabled", checked)}
                      />
                    </div>

                    {urlSettings.customDomainEnabled && (
                      <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                        <Label htmlFor="customDomain">Your Domain</Label>
                        <Input id="customDomain" placeholder="short.yourdomain.com" />
                        <p className="text-xs text-muted-foreground">
                          You'll need to configure DNS settings for your domain.
                          <Link href="#" className="text-primary ml-1 hover:underline">
                            Learn more
                          </Link>
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Analytics & Tracking</h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="trackClicks">Track Clicks</Label>
                          <p className="text-sm text-muted-foreground">Count how many times your links are clicked</p>
                        </div>
                        <Switch
                          id="trackClicks"
                          checked={urlSettings.trackClicks}
                          onCheckedChange={(checked) => handleToggleChange("url", "trackClicks", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="trackGeolocation">Track Geolocation</Label>
                          <p className="text-sm text-muted-foreground">Track where your visitors are coming from</p>
                        </div>
                        <Switch
                          id="trackGeolocation"
                          checked={urlSettings.trackGeolocation}
                          onCheckedChange={(checked) => handleToggleChange("url", "trackGeolocation", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="trackDeviceInfo">Track Device Info</Label>
                          <p className="text-sm text-muted-foreground">Track browser and device information</p>
                        </div>
                        <Switch
                          id="trackDeviceInfo"
                          checked={urlSettings.trackDeviceInfo}
                          onCheckedChange={(checked) => handleToggleChange("url", "trackDeviceInfo", checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="privateUrls">Private URLs</Label>
                        <p className="text-sm text-muted-foreground">Make all your URLs private by default</p>
                      </div>
                      <Switch
                        id="privateUrls"
                        checked={urlSettings.privateUrls}
                        onCheckedChange={(checked) => handleToggleChange("url", "privateUrls", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={() => handleSaveSettings("url")} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
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

      <Toaster />
    </div>
  )
}
