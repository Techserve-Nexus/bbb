import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { sendEmail, getPaymentVerifiedEmailTemplate } from "@/lib/email"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get("x-admin-email")
    const adminPassword = req.headers.get("x-admin-password")

    if (
      !adminEmail ||
      !adminPassword ||
      adminEmail !== process.env.ADMIN_EMAIL ||
      adminPassword !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { registrationId, status } = await req.json()

    if (!registrationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["success", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update registration payment status
    const registration = await RegistrationModel.findOneAndUpdate(
      { registrationId },
      { paymentStatus: status },
      { new: true }
    )

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Send email if payment verified successfully
    if (status === "success") {
      try {
        const emailHTML = getPaymentVerifiedEmailTemplate({
          name: registration.name,
          registrationId: registration.registrationId,
          ticketType: registration.ticketType,
        })

        await sendEmail({
          to: registration.email,
          subject: `Payment Verified - ${registrationId}`,
          html: emailHTML,
        })

        console.log("Payment verification email sent to:", registration.email)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Don't fail the verification if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      registration: {
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email,
        paymentStatus: registration.paymentStatus,
      },
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
