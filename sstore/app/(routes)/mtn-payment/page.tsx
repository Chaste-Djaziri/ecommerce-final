"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

import Button from "@/components/ui/button"
import Currency from "@/components/ui/currency"
import useCart from "@/hooks/use-cart"
import Container from "@/components/ui/container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Google Form URL to redirect to after checkout
const GOOGLE_FORM_URL = "https://forms.gle/qRLBDVgB3dnPghLWA"

export default function MtnPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const amount = searchParams.get("amount") || "0"

  const items = useCart((state) => state.items)
  const removeAll = useCart((state) => state.removeAll)

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Create form data to send to checkout API
      const formData = new FormData()

      // Add required fields for the API
      formData.append("productIds", JSON.stringify(items.map((item) => item.id)))

      // Add email to form data
      formData.append("email", email)

      // Add minimal required fields to pass validation
      formData.append("address", "Default Address")
      formData.append("phone", "Default Phone")

      // Send checkout request to API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Clear cart after successful checkout
      removeAll()

      // Show success message
      toast.success("Order completed successfully!")

      // Store the fact that we need to redirect
      localStorage.setItem("redirectToGoogleForm", "true")

      // Try to open Google Form in a new tab
      const newWindow = window.open(GOOGLE_FORM_URL, "_blank")

      // If popup was blocked or failed, redirect in the same tab
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Redirect in the same window if popup blocked
        window.location.href = GOOGLE_FORM_URL
      } else {
        // If successful popup, redirect current page to success
        router.push("/cart?success=1")
      }
    } catch (error) {
      console.error("Error completing checkout:", error)
      toast.error("Something went wrong with your checkout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Complete Your Purchase</h1>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-4">
              <h3 className="font-medium text-lg flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Almost Done!
              </h3>
              <p className="mb-4">
                You're on the final step. Enter your email and click the button below to complete your order.
              </p>

              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Total Amount to Pay:</p>
                <p className="text-3xl font-bold">
                  <Currency value={Number(amount)} />
                </p>
              </div>

              <div className="mb-4">
                <Label htmlFor="email" className="block mb-2">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button disabled={isLoading} className="w-full py-3 text-lg" onClick={handleCheckout}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Finish Checkout"
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between border-t mt-6 pt-4">
            <Button
              className="bg-transparent text-black border border-gray-300 hover:bg-gray-100"
              onClick={() => router.push("/cart")}
            >
              Back to Cart
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
