"use client"

import { useState } from "react"
import { Upload, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"

interface Step4PaymentProps {
  formData: {
    paymentScreenshot?: string
    paymentScreenshotUrl?: string
  }
  setFormData: (data: any) => void
}

export default function Step4Payment({ formData, setFormData }: Step4PaymentProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        // Upload to Cloudinary via our API
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        
        setFormData({
          ...formData,
          paymentScreenshot: base64,
          paymentScreenshotUrl: data.url,
        })
        setUploading(false)
      }

      reader.onerror = () => {
        setError("Failed to read file")
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload image. Please try again.")
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData({
      ...formData,
      paymentScreenshot: undefined,
      paymentScreenshotUrl: undefined,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Payment</h2>
        <p className="text-muted-foreground">Complete your payment and upload the screenshot</p>
      </div>

      {/* QR Code Section */}
      <div className="bg-muted p-8 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-4">Scan to Pay</h3>
        <div className="bg-white p-4 inline-block rounded-lg shadow-md">
          <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center">
            {/* Replace with actual QR code */}
            <div className="text-center">
              <p className="text-4xl mb-2">📱</p>
              <p className="text-sm text-gray-600">UPI QR Code</p>
              <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <p className="font-semibold text-lg">UPI ID: chessevent@upi</p>
          <p className="text-muted-foreground text-sm">Or pay to the above UPI ID</p>
        </div>
      </div>

      {/* Upload Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Upload Payment Screenshot</h3>
        <p className="text-sm text-muted-foreground mb-4">
          After completing the payment, please upload a screenshot of the payment confirmation
        </p>

        {!formData.paymentScreenshotUrl ? (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="paymentScreenshot"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="paymentScreenshot"
              className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {uploading ? "Uploading..." : "Click to upload"}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, JPEG up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-green-700 mb-2">Screenshot uploaded successfully!</p>
                <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={formData.paymentScreenshotUrl}
                    alt="Payment Screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={removeImage}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove and upload different image
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important</p>
        <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
          <li>Make sure the screenshot is clear and readable</li>
          <li>Include transaction ID and amount in the screenshot</li>
          <li>Your registration will be confirmed after payment verification</li>
          <li>You will receive an email once verified</li>
        </ul>
      </div>
    </div>
  )
}
