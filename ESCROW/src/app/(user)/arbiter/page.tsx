"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./arbiter.module.css"
import axios from "axios"

interface Order {
  id: string
  status: string
  service: {
    name: string
    price: string
  }
}

export default function ArbiterPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/arbiter/orders")
        setOrders(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DISPUTED":
        return "In Dispute"
      case "COMPLETED":
        return "Resolved"
      case "CANCELLED":
        return "Refunded"
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "DISPUTED":
        return styles.status_dispute
      case "COMPLETED":
        return styles.status_completed
      case "CANCELLED":
        return styles.status_cancelled
      default:
        return ""
    }
  }

  if (loading) return <p>Loading disputes...</p>

  if (orders.length === 0) {
    console.log("dooor")
    return <p>No disputes 🎉</p>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚖️ Arbiter Dashboard</h1>
      <p className={styles.subtitle}>
        Manage disputes between clients and artists
      </p>

      <div className={styles.grid}>
        {orders.map((o) => (
          <div
            key={o.id}
            className={styles.card}
            onClick={() => router.push(`/arbiter/${o.id}`)}
          >
            <div className={styles.header}>
              <h3>{o.service.name}</h3>
              <span className={`${styles.status} ${getStatusClass(o.status)}`}>
                {getStatusLabel(o.status)}
              </span>
            </div>

            <p className={styles.amount}>
              {o.service.price} ETH
            </p>

            <p className={styles.meta}>
              Order ID: {o.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}