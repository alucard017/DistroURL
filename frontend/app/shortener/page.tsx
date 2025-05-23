"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Share2,
  ArrowLeft,
  LinkIcon,
  Download,
  Calendar,
  Search,
  Lock,
  Clock,
  X,
  Eye,
  EyeOff,
  QrCode,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/theme-toggle";
import { format, addDays, isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Define API base URL directly in the component
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PreviousUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  isPasswordProtected: boolean;
  isOneTimeUse: boolean;
}

export default function ShortenerPage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    addDays(new Date(), 30)
  );
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOneTimeUse, setIsOneTimeUse] = useState(false);
  const [searchResults, setSearchResults] = useState<PreviousUrl[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [processedCsvUrl, setProcessedCsvUrl] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>("");

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setCsvFileName(file.name);
      setProcessedCsvUrl(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const processCsvFile = async () => {
    if (!csvFile) return;

    setIsProcessingCsv(true);

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await fetch(`/bulk`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process CSV file");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setProcessedCsvUrl(url);

      toast({
        title: "CSV processed successfully",
        description:
          "Your CSV file has been processed. You can now download the results.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to process the CSV file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCsv(false);
    }
  };

  // Search for previously shortened URLs as user types
  useEffect(() => {
    const controller = new AbortController();

    const fetchSearchResults = async () => {
      if (url.length > 5) {
        try {
          const res = await fetch(`/search`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ OriginalUrl: url }),
            signal: controller.signal,
          });

          const data = await res.json();

          if (!res.ok) {
            setSearchResults([]);
            console.warn(data.message || "Failed to search URLs");
            return;
          }

          const results = data.data.results.map((item: any, index: number) => ({
            id: String(index),
            originalUrl: item.OriginalUrl,
            shortUrl: item.ShortURL,
            createdAt: new Date(item.CreatedAt),
            expiresAt: new Date(item.ExpiresAt),
            isActive: new Date(item.ExpiresAt) > new Date(),
            isPasswordProtected: item.PasswordProtected,
            isOneTimeUse: item.OneTime,
          }));

          setSearchResults(results);
        } catch (err: any) {
          if (err.name !== "AbortError") {
            console.error("Search error:", err);
            setSearchResults([]);
          }
        }
      } else {
        setSearchResults([]);
      }
    };

    fetchSearchResults();

    return () => controller.abort();
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (expirationDate && isBefore(expirationDate, new Date())) {
      toast({
        title: "Invalid expiration date",
        description: "Expiration date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OriginalUrl: url,
          ExpiresAt: expirationDate,
          Password: isPasswordProtected ? password : undefined,
          OneTime: isOneTimeUse,
        }),
      });

      if (!res.ok) throw new Error("Failed to shorten URL");
      const data = await res.json();
      console.log("API Response:", data);
      setShortUrl(data.data.ShortURL);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to shorten the URL. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard",
      description: "The URL has been copied to your clipboard.",
    });
  };

  const shareUrl = async (urlToShare: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this shortened URL",
          text: "I shortened this URL with DistroURL",
          url: urlToShare,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard(urlToShare);
      toast({
        title: "Sharing not supported",
        description:
          "Your browser doesn't support sharing. URL copied to clipboard instead.",
      });
    }
  };

  const downloadQrCode = async (urlToEncode: string) => {
    const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      urlToEncode
    )}&size=300x300&color=000000&bgcolor=ffffff`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code downloaded",
        description: "Your QR code has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download QR code. Try again later.",
        variant: "destructive",
      });
      console.error("QR download failed", error);
    }
  };

  const clearSearch = () => {
    setUrl("");
    setSearchResults([]);
  };

  const showQrCode = (url: string) => {
    setSelectedQrUrl(url);
    setQrDialogOpen(true);
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
            <span className="font-bold text-xl">DistroURL</span>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="url"
                        placeholder="Enter your long URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 text-base transition-all duration-200 focus-within:ring-2 h-12 pr-10"
                        required
                      />
                      {url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={clearSearch}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      )}
                    </div>
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
                </div>

                {/* Search Results Section */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border border-primary/20 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Matching URLs
                          </CardTitle>
                          <CardDescription>
                            Found {searchResults.length} previously shortened
                            URL
                            {searchResults.length !== 1 ? "s" : ""} matching
                            your input
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {searchResults.map((result) => (
                            <div
                              key={result.id}
                              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex flex-col space-y-3">
                                {/* Header with short URL and status */}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                                    <span className="font-medium">
                                      {result.shortUrl}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      result.isActive ? "default" : "outline"
                                    }
                                    className={
                                      result.isActive
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "text-red-500 border-red-200"
                                    }
                                  >
                                    {result.isActive ? "Active" : "Expired"}
                                  </Badge>
                                </div>

                                {/* Original URL */}
                                <div className="bg-muted/30 p-2 rounded text-sm text-muted-foreground break-all">
                                  {result.originalUrl}
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="flex items-center text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span>
                                      Created:{" "}
                                      {format(result.createdAt, "MMM d, yyyy")}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span>
                                      Expires:{" "}
                                      {format(result.expiresAt, "MMM d, yyyy")}
                                    </span>
                                  </div>
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2">
                                  {result.isPasswordProtected && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex items-center gap-1 border-yellow-200"
                                    >
                                      <Lock className="h-3 w-3" />
                                      Password protected
                                    </Badge>
                                  )}
                                  {result.isOneTimeUse && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex items-center gap-1 border-blue-200"
                                    >
                                      <Clock className="h-3 w-3" />
                                      One-time use
                                    </Badge>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                    onClick={() =>
                                      copyToClipboard(result.shortUrl)
                                    }
                                  >
                                    <Copy className="h-3 w-3 mr-2" />
                                    Copy URL
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => shareUrl(result.shortUrl)}
                                  >
                                    <Share2 className="h-3 w-3 mr-2" />
                                    Share
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => showQrCode(result.shortUrl)}
                                  >
                                    <QrCode className="h-3 w-3 mr-2" />
                                    View QR Code
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                      const url = result.shortUrl.startsWith(
                                        "http"
                                      )
                                        ? result.shortUrl
                                        : `https://${result.shortUrl}`;
                                      window.open(url, "_blank");
                                    }}
                                  >
                                    <LinkIcon className="h-3 w-3 mr-2" />
                                    Visit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Advanced Options */}
                <Collapsible
                  open={showAdvancedOptions}
                  onOpenChange={setShowAdvancedOptions}
                  className="border rounded-md p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Advanced Options</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {showAdvancedOptions ? "Hide Options" : "Show Options"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="pt-4 space-y-4">
                    {/* Password Protection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password-protection"
                          className="flex items-center gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          Password Protection
                        </Label>
                        <Switch
                          id="password-protection"
                          checked={isPasswordProtected}
                          onCheckedChange={setIsPasswordProtected}
                        />
                      </div>
                      {isPasswordProtected && (
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* One-time Use */}
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="one-time-use"
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        One-time Use Link
                      </Label>
                      <Switch
                        id="one-time-use"
                        checked={isOneTimeUse}
                        onCheckedChange={setIsOneTimeUse}
                      />
                    </div>

                    {/* Custom Expiration */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="expiration-date"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Custom Expiration Date
                      </Label>
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {expirationDate
                              ? format(expirationDate, "PPP")
                              : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={expirationDate || undefined}
                            onSelect={(date: any) => {
                              setExpirationDate(date);
                              setCalendarOpen(false);
                            }}
                            disabled={(date) => isBefore(date, new Date())}
                            //@ts-ignore
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

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
                                onClick={() => copyToClipboard(shortUrl)}
                                variant="outline"
                                className="transition-all duration-200 hover:scale-110"
                              >
                                <Copy className="h-5 w-5 mr-2" />
                                Copy
                              </Button>
                              <Button
                                onClick={() => shareUrl(shortUrl)}
                                variant="outline"
                                className="transition-all duration-200 hover:scale-110"
                              >
                                <Share2 className="h-5 w-5 mr-2" />
                                Share
                              </Button>
                              <Button
                                onClick={() => {
                                  const url = shortUrl.startsWith("http")
                                    ? shortUrl
                                    : `https://${shortUrl}`;
                                  window.open(url, "_blank");
                                }}
                                variant="outline"
                                className="transition-all duration-200 hover:scale-110"
                              >
                                <LinkIcon className="h-5 w-5 mr-2" />
                                Visit
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Expires on{" "}
                                {expirationDate
                                  ? format(expirationDate, "MMMM d, yyyy")
                                  : "Never"}
                              </span>
                            </div>
                            {isPasswordProtected && (
                              <div className="flex items-center">
                                <Lock className="h-4 w-4 mr-1" />
                                <span>Password protected</span>
                              </div>
                            )}
                            {isOneTimeUse && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>One-time use</span>
                              </div>
                            )}
                          </div>
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
                                This QR code links directly to your shortened
                                URL. Users can scan it with their smartphone
                                camera to quickly access your link.
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => downloadQrCode(shortUrl)}
                              >
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
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <Separator className="flex-1" />
            <h2 className="text-2xl font-bold text-center">
              Bulk URL Shortening
            </h2>
            <Separator className="flex-1" />
          </div>

          <Card className="overflow-hidden border-2 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Upload CSV File</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a CSV file containing URLs to shorten them in bulk.
                    The file can contain other columns, but must have at least
                    one column with URLs. Empty cells in the URL column will be
                    ignored.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="csv-upload"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="font-medium">
                            Click to upload CSV
                          </span>
                          <span className="text-sm text-muted-foreground">
                            or drag and drop
                          </span>
                        </label>
                      </div>

                      {csvFile && (
                        <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                          <div className="flex items-center gap-2 truncate">
                            <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium truncate">
                              {csvFileName}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCsvFile(null);
                              setCsvFileName("");
                              setProcessedCsvUrl(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <Button
                        onClick={processCsvFile}
                        disabled={!csvFile || isProcessingCsv}
                        className="w-full"
                      >
                        {isProcessingCsv ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-t-transparent border-white rounded-full mr-2"
                          />
                        ) : (
                          <LinkIcon className="h-4 w-4 mr-2" />
                        )}
                        {isProcessingCsv ? "Processing..." : "Process CSV File"}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 h-full">
                        <h4 className="font-medium mb-2">How it works</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          <li>
                            Upload a CSV file containing URLs in one of the
                            columns
                          </li>
                          <li>
                            Our system will identify all valid URLs in the file
                          </li>
                          <li>Each URL will be shortened using our service</li>
                          <li>
                            A new column named "ShortURL" will be added to the
                            CSV
                          </li>
                          <li>
                            Download the processed file with all your shortened
                            links
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {processedCsvUrl && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-3">
                      Processed CSV File
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your CSV file has been processed. All URLs have been
                      shortened and added to a new column.
                    </p>

                    <div className="flex justify-center">
                      <Button asChild size="lg" className="gap-2">
                        <a
                          href={processedCsvUrl}
                          download={`shortened_${csvFileName}`}
                        >
                          <Download className="h-5 w-5" />
                          Download Processed CSV
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              QR code for your shortened URL
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {selectedQrUrl && (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                      selectedQrUrl
                    )}&size=250x250&color=000000&bgcolor=ffffff`}
                    alt="QR Code"
                    className="w-[250px] h-[250px]"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Scan to open:{" "}
                  <span className="font-mono">{selectedQrUrl}</span>
                </p>
                <Button
                  variant="outline"
                  onClick={() => downloadQrCode(selectedQrUrl)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t py-6 px-4 mt-auto">
        <div className="container max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DistroURL. All rights reserved.
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
