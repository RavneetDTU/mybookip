import axios from "axios"

// Create API instance with environment-based configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - logs requests in development
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error("[API Request Error]", error)
    return Promise.reject(error)
  }
)

// Response interceptor - handles errors consistently
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.response.status}:`, error.response.data)
    } else if (error.request) {
      // Request made but no response
      console.error("[API Error] No response from server")
    } else {
      // Something else happened
      console.error("[API Error]", error.message)
    }
    return Promise.reject(error)
  }
)
