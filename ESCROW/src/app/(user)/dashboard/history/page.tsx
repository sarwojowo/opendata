"use client";

import styles from "./history.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface HistoryItem {
  id: string;
  type: string;
  created_at: string;
  order: {
    id: string;
    service: {
      name: string;
      image_url: string;
      price: string;
    };
  };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/history");

        console.log("HISTORY:", res.data.data);

        setHistory(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>History</h1>
      <p className={styles.subtitle}>
        View your completed commissions.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={4}>No history found</td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => router.push(`/orders/${item.order.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <Image
                      src={item.order.service.image_url}
                      alt={item.order.service.name}
                      width={50}
                      height={50}
                    />
                  </td>

                  <td>{item.order.service.name}</td>

                  <td>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td>{item.order.service.price} ETH</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}