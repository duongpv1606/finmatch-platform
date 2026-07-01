"use client";

import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/services/marketService";

export function NewsList() {
  const { data } = useQuery({ queryKey: ["news"], queryFn: () => getNews(5) });

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Tin tức</div>
          <h3>Tin tài chính mới nhất</h3>
        </div>
        <a>Xem tất cả →</a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data?.map((n) => (
          <a
            key={n.id}
            href={n.url}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid var(--gray-100)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 3 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                {n.source} · {new Date(n.publishedAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
