import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PaymentPage from "./pages/Payment"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFail from "./pages/PaymentFail"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Payment Page */}
        <Route path="/payment/:paymentId" element={<PaymentPage />} />

        {/* Result Pages */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-fail" element={<PaymentFail />} />

        {/* 404 Fallback - redirect to payment fail */}
        <Route path="*" element={<Navigate to="/payment-fail" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

