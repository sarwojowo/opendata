"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import axios from "axios";

const ESCROW_ABI = [
  "function deposit() payable",
  "function approveWork()",
  "function raiseDispute()",
  "function withdraw()",
  "function cancelIfNoResponse()",
  "function client() view returns (address)",
  "function status() view returns (uint8)"
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // =========================
  // Fetch
  // =========================
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load order");
    }
  }

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // =========================
  // Countdown
  // =========================
  useEffect(() => {
    if (!order?.escrow?.review_deadline) return;

    const deadline = new Date(order.escrow.review_deadline).getTime();

    const interval = setInterval(() => {
      const diff = deadline - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval)
      }

      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // =========================
  // Contract
  // =========================
  const getContract = async () => {
    if (!window.ethereum) {
      throw new Error("Metamask not installed");
    }

    const provider = new ethers.BrowserProvider(
      window.ethereum as any // 🔥 FIX TS ERROR
    );

    const signer = await provider.getSigner();

    return new ethers.Contract(
      order.escrow.escrow_address,
      ESCROW_ABI,
      signer
    );
  };

  const getSignerWithValidation = async () => {
    if (!window.ethereum) {
      throw new Error("Metamask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();

    if (!order?.escrow?.client_address) {
      throw new Error("Order not ready");
    }

    const signerAddress = (await signer.getAddress()).toLowerCase();

    if (signerAddress !== order.escrow.client_address.toLowerCase()) {
      throw new Error("Wrong wallet");
    }

    return signer;
  };

  // =========================
  // STATUS UI
  // =========================
  const getStatus = () => {
    switch (order.status) {
      case "PENDING_ACCEPTANCE":
        return "Waiting for deposit"
      case "IN_PROGRESS":
        return "Artist working"
      case "DELIVERED":
        return "Review artwork"
      case "DISPUTED":
        return "In Dispute"
      case "COMPLETED":
        return "Completed"
      case "CANCELLED":
        return "Cancelled"
      default:
        return order.status
    }
  };

  const getMessage = () => {
    switch (order.status) {
      case "PENDING_ACCEPTANCE":
        return "Please deposit escrow to start the project"
      case "IN_PROGRESS":
        return "Artist is working on your order"
      case "DELIVERED":
        return "Review and approve the work"
      case "COMPLETED":
        return "You can withdraw if needed"
      case "DISPUTED":
        return "Waiting for arbiter resolution"
      case "CANCELLED":
        return "Order has been cancelled"
      default:
        return ""
    }
  };

  // =========================
  // ACTIONS
  // =========================
  const handleDeposit = async () => {
    try {
      setLoadingAction("deposit");

      if (!window.ethereum) {
        return alert("Metamask not installed");
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;
      const arbiterAddress = process.env.NEXT_PUBLIC_ARBITER_ADDRESS!;

      const factory = new ethers.Contract(
        factoryAddress,
        [
          "function createEscrow(address _artist, address _arbiter) returns (address)",
          "event EscrowCreated(address escrow, address client, address artist, address arbiter)"
        ],
        signer
      );

      const artistAddress = order?.service?.creator?.user?.wallet;

      if (!artistAddress) {
        throw new Error("Artist wallet not found");
      }

      // =========================
      // 🔥 CREATE ESCROW VIA FACTORY
      // =========================
      const tx = await factory.createEscrow(
        artistAddress,
        arbiterAddress
      );

      const receipt = await tx.wait();

      // =========================
      // 🔥 GET ESCROW ADDRESS FROM EVENT
      // =========================
      let escrowAddress = "";

      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed?.name === "EscrowCreated") {
            escrowAddress = parsed.args[0];
          }
        } catch {}
      }

      if (!escrowAddress) {
        throw new Error("Escrow address not found");
      }

      // =========================
      // 🔥 CALL DEPOSIT
      // =========================
      const escrow = new ethers.Contract(
        escrowAddress,
        ESCROW_ABI,
        signer
      );

      const depositTx = await escrow.deposit({
        value: ethers.parseEther(String(order.service.price)),
      });

      await depositTx.wait();

      await new Promise((res) => setTimeout(res, 2000))

      // =========================
      // 🔥 SAVE TO BACKEND
      // =========================
      await axios.post(`/api/orders/${orderId}/escrow`, {
        escrowAddress,
        txHash: depositTx.hash
      });

      alert("Escrow funded!");
      await fetchOrder();

    } catch (err: any) {
      console.error(err);
      alert(err.reason || err.message || "Deposit failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = async () => {
    try {
      setLoadingAction("approve");

      const signer = await getSignerWithValidation();

      const escrow = new ethers.Contract(
        order.escrow.escrow_address,
        ESCROW_ABI,
        signer
      );
      await (await escrow.approveWork()).wait();

      await axios.post(`/api/orders/${orderId}/sync`);
      await fetchOrder();

    } catch (err: any) {
      console.error(err);
      alert(err.reason || err.message || "Approve failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDispute = async () => {
    console.log("🔥 CLICKED DISPUTE"); // ⬅️ WAJIB
    try {
      setLoadingAction("dispute");

      const signer = await getSignerWithValidation();

      const escrow = new ethers.Contract(
        order.escrow.escrow_address,
        ESCROW_ABI,
        signer
      );

      // 🔥 BEFORE
      const before = await escrow.status();
      console.log("STATUS BEFORE:", before);

      const tx = await escrow.raiseDispute();
      await tx.wait();

      // 🔥 AFTER
      const after = await escrow.status();
      console.log("STATUS AFTER:", after);

      await axios.post(`/api/orders/${orderId}/sync`);
      await fetchOrder();

    } catch (err: any) {
      console.error(err);
      alert(err.reason || err.message || "Dispute failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    try {
      setLoadingAction("cancel");

      const signer = await getSignerWithValidation();

      const escrow = new ethers.Contract(
        order.escrow.escrow_address,
        ESCROW_ABI,
        signer
      );
      
      await (await escrow.cancelIfNoResponse()).wait();

      await axios.post(`/api/orders/${orderId}/sync`);
      await fetchOrder();

    } catch  (err: any) {
      console.error(err)
      alert(err.reason || err.message || "Too early to cancel");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoadingAction("withdraw");

      const signer = await getSignerWithValidation();

      const escrow = new ethers.Contract(
        order.escrow.escrow_address,
        ESCROW_ABI,
        signer
      );
      await (await escrow.withdraw()).wait();

      await axios.post(`/api/orders/${orderId}/sync`);
      await fetchOrder();

    } catch (err: any) {
      console.error(err);
      alert(err.reason || err.message || "Withdraw failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = () => {
  const map: any = {
    PENDING_ACCEPTANCE: "#aaa",
    IN_PROGRESS: "#f0b90b",
    DELIVERED: "#38bdf8",
    COMPLETED: "#22c55e",
    CANCELLED: "#ef4444",
    DISPUTED: "#f97316"
  };

  return (
    <span style={{
      background: map[order.status],
      color: "#fff",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px"
    }}>
      {getStatus()}
    </span>
  );
};

  if (!order) return <p>Loading...</p>;
  console.log("ORDER STATUS:", order.status);


  const getIPFSUrl = (url: string) => {

    if (!url) return "";

    if (url.startsWith("http")) return url;

    return `https://cloudflare-ipfs.com/ipfs/${url}`;

  };

  return (
    <div style={{ padding: 40 }}>
      <h1>{order.service.name}</h1>

      <Image
        src={order.service.image_url}
        alt={order.service.name}
        width={300}
        height={300}
      />

      <p><b>Status:</b> {getStatusBadge()}</p>
      <p style={{ color: "#888" }}>{getMessage()}</p>

      <p><b>Amount:</b> {Number(order.service.price).toFixed(4)} ETH</p>
      
      <hr />

      {/* 🔥 SHOW RESULT */}
      {order.escrow?.submission_url && (
        <div>
          <h3>Artwork</h3>

          {order.escrow.submission_url.endsWith(".mp4") ? (
            <video controls width={300}>
              <source src={`https://gateway.pinata.cloud/ipfs/${order.escrow.submission_url}`} />
            </video>
          ) : (
            <img
              src={getIPFSUrl(order.escrow.submission_url)}
              alt="artwork"
              width={300}
            />
          )}
        </div>
      )}

      {order.escrow?.reject_reason && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: "red" }}>Rejected</h3>
          <p>{order.escrow.reject_reason}</p>
        </div>
      )}

      {/* Deposit */}
      {!order.escrow && order.status === "PENDING_ACCEPTANCE" && (
        <button
          onClick={handleDeposit}
          disabled={loadingAction === "deposit"}
        >
          {loadingAction === "deposit" ? "Processing..." : "Deposit Escrow"}
        </button>
      )}

      {/* Cancel (artist ghosting) */}
      {order.escrow?.status === "FUNDED" && order.status === "IN_PROGRESS" && (
        <button onClick={handleCancel}
          disabled={loadingAction !== null} >
          Cancel & Refund
        </button>
      )}

      {/* Review */}
      {order.status === "DELIVERED" && (
        <>
          <p>⏳ {timeLeft}</p>

          <button onClick={handleApprove}
            disabled={loadingAction !== null} >
            Approve Work
          </button>

          <button onClick={handleDispute}
            disabled={loadingAction !== null} >
            Dispute
          </button>
        </>
      )}

      {/* Withdraw */}
      {order.escrow?.status === "REFUNDED" && (
        <button onClick={handleWithdraw}
          disabled={loadingAction !== null} >
          Withdraw Refund
        </button>
      )}

      {order.escrow?.start_deadline && (
        <p style={{ fontSize: 12 }}>
          Start deadline: {new Date(order.escrow.start_deadline).toLocaleString()}
        </p>
      )}

      {order.escrow?.rejected_by && (
        <p style={{ fontSize: 12 }}>
          By: {order.escrow.rejected_by}
        </p>
      )}
    </div>
  );
}