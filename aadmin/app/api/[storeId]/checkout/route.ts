import type Stripe from "stripe"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    // Check if the request is a FormData (MTN payment) or JSON (Stripe payment)
    const contentType = req.headers.get("content-type") || ""

    // Handle MTN Mobile Money payment
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()

      // Extract data from form
      const paymentProof = formData.get("paymentProof") as File
      const address = formData.get("address") as string
      const phone = formData.get("phone") as string
      const email = (formData.get("email") as string) || ""
      const additionalInfo = (formData.get("additionalInfo") as string) || ""

      // Get product IDs from URL query params or form data
      let productIds: string[] = []
      const productIdsString = formData.get("productIds") as string

      if (productIdsString) {
        try {
          productIds = JSON.parse(productIdsString)
        } catch (error) {
          console.error("Error parsing productIds:", error)
        }
      }

      if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 })
      }

      // Create order in database
      const order = await prismadb.order.create({
        data: {
          storeId: params.storeId,
          isPaid: true, // Mark as paid since we have proof
          address: address,
          phone: phone,
          orderItems: {
            create: productIds.map((productId: string) => ({
              product: {
                connect: {
                  id: productId,
                },
              },
            })),
          },
        },
      })

      // Mark products as archived (sold)
      await prismadb.product.updateMany({
        where: {
          id: {
            in: [...productIds],
          },
        },
        data: {
          isArchived: true,
        },
      })

      return NextResponse.json(
        { success: true, orderId: order.id },
        {
          headers: corsHeaders,
        },
      )
    }
    // Handle Stripe payment
    else {
      const { productIds } = await req.json()

      if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 })
      }

      const products = await prismadb.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      })

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

      products.forEach((product) => {
        line_items.push({
          quantity: 1,
          price_data: {
            currency: "RWF",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
        })
      })

      const order = await prismadb.order.create({
        data: {
          storeId: params.storeId,
          isPaid: false,
          orderItems: {
            create: productIds.map((productId: string) => ({
              product: {
                connect: {
                  id: productId,
                },
              },
            })),
          },
        },
      })

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
          enabled: true,
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata: {
          orderId: order.id,
        },
      })

      return NextResponse.json(
        { url: session.url },
        {
          headers: corsHeaders,
        },
      )
    }
  } catch (error) {
    console.log("[CHECKOUT_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
