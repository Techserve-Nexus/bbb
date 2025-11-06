import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { generateRegistrationId } from "@/lib/utils"

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
      conclavGroups = []
    } = body

    // Validate required fields
    if (!name || !chapterName || !category || !contactNo || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
      paymentStatus: "pending",
      spouseName,
      children,
      participations,
      conclavGroups,
    })

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
