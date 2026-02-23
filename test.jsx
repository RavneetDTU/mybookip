import { useEffect, useState } from "react"
import axios from "axios"
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


  // //signature generation
  // const generateSignature = (data, passPhrase = null) => {
  //   // Create parameter string
  //   let pfOutput = "";
  //   for (let key in data) {
  //     if (data.hasOwnProperty(key)) {
  //       if (data[key] !== "") {
  //         pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
  //       }
  //     }
  //   }

  //   // Remove last ampersand
  //   let getString = pfOutput.slice(0, -1);
  //   if (passPhrase !== null) {
  //     getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  //   }

  //   return crypto.createHash("md5").update(getString).digest("hex");
  // };


  // dynamic form


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

        <form
          action="https://sandbox.payfast.co.za/eng/process"
          method="post"
          className="mt-6"
        >
          <input type="hidden" name="merchant_id" value="10000100" />
          <input type="hidden" name="merchant_key" value="46f0cd694581a" />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="item_name" value={`Booking for ${booking.customerName}`} />
          <input
            type="hidden"
            name="return_url"
            value={`${window.location.origin}/payment-success`}
          />
          <input
            type="hidden"
            name="cancel_url"
            value={`${window.location.origin}/payment-fail`}
          />
          <input type="hidden" name="m_payment_id" value={paymentId} />

          <div className="flex gap-4">
            <button className="flex-1 cursor-pointer bg-green-600 text-white py-3 rounded-lg">
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
