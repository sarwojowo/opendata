"use client"

import styles from './commission.module.css'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from "axios";

interface Commission {
  id: string
  title: string
  image: string
  deadline: string
  amount: number
  status: string
}

export default function CommissionPage() {

  const router = useRouter()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/creator/orders') // endpoint untuk creator
        setCommissions(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRowClick = (orderId: string) => {
    router.push(`/dashboard/commission/${orderId}`)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_ACCEPTANCE":
        return <span style={{ color: "#aaa" }}>Waiting Deposit</span>
      case "IN_PROGRESS":
        return <span className={styles.statusProgress}>In Progress</span>
      case "DELIVERED":
        return <span className={styles.statusReview}>In Review</span>
      case "DISPUTED":
        return <span className={styles.statusDispute}>Dispute</span>
      case "COMPLETED":
        return <span className={styles.statusCompleted}>Completed</span>
      case "CANCELLED":
        return <span style={{ color: "red" }}>Cancelled</span>
      default:
        return <span>{status}</span>
    }
  }

  const getAction = (commission: Commission) => {
    switch (commission.status) {

      case "PENDING_ACCEPTANCE":
        return <span style={{ color: "#888" }}>Waiting deposit</span>

      case "IN_PROGRESS":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/commission/${commission.id}`)
            }}
            style={btnStyle}
          >
            Work
          </button>
        )

      case "DELIVERED":
        return <span style={{ color: "#38bdf8" }}>Waiting Review</span>

      case "COMPLETED":
        return <span style={{ color: "#22c55e" }}>Done</span>

      case "CANCELLED":
        return <span style={{ color: "red" }}>Cancelled</span>

      default:
        return "-"
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Commission Management</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title</th>
              <th>Deadline</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {commissions.map((c) => (
              <tr
                key={c.id}
                onClick={() => handleRowClick(c.id)}
                className={styles.row}
              >
                <td>
                  <Image
                    src={c.image}
                    alt={c.title}
                    width={50}
                    height={50}
                  />
                </td>

                <td>{c.title}</td>
                <td>{c.deadline}</td>
                <td>{c.amount} ETH</td>

                <td>{getStatusLabel(c.status)}</td>

                <td>{getAction(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const btnStyle = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer"
}