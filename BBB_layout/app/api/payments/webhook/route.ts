import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import connectDB from "@/lib/db"
import { PaymentModel } from "@/lib/models"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const webhookBody = await req.text()
    const razorpaySignature = req.headers.get("x-razorpay-signature")

    if (!razorpaySignature || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET).update(webhookBody).digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(webhookBody)

    // Handle payment.authorized event
    if (event.event === "payment.authorized") {
      const { order_id, id: paymentId } = event.payload.payment.entity

      await PaymentModel.findOneAndUpdate(
        { razorpayOrderId: order_id },
        {
          status: "success",
          razorpayPaymentId: paymentId,
        }
      )

      // Emit email notification (handled in next task)
      console.log("Payment authorized:", { orderId: order_id, paymentId })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
