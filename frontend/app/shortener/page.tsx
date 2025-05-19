"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Share2,
  ArrowLeft,
  LinkIcon,
  Download,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/theme-toggle";
import { format, addDays } from "date-fns";

export default function ShortenerPage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const randomString = Math.random().toString(36).substring(2, 7);
      setShortUrl(`https://short.url/${randomString}`);
      // Set expiration date to 30 days from now
      const expDate = addDays(new Date(), 30);
      setExpirationDate(expDate);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied to clipboard",
      description: "The shortened URL has been copied to your clipboard.",
    });
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this shortened URL",
          text: "I shortened this URL with ShortLink",
          url: shortUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
      toast({
        title: "Sharing not supported",
        description:
          "Your browser doesn't support sharing. URL copied to clipboard instead.",
      });
    }
  };

  const downloadQrCode = () => {
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      shortUrl
    )}&size=300x300&color=000000&bgcolor=ffffff`;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code downloaded",
      description: "Your QR code has been downloaded successfully.",
    });
  };

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

          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
            Shorten Your URL
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your long URLs into short, manageable links in seconds.
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
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1,
                          ease: "linear",
                        }}
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
                    <div className="flex flex-col space-y-6">
                      {/* Shortened URL Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          Your Shortened URL
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                          <div className="flex-1 w-full bg-muted p-4 rounded-md font-mono text-base overflow-hidden">
                            {shortUrl}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={copyToClipboard}
                              variant="outline"
                              className="transition-all duration-200 hover:scale-110"
                            >
                              <Copy className="h-5 w-5 mr-2" />
                              Copy
                            </Button>
                            <Button
                              onClick={shareUrl}
                              variant="outline"
                              className="transition-all duration-200 hover:scale-110"
                            >
                              <Share2 className="h-5 w-5 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                        {expirationDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Expires on{" "}
                              {format(expirationDate, "MMMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QR Code Section */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">QR Code</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          <div className="bg-white p-4 rounded-lg shadow-md">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                                shortUrl
                              )}&size=200x200&color=000000&bgcolor=ffffff`}
                              alt="QR Code"
                              className="w-[200px] h-[200px]"
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <p className="text-muted-foreground">
                              This QR code links directly to your shortened URL.
                              Users can scan it with their smartphone camera to
                              quickly access your link.
                            </p>
                            <Button variant="outline" onClick={downloadQrCode}>
                              <Download className="h-4 w-4 mr-2" />
                              Download QR Code
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Original URL Section */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-3">
                          Original URL
                        </h3>
                        <div className="bg-muted p-4 rounded-md text-sm break-all">
                          {url}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t py-6 px-4 mt-auto">
        <div className="container max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShortLink. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
