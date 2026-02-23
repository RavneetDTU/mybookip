export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Your reservation is confirmed. We look forward to serving you!
        </p>
      </div>
    </div>
  )
}
