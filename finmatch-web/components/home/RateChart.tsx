"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getProducts, getRateHistory } from "@/services/productsService";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function RateChart() {
  const [months, setMonths] = useState(6);

  // Chart tracks a real "loan" product's rate over time — fetch the
  // cheapest loan product first, then pull its history. No more hardcoded
  // fake product id.
  const { data: loanProducts } = useQuery({
    queryKey: ["products", "loan", "for-chart"],
    queryFn: () => getProducts("loan"),
  });
  const productId = loanProducts?.[0]?.id;

  const { data } = useQuery({
    queryKey: ["rateHistory", productId, months],
    queryFn: () => getRateHistory(productId as string, months),
    enabled: Boolean(productId),
  });

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Xu hướng lãi suất</div>
          <h3>Biểu đồ lãi suất vay mua nhà 2024–2025</h3>
        </div>
        <div className="tabs" style={{ width: 200, marginBottom: 0 }}>
          {[
            { m: 6, label: "6T" },
            { m: 12, label: "1N" },
            { m: 24, label: "2N" },
          ].map((t) => (
            <div
              key={t.m}
              className={`tab${months === t.m ? " active" : ""}`}
              onClick={() => setMonths(t.m)}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>
      <div className="chart-wrap" style={{ height: 240 }}>
        {!productId && (
          <div style={{ color: "var(--gray-400)", fontSize: 13, padding: 20 }}>
            Chưa có sản phẩm vay nào trong hệ thống. Chạy{" "}
            <code>npm run seed</code> ở backend để có dữ liệu mẫu.
          </div>
        )}
        {data && (
          <Line
            data={{
              labels: data.map((p) => p.date),
              datasets: [
                {
                  label: "Lãi suất (%)",
                  data: data.map((p) => p.rate),
                  borderColor: "#2563EB",
                  backgroundColor: "rgba(37,99,235,.08)",
                  fill: true,
                  tension: 0.35,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: false } },
            }}
          />
        )}
      </div>
    </div>
  );
}
