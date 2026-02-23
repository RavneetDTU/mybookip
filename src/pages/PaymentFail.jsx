export default function PaymentFail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Payment Failed ❌
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be completed. Please try again.
        </p>
        <a
          href="/"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Try Again
        </a>
      </div>
    </div>
  )
}
