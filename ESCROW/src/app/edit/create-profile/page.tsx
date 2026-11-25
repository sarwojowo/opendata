"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {useSession} from "next-auth/react";
import {getCurrentUser} from "@/lib/getCurrentUser";

interface UserProfile {
  id: string
  wallet: string
  name?: string
  biodata?: string
  profile_image_url?: string
  background_image_url?: string
}

export default function CreateProfile() {
  const { data: session,status} = useSession();
  const [name, setName] = useState("")
  const [biodata, setBiodata] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const wallet = session?.user.wallet

  // ===============================
  // Upload file ke Pinata
  // ===============================
  const uploadToPinata = async (file: File) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
    const formData = new FormData()
    formData.append("file", file)

    const res = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
      },
    })

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
  }

  // ===============================
  // Fetch user profile jika sudah ada
  // ===============================
  useEffect(() => {
    if (status === 'loading') {
      return
    }
    if (!session) {
      router.push("/")
      return
    }

    if (!wallet) return

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${wallet}`)
        const user: UserProfile = res.data
        if (user) {
          setName(user.name || "")
          setBiodata(user.biodata || "")
        }
      } catch {
        console.log("Profile not found, akan buat baru")
      }
    }

    fetchProfile()
  }, [session, status, router])

  // ===============================
  // Submit Create / Update
  // ===============================
  const createUserProfile = async () => {
    if (!session?.user.wallet) {
      setError("DID atau wallet tidak ditemukan")
      return
    }
    if (!name) {
      setError("Username required")
      return
    }

    setLoading(true)
    setError("")

    try {
      let avatarUrl = ""
      if (avatar) {
        avatarUrl = await uploadToPinata(avatar)
      }

      const payload = {
        wallet,
        name,
        biodata,
        profile_image_url: avatarUrl || undefined,
      }

      // panggil API create/update user
      await axios.post("/api/users", payload)

      // redirect setelah selesai
      router.push("/")

    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Gagal menyimpan user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>Create Profile</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0])
          }
        }}
      />

      <br /><br />

      <input
        placeholder="Username"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "8px", fontSize: "16px" }}
      />

      <br /><br />

      <textarea
        placeholder="Biodata"
        value={biodata}
        onChange={(e) => setBiodata(e.target.value)}
        style={{ width: "100%", padding: "8px", fontSize: "16px", minHeight: "100px" }}
      />

      <br /><br />

      <button
        onClick={createUserProfile}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  )
}