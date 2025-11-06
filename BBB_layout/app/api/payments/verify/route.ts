import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET).update(signatureBody).digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 })
    }

    // Update payment status in database
    const payment = await PaymentModel.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: "success",
        razorpayPaymentId,
        razorpaySignature,
      },
      { new: true }
    )

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const registrationId = payment.registrationId

    // Update registration payment status
    await RegistrationModel.findOneAndUpdate(
      { registrationId },
      {
        paymentStatus: "success",
        paymentId: razorpayPaymentId,
        paymentReference: razorpayOrderId,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      registrationId,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
