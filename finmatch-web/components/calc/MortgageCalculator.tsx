"use client";

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

interface Result {
  monthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  totalPaid: number;
  years: number;
  balanceByYear: number[];
}

export function MortgageCalculator() {
  const [propertyValue, setPropertyValue] = useState(3000); // triệu VND
  const [downPayment, setDownPayment] = useState(900);
  const [rate, setRate] = useState(7.5); // % / năm
  const [years, setYears] = useState(20);
  const [result, setResult] = useState<Result | null>(null);

  function run() {
    const loan = (propertyValue - downPayment) * 1e6;
    const r = rate / 100 / 12;
    const n = years * 12;
    const pmt = r > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
    const totalPaid = pmt * n;
    const totalInterest = totalPaid - loan;

    const balanceByYear: number[] = [];
    let bal = loan;
    for (let i = 0; i < Math.min(years, 30); i++) {
      for (let j = 0; j < 12; j++) {
        const interest = bal * r;
        const principal = pmt - interest;
        bal -= principal;
      }
      balanceByYear.push(Math.max(Math.round(bal / 1e6), 0));
    }

    setResult({
      monthlyPayment: Math.round((pmt / 1e6) * 100) / 100,
      loanAmount: Math.round(propertyValue - downPayment),
      totalInterest: Math.round(totalInterest / 1e6),
      totalPaid: Math.round(totalPaid / 1e6),
      years,
      balanceByYear,
    });
  }

  return (
    <div className="grid-main">
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Vay mua nhà</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            Tính khoản trả hàng tháng
          </div>
        </div>

        <div className="calc-input-group">
          <label className="calc-label">Giá trị bất động sản (triệu VNĐ)</label>
          <input
            className="calc-input"
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Số tiền trả trước (triệu VNĐ)</label>
          <input
            className="calc-input"
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Lãi suất (%/năm)</label>
          <input
            className="calc-input"
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Thời hạn vay (năm)</label>
          <input
            className="calc-input"
            type="number"
            value={years}
            onChange={(e) => setYears(+e.target.value)}
          />
        </div>

        <button className="btn-calc" onClick={run}>
          Tính ngay
        </button>

        {result && (
          <>
            <div className="calc-result">
              <div className="calc-result-title">Khoản trả hàng tháng</div>
              <div className="calc-result-main">{fmt(result.monthlyPayment)} triệu</div>
              <div className="calc-details">
                <div className="calc-detail-row">
                  <span className="calc-detail-label">Số tiền vay</span>
                  <span className="calc-detail-val">{fmt(result.loanAmount)} triệu</span>
                </div>
                <div className="calc-detail-row">
                  <span className="calc-detail-label">Tổng lãi phải trả</span>
                  <span className="calc-detail-val">{fmt(result.totalInterest)} triệu</span>
                </div>
                <div className="calc-detail-row">
                  <span className="calc-detail-label">Tổng số tiền trả</span>
                  <span className="calc-detail-val">{fmt(result.totalPaid)} triệu</span>
                </div>
                <div className="calc-detail-row">
                  <span className="calc-detail-label">Thời hạn</span>
                  <span className="calc-detail-val">{result.years} năm</span>
                </div>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 220, marginTop: 14 }}>
              <Line
                data={{
                  labels: result.balanceByYear.map((_, i) => `Năm ${i + 1}`),
                  datasets: [
                    {
                      label: "Dư nợ còn lại (triệu)",
                      data: result.balanceByYear,
                      borderColor: "#10B981",
                      backgroundColor: "rgba(16,185,129,.08)",
                      fill: true,
                      tension: 0.3,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <h3 className="mb14">Gợi ý thông minh</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Trả trước ≥ 30% giá trị nhà giúp giảm đáng kể lãi phải trả.",
              "So sánh lãi suất cố định vs thả nổi trước khi ký hợp đồng.",
              "Khoản trả hàng tháng nên dưới 40% thu nhập để đảm bảo an toàn tài chính.",
            ].map((tip) => (
              <div
                key={tip}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: 10,
                  background: "var(--emerald-light)",
                  borderRadius: 8,
                }}
              >
                <i className="ti ti-bulb" style={{ color: "var(--emerald)", fontSize: 15, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "var(--emerald-dark)" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
