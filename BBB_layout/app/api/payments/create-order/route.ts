import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel } from "@/lib/models"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { amount, registrationId } = await req.json()

    if (!amount || !registrationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    // Make request to Razorpay API
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: registrationId,
        notes: {
          registration_id: registrationId,
        },
      }),
    })

    const orderData = await response.json()

    if (!response.ok) {
      console.error("Razorpay error:", orderData)
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
    }

    // Store payment record in database
    await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderData.id },
      {
        registrationId,
        razorpayOrderId: orderData.id,
        amount,
        status: "pending",
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      orderId: orderData.id,
      amount: amount,
      currency: "INR",
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
