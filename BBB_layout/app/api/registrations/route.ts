import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { generateRegistrationId } from "@/lib/utils"
import { sendEmail, getRegistrationEmailTemplate } from "@/lib/email"

export const runtime = "nodejs"
export const maxDuration = 30 // Max 30 seconds

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const body = await req.json()
    const { 
      name, 
      chapterName, 
      category, 
      contactNo, 
      email, 
      ticketType = "Silver",
      spouseName,
      children = [],
      participations = [],
      conclavGroups = [],
      paymentScreenshotUrl,
    } = body

    // Validate required fields
    if (!name || !chapterName || !category || !contactNo || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!paymentScreenshotUrl) {
      return NextResponse.json({ error: "Payment screenshot is required" }, { status: 400 })
    }

    const registrationId = generateRegistrationId()

    const registration = await RegistrationModel.create({
      registrationId,
      name,
      chapterName,
      category,
      contactNo,
      email,
      ticketType,
      paymentStatus: "pending", // Will be verified by admin
      spouseName,
      children,
      participations,
      conclavGroups,
      paymentScreenshotUrl,
    })

    // Send registration confirmation email (async, don't wait)
    try {
      const emailHTML = getRegistrationEmailTemplate({
        name,
        registrationId,
        ticketType,
        email,
        contactNo,
        chapterName,
      })

      await sendEmail({
        to: email,
        subject: `Registration Successful - ${registrationId}`,
        html: emailHTML,
      })

      console.log("Registration email sent to:", email)
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.registrationId,
      message: "Registration created successfully",
    })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const registration = await RegistrationModel
      .findOne({ email })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(registration || null)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
  }
}
