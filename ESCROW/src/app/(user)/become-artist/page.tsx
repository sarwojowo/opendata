"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from "axios"
import styles from "./become-artist.module.css"

export default function BecomeArtist() {
  const { data: session, status } = useSession()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push("/")
      return
    }

    // Check if user is already a creator
    const checkCreatorStatus = async () => {
      try {
        const res = await axios.get(`/api/users/${session.user.wallet}?includeCreatorStatus=true`)
        if (res.data.isCreator) {
          // Already a creator, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Error checking creator status:", err)
      }
    }

    checkCreatorStatus()
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }

    // Basic phone number validation
    const phoneRegex = /^[0-9+\-\s()]{1,13}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)

    try {
      await axios.post("/api/creator", {
        phoneNumber: phoneNumber.trim()
      })

      // Success! Redirect to dashboard
      alert("Congratulations! You are now an artist on PixelHub!")
      router.push("/dashboard")
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Failed to register as artist. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Become an Artist</h1>
        <p className={styles.subtitle}>
          Join our community of artists and start selling your services!
        </p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Phone Number <span className={styles.required}>*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+62 812 3456 7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
            <p className={styles.hint}>
              We'll use this number to make sure this your active account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Processing..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  )
}