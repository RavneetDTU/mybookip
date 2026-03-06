import { useEffect, useState } from "react"
import { api } from "../api/api"
import CryptoJS from "crypto-js"

export default function PaymentPage() {
  const paymentId = window.location.pathname.split("/").pop()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchPayment() {
      try {
        setLoading(true)
        setError(null)

        const res = await api.get(`/api/payment/${paymentId}`)

        if (!res.data?.booking) {
          throw new Error("Invalid API response")
        }

        setData(res.data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [paymentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading booking details...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    )
  }

  const { booking } = data
  const amount = booking.numberOfGuests * 500

  // ─── Payfast Signature Generation ────────────────────────────────────────
  //
  // KEY RULE: Field ORDER matters for Payfast signature validation.
  // Do NOT sort alphabetically. Fields must appear in the exact order
  // documented by Payfast: merchant → customer → transaction → options.
  //
  const generateSignature = (pfData, passPhrase = null) => {
    let pfOutput = ""

    for (const key in pfData) {
      if (Object.prototype.hasOwnProperty.call(pfData, key)) {
        const val = pfData[key]
        if (val !== "" && val !== null && val !== undefined) {
          pfOutput += `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, "+")}&`
        }
      }
    }

    // Remove trailing ampersand
    let getString = pfOutput.slice(0, -1)

    // Append passphrase (set in Payfast Dashboard → Settings → Passphrase)
    if (passPhrase !== null && passPhrase !== "") {
      getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`
    }

    // MD5 hash → lowercase hex (Payfast requirement)
    return CryptoJS.MD5(getString).toString()
  }

  // Build pfData as a plain object — insertion order is preserved in modern JS,
  // so the keys below are in the exact Payfast-documented order.
  const pfData = {}

  // 1. Merchant details
  pfData["merchant_id"] = import.meta.env.VITE_PF_MERCHANT_ID || "10000100"
  pfData["merchant_key"] = import.meta.env.VITE_PF_MERCHANT_KEY || "46f0cd694581a"
  pfData["return_url"] = `${window.location.origin}/payment-success`
  pfData["cancel_url"] = `${window.location.origin}/payment-fail`
  // notify_url is optional — only include if configured
  if (import.meta.env.VITE_PF_NOTIFY_URL) {
    pfData["notify_url"] = import.meta.env.VITE_PF_NOTIFY_URL
  }

  // 2. Customer details
  const nameParts = (booking.customerName || "").trim().split(" ")
  pfData["name_first"] = nameParts[0] || ""
  pfData["name_last"] = nameParts.slice(1).join(" ") || ""
  pfData["email_address"] = booking.email || ""

  // 3. Transaction details
  pfData["m_payment_id"] = paymentId
  pfData["amount"] = Number(amount).toFixed(2)   // must be decimal string e.g. "500.00"
  pfData["item_name"] = `Booking for ${booking.customerName}`

  //pf data
  console.log("pfData", pfData)

  // Generate signature from the ordered data above
  const passPhrase = import.meta.env.VITE_PF_PASSPHRASE || null
  const signature = generateSignature(pfData, passPhrase)
  console.log("signature,", signature)

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-xl w-full rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Payment For Your Booking
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Hello, <span className="font-semibold">{booking.customerName}</span>!
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <Row label="Booking Name" value={booking.customerName} />
          <Row label="Phone Number" value={booking.phoneNumber} />
          <Row label="Booking Date" value={booking.bookingTime} />
          <Row label="Number of People" value={booking.numberOfGuests} />
          <Row label="Allergies" value={booking.allergies || "None"} />

          <div className="flex justify-between border-t pt-3 mt-3 font-semibold">
            <span>Booking Amount</span>
            <span>R {amount}</span>
          </div>
        </div>

        {/*
          Form fields must appear in the SAME order as pfData above.
          Payfast rebuilds the signature server-side from the posted fields
          in documented order — mismatched order = signature mismatch error.
        */}
        <form
          action="https://www.payfast.co.za/eng/process"
          method="post"
          className="mt-6"
        >
          {/* Merchant details */}
          <input type="hidden" name="merchant_id" value={pfData["merchant_id"]} />
          <input type="hidden" name="merchant_key" value={pfData["merchant_key"]} />
          <input type="hidden" name="return_url" value={pfData["return_url"]} />
          <input type="hidden" name="cancel_url" value={pfData["cancel_url"]} />
          {pfData["notify_url"] && (
            <input type="hidden" name="notify_url" value={pfData["notify_url"]} />
          )}

          {/* Customer details */}
          {pfData["name_first"] && <input type="hidden" name="name_first" value={pfData["name_first"]} />}
          {pfData["name_last"] && <input type="hidden" name="name_last" value={pfData["name_last"]} />}
          {pfData["email_address"] && <input type="hidden" name="email_address" value={pfData["email_address"]} />}

          {/* Transaction details */}
          <input type="hidden" name="m_payment_id" value={pfData["m_payment_id"]} />
          <input type="hidden" name="amount" value={pfData["amount"]} />
          <input type="hidden" name="item_name" value={pfData["item_name"]} />

          {/* Signature — always last */}
          <input type="hidden" name="signature" value={signature} />

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 cursor-pointer bg-green-600 text-white py-3 rounded-lg"
            >
              Pay R {amount}
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/payment-fail")}
              className="flex-1 cursor-pointer bg-red-600 text-white py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
