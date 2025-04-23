"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QRCodeGeneratorProps {
  url: string
}

export function QRCodeGenerator({ url }: QRCodeGeneratorProps) {
  const [size, setSize] = useState(200)
  const [color, setColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("M")
  const [isLoading, setIsLoading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate QR code URL using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    url,
  )}&size=${size}x${size}&color=${color.substring(1)}&bgcolor=${backgroundColor.substring(1)}&ecc=${errorCorrection}`

  const downloadQRCode = () => {
    setIsLoading(true)

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = "qrcode.png"

    // Simulate download delay
    setTimeout(() => {
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsLoading(false)

      toast({
        title: "QR Code downloaded",
        description: "Your QR code has been downloaded successfully.",
      })
    }, 1000)
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code for Shortened URL",
          text: "Check out this QR code for my shortened URL",
          url: qrCodeUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(qrCodeUrl)
      toast({
        title: "QR Code URL copied",
        description: "The URL to your QR code has been copied to clipboard.",
      })
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>Create a custom QR code for your shortened URL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-size">Size</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="qr-size"
                  min={100}
                  max={500}
                  step={10}
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right">{size}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-color">Foreground Color</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-bg-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-bg-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="error-correction">Error Correction</Label>
              <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                <SelectTrigger id="error-correction">
                  <SelectValue placeholder="Select error correction level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (7%)</SelectItem>
                  <SelectItem value="M">Medium (15%)</SelectItem>
                  <SelectItem value="Q">Quartile (25%)</SelectItem>
                  <SelectItem value="H">High (30%)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher error correction allows the QR code to remain scannable even if partially damaged or obscured.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
            <div ref={qrRef} className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                key={`${size}-${color}-${backgroundColor}-${errorCorrection}`}
                className="bg-white rounded-lg overflow-hidden shadow-md"
                style={{ padding: "1rem", backgroundColor }}
              >
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code"
                  className="max-w-full h-auto"
                  style={{ maxHeight: `${Math.min(size, 300)}px` }}
                />
              </motion.div>
            </div>
            <p className="text-sm text-center text-muted-foreground mb-2">
              Scan to open: <span className="font-mono">{url}</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={shareQRCode}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button onClick={downloadQRCode} disabled={isLoading}>
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-t-transparent border-white rounded-full mr-2"
            />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
