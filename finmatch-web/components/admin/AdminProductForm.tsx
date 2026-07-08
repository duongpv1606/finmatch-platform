"use client";

import { useState } from "react";
import { FinancialProduct, ProductCategory } from "@/types";
import { CreateProductInput, createProduct, updateProduct } from "@/services/productsService";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "loan", label: "Vay vốn" },
  { value: "card", label: "Thẻ tín dụng" },
  { value: "insurance", label: "Bảo hiểm" },
  { value: "invest", label: "Đầu tư" },
  { value: "savings", label: "Tiết kiệm" },
];

export function AdminProductForm({
  editing,
  onDone,
  onCancel,
}: {
  editing: FinancialProduct | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<ProductCategory>(editing?.category ?? "loan");
  const [bankId, setBankId] = useState(editing?.bankId ?? "");
  const [bankName, setBankName] = useState(editing?.bankName ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [interestRate, setInterestRate] = useState(editing?.interestRate ?? 6.5);
  const [minAmount, setMinAmount] = useState((editing?.minAmount ?? 100_000_000) / 1e6);
  const [maxAmount, setMaxAmount] = useState((editing?.maxAmount ?? 1_000_000_000) / 1e6);
  const [tags, setTags] = useState(editing?.tags.join(", ") ?? "");
  const [sourceUrl, setSourceUrl] = useState(editing?.sourceUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!bankName || !name || interestRate < 0 || interestRate > 100) {
      setError("Điền đủ Ngân hàng, Tên sản phẩm, và lãi suất hợp lệ (0-100%)");
      return;
    }
    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editing) {
        await updateProduct(editing.id, { interestRate, tags: tagList, sourceUrl: sourceUrl || undefined });
      } else {
        const input: CreateProductInput = {
          category,
          bankId: bankId || bankName.toLowerCase().replace(/\s+/g, "-"),
          bankName,
          name,
          interestRate,
          minAmount: Math.round(minAmount * 1e6),
          maxAmount: Math.round(maxAmount * 1e6),
          tags: tagList,
          sourceUrl: sourceUrl || undefined,
        };
        await createProduct(input);
      }
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 className="mb14">{editing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="calc-input-group">
          <label className="calc-label">Danh mục</label>
          <select
            className="calc-input"
            value={category}
            disabled={!!editing}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Tên ngân hàng</label>
          <input
            className="calc-input"
            value={bankName}
            disabled={!!editing}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Vietcombank"
          />
        </div>
        <div className="calc-input-group" style={{ gridColumn: "span 2" }}>
          <label className="calc-label">Tên sản phẩm</label>
          <input
            className="calc-input"
            value={name}
            disabled={!!editing}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vay mua nhà lãi suất ưu đãi"
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Lãi suất (%/năm)</label>
          <input
            className="calc-input"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(+e.target.value)}
          />
        </div>
        <div />
        <div className="calc-input-group">
          <label className="calc-label">Hạn mức tối thiểu (triệu)</label>
          <input
            className="calc-input"
            type="number"
            value={minAmount}
            disabled={!!editing}
            onChange={(e) => setMinAmount(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Hạn mức tối đa (triệu)</label>
          <input
            className="calc-input"
            type="number"
            value={maxAmount}
            disabled={!!editing}
            onChange={(e) => setMaxAmount(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Tags (cách nhau dấu phẩy)</label>
          <input
            className="calc-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ưu đãi năm đầu, Duyệt nhanh"
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Nguồn (URL, tuỳ chọn)</label>
          <input
            className="calc-input"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-calc" onClick={handleSubmit} disabled={saving} style={{ width: "auto", padding: "10px 20px" }}>
          {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid var(--gray-200)",
            borderRadius: 9,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--gray-500)",
            cursor: "pointer",
          }}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}
