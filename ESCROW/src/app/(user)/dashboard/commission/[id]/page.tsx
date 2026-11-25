"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { ethers } from "ethers"
import axios from "axios"
import styles from "./commissiondetail.module.css"

const ESCROW_ABI = [
  "function startWork()",
  "function submitWork(string _cid)",
  "function withdraw()",
  "function autoRelease()",
  "function rejectOrderByArtist(string reason)"
]

export default function CommissionDetail() {
  const params = useParams()
  const id = params.id as string

  const [commission, setCommission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadedHash, setUploadedHash] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [action, setAction] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState("")

  // ===========================
  // FETCH
  // ===========================
  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`)
      setCommission(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  // ===========================
  // STATES (SETELAH ADA DATA)
  // ===========================
  const isStarted = Boolean(commission?.escrow?.started)

const deadline = isStarted
  ? commission?.escrow?.work_deadline
  : commission?.escrow?.start_deadline

  const isExpired = deadline && Date.now() > Number(deadline) * 1000


  const getEscrowContract = async () => {
    if (!window.ethereum) throw new Error("No wallet")

    if (!commission?.escrow?.escrow_address) {
      throw new Error("Escrow not ready")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    return new ethers.Contract(
      commission.escrow.escrow_address,
      ESCROW_ABI,
      signer
    )
  }

  const handleStartWork = async () => {
    try {
      setAction("start")
      const escrow = await getEscrowContract()
      const tx = await escrow.startWork()
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)
      await fetchDetail()
    } catch {
      alert("Start failed")
    } finally {
      setAction(null)
    }
  }

  const handleSubmitWork = async () => {
    if (!uploadedHash) return alert("Upload first")

    try {
      setAction("submit")
      const escrow = await getEscrowContract()
      const tx = await escrow.submitWork(uploadedHash)
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)
      await fetchDetail()
    } catch {
      alert("Submit failed")
    } finally {
      setAction(null)
    }
  }

  const handleAutoRelease = async () => {
    try {
      setAction("release")
      const escrow = await getEscrowContract()
      const tx = await escrow.autoRelease()
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)
      await fetchDetail()
    } catch {
      alert("Release failed")
    } finally {
      setAction(null)
    }
  }

  const handleWithdraw = async () => {
    try {
      setAction("withdraw")
      const escrow = await getEscrowContract()
      const tx = await escrow.withdraw()
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)
      await fetchDetail()
    } catch {
      alert("Withdraw failed")
    } finally {
      setAction(null)
    }
  }

  const handleReject = async () => {
    const reason = prompt("Enter reject reason")
    if (!reason) return

    try {
      setAction("reject")

      if (!commission.escrow) {
        await axios.post(`/api/orders/${id}/reject`, { reason })
        await fetchDetail()
        return
      }

      const escrow = await getEscrowContract()
      const tx = await escrow.rejectOrderByArtist(reason)
      await tx.wait()

      await axios.post(`/api/orders/${id}/sync`)
      await fetchDetail()

    } catch (err) {
      console.error(err)
      alert("Reject failed")
    } finally {
      setAction(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return alert("Select file first")

    try {
      setAction("upload")

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setUploadedHash(data.ipfsHash)
    } catch {
      alert("Upload failed")
    } finally {
      setAction(null)
    }
  }


  useEffect(() => {
    if (!deadline) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Number(deadline) * 1000 - now

      if (diff <= 0) {
        setTimeLeft("Deadline passed")
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      setTimeLeft(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  if (loading) return <p>Loading...</p>
  if (!commission) return <p>Order not found</p>

  // ===========================
  // CANCELLED
  // ===========================
  if (commission.status === "CANCELLED") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{commission.service.title}</h1>
        <p className={styles.rejectedTitle}>Order has been cancelled</p>

        {commission.escrow?.reject_reason && (
          <div className={styles.rejectedBox}>
            <p><b>Reason:</b> {commission.escrow.reject_reason}</p>
            <p>By: {commission.escrow.rejected_by}</p>
          </div>
        )}
      </div>
    )
  }

  // ===========================
  // UI
  // ===========================
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{commission.service.title}</h1>

      {/* REFERENCE IMAGE */}
      {commission.reference_image_url && (
        <div className={styles.section}>
          <h3>Reference Image</h3>
          <Image
            src={commission.reference_image_url}
            alt="reference"
            width={300}
            height={300}
            className={styles.image}
          />
        </div>
      )}

      <p className={styles.info}>Escrow: {commission.escrow?.escrow_address}</p>
      <p className={styles.info}>Amount: {commission.service.price} ETH</p>

      <hr className={styles.divider} />

      {/* REJECT INFO */}
      {commission.escrow?.reject_reason && (
        <div className={styles.rejectedBox}>
          <h3 className={styles.rejectedTitle}>Rejected</h3>
          <p><b>Reason:</b> {commission.escrow.reject_reason}</p>
          <p>By: {commission.escrow.rejected_by}</p>
        </div>
      )}

      {/* CLIENT NOTE */}
      <div className={styles.section}>
        <h3>Client Notes</h3>
        {commission.note ? (
          <p className={styles.noteBox}>{commission.note}</p>
        ) : (
          <p className={styles.emptyNote}>No additional notes</p>
        )}
      </div>

      {/* PENDING_ACCEPTANCE */}
      {commission.status === "PENDING_ACCEPTANCE" && (
        <div className={styles.section}>
          <p className={styles.emptyNote}>Waiting client deposit</p>

          <button
            onClick={handleReject}
            className={`${styles.button} ${styles.dangerBtn}`}
            disabled={action !== null}
          >
            {action === "reject" ? "Rejecting..." : "Reject Order"}
          </button>
        </div>
      )}

      {/* IN PROGRESS */}
      {commission.status === "IN_PROGRESS" && (
        <div className={styles.section}>

        {/* 🔥 DEADLINE */}
        {deadline && (
          <div className={styles.deadlineBox}>
          <p>
            ⏳ {isStarted ? "Work deadline" : "Start deadline"}:{" "}
            {new Date(Number(deadline) * 1000).toLocaleString()}
          </p>
          </div>
        )}

          {!isStarted && (
            <div className={styles.buttonGroup}>
              <button
                onClick={handleStartWork}
                disabled={action !== null || isExpired}
                className={`${styles.button} ${styles.primaryBtn}`}
              >
                {action === "start" ? "Starting..." : "Start Work"}
              </button>

              <button
                onClick={handleReject}
                className={`${styles.button} ${styles.dangerBtn}`}
                disabled={action !== null}
              >
                Reject
              </button>
            </div>
          )}

          {isExpired && (
            <p style={{ color: "#ef4444" }}>
              ⚠️ Deadline passed. Client can cancel the order.
            </p>
          )}

          <p style={{ color: isExpired ? "#ef4444" : "#f59e0b" }}>
            Time left: {timeLeft}
          </p>

          {isStarted && (
            <div className={styles.uploadSection}>
              <h3>Submit Work</h3>

              <input
                type="file"
                onChange={(e) =>
                  e.target.files && setFile(e.target.files[0])
                }
              />

              <button
                onClick={handleUpload}
                className={`${styles.button} ${styles.warningBtn}`}
              >
                {action === "upload" ? "Uploading..." : "Upload"}
              </button>

              <button
                onClick={handleSubmitWork}
                disabled={!uploadedHash}
                className={`${styles.button} ${styles.successBtn}`}
              >
                {action === "submit" ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* DELIVERED */}
      {commission.status === "DELIVERED" && (
        <button
          onClick={handleAutoRelease}
          className={`${styles.button} ${styles.primaryBtn}`}
        >
          {action === "release" ? "Releasing..." : "Auto Release"}
        </button>
      )}

      {/* COMPLETED */}
      {commission.status === "COMPLETED" && (
        <button
          onClick={handleWithdraw}
          className={`${styles.button} ${styles.successBtn}`}
        >
          {action === "withdraw" ? "Withdrawing..." : "Withdraw"}
        </button>
      )}
    </div>
  )
}