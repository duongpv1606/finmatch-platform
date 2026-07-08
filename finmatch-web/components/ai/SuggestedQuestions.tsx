const SUGGESTIONS = [
  "Tôi thu nhập 20 triệu/tháng, có thể vay mua nhà bao nhiêu?",
  "So sánh lãi suất vay mua nhà VCB vs Techcombank",
  "Thẻ tín dụng nào hoàn tiền tốt nhất 2025?",
];

export function SuggestedQuestions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="card">
      <h3 className="mb14">Câu hỏi gợi ý</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SUGGESTIONS.map((s) => (
          <div
            key={s}
            onClick={() => onPick(s)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              border: "1px solid var(--gray-200)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--gray-600)",
            }}
          >
            <i className="ti ti-message-circle" style={{ color: "var(--blue)", fontSize: 14, flexShrink: 0 }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
