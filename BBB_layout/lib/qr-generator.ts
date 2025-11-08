import QRCode from "qrcode"

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const qrCode = await QRCode.toBuffer(data, {
      width: 200,
      margin: 1,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code buffer:", error)
    throw error
  }
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code data URL:", error)
    throw error
  }
}
