"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Image from "next/image"
import styles from "./arbiter-detail.module.css"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useChat } from "@/app/ui/chat/ChatProvider"

const ESCROW_ABI = [
  "function resolveDispute(bool)",
  "function status() view returns (uint8)"

]

export default function ArbiterDetail() {
  const { id } = useParams()
  const { data: session, status } = useSession()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const { startDisputeChat } = useChat()


  const ARBITER_ADDRESS =
    process.env.NEXT_PUBLIC_ARBITER_ADDRESS?.toLowerCase()

  const wallet = session?.user?.wallet?.toLowerCase()

  const isArbiter =
    wallet && ARBITER_ADDRESS && wallet === ARBITER_ADDRESS

  // =========================
  // Fetch
  // =========================
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`)
      setOrder(res.data.data)
    } catch (err) {
      console.error(err)
      alert("Failed to fetch order")
    }
  }

    useEffect(() => {
    if (id) fetchOrder()
  }, [id])

  // =========================
  // PROTECT PAGE
  // =========================
  if (status === "loading") return <p>Loading...</p>

  if (!session) return <p>Unauthorized</p>

  if (!isArbiter) return <p>Forbidden ❌</p>


  // =========================
  // Resolve Dispute
  // =========================
  const resolve = async (release: boolean) => {
    if (loading) return // 🚫 BLOCK DOUBLE CLICK

    try {
      setLoading(true)

      if (!window.ethereum) {
        return alert("Install Metamask")
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const signerAddress = (await signer.getAddress()).toLowerCase()

      if (signerAddress !== ARBITER_ADDRESS) {
        return alert("❌ You are not the arbiter wallet!")
      }

      const contract = new ethers.Contract(
        order.escrow.escrow_address,
        ESCROW_ABI,
        signer
      )

      // =========================
      // 🔥 DEBUG DI SINI
      // =========================
      const status = await contract.status()
      console.log("ARB STATUS BEFORE RESOLVE:", status)

      if (status !== 2n) {
        alert("❌ Not in dispute anymore!")
        return
      }

      // =========================
      // LANJUT TRANSAKSI
      // =========================
      const tx = await contract.resolveDispute(release)
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)

      alert("Dispute resolved!")
      fetchOrder()

    } catch (err: any) {
      console.error(err)
      alert(err.reason || err.message || "Failed to resolve dispute")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // IPFS URL FIX
  // =========================
  const getIPFSUrls = (url: string) => {
    if (!url) return []

    // 🔥 ambil CID dari URL
    const cid = url.includes("/ipfs/")
      ? url.split("/ipfs/")[1]
      : url

    const gateways = [
      "https://cloudflare-ipfs.com/ipfs/",
      "https://ipfs.io/ipfs/",
      "https://gateway.pinata.cloud/ipfs/"
    ]

    return gateways.map(g => `${g}${cid}`)
  }

  if (!order) return <p>Loading order...</p>


  const urls = getIPFSUrls(order.escrow.submission_url)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚖️ Dispute Resolution</h1>

      {/* INFO */}
      <div className={styles.card}>
        <h2>{order.service.name}</h2>

        <p><b>Order ID:</b> {order.id}</p>
        <p><b>Amount:</b> {order.service.price} ETH</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Escrow:</b> {order.escrow?.escrow_address}</p>
      </div>

      {/* PARTIES */}
      <div className={styles.parties}>
        <div className={styles.party}>
          <h3>👤 Client</h3>
          <p>{order.user?.wallet}</p>
        </div>

        <div className={styles.party}>
          <h3>🎨 Artist</h3>
          <p>{order.service?.creator?.user?.wallet}</p>
        </div>
      </div>

      {/* ARTWORK */}
      {order.escrow?.submission_url && (
        <div className={styles.card}>
          <h3>Submitted Work</h3>

          {urls.length > 0 && (
            <img
              src={urls[imgIndex]}
              width={300}
              alt="artwork"
              onError={() => {
                if (imgIndex < urls.length - 1) {
                  setImgIndex(prev => prev + 1)
                }
              }}
            />
          )}
        </div>
      )}

      {/* ACTIONS */}
      {order.status === "DISPUTED" && (
        <div className={styles.actions}>
          <button
            onClick={() => startDisputeChat(String(order.id))}
            className={styles.release}
            style={{ backgroundColor: "#4a90e2" }}
          >
            💬 Open Group Chat
          </button>

          <button
            onClick={() => resolve(true)}
            disabled={loading}
            className={styles.release}
          >
            {loading ? "Processing..." : "Release to Artist"}
          </button>

          <button
            onClick={() => resolve(false)}
            disabled={loading}
            className={styles.refund}
          >
            {loading ? "Processing..." : "Refund to Client"}
          </button>
        </div>
      )}
    </div>
  )
}