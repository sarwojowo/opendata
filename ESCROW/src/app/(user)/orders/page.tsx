"use client";

import styles from "./orders.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  id: string;
  service: {
    name: string;
    image_url: string;
    price: string;
  };
  status: string;
  created_at: string;
  escrow?: {
    escrow_address: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders");
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleRowClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_ACCEPTANCE":
        return "Waiting Deposit";
      case "IN_PROGRESS":
        return "In Progress";
      case "DELIVERED":
        return "In Review";
      case "COMPLETED":
        return "Completed";
      case "DISPUTED":
        return "Disputed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING_ACCEPTANCE":
        return styles.status_created;
      case "IN_PROGRESS":
        return styles.status_progress;
      case "DELIVERED":
        return styles.status_review;
      case "COMPLETED":
        return styles.status_completed;
      case "DISPUTED":
        return styles.status_disputed;
      case "CANCELLED":
        return styles.status_cancelled;
      default:
        return "";
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (orders.length === 0) {
    return <p>No orders yet</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Orders</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Preview</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order.id)}
                className={styles.row}
              >
                <td className={styles.td}>
                  <Image
                    src={order.service.image_url}
                    alt={order.service.name}
                    width={50}
                    height={50}
                    className={styles.image}
                  />
                </td>

                <td className={styles.td}>
                  {order.service.name}
                </td>

                <td className={styles.td}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>

                <td className={styles.td}>
                  {Number(order.service.price)}ETH
                </td>

                <td className={styles.td}>
                  <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}