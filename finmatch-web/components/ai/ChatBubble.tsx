import { ChatMessage } from "@/types";

// Matches the original HTML's lightweight markdown: only **bold**, nothing
// else — intentionally simple, not a full markdown renderer.
//
// IMPORTANT: escape HTML entities FIRST, then apply the bold/newline
// transforms on the escaped text. Without this, a message containing
// something like `<img src=x onerror=alert(1)>` would execute as real
// HTML via dangerouslySetInnerHTML below — this used to be a real XSS hole.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatText(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`chat-msg${isUser ? " chat-user" : ""}`}>
      <div className={`chat-av ${isUser ? "av-user" : "av-ai"}`}>
        <i className={`ti ${isUser ? "ti-user" : "ti-sparkles"}`} style={{ fontSize: 12 }} />
      </div>
      <div>
        <div className={`chat-bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
          {message.streaming && !message.content ? (
            <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--gray-300)",
                    animation: `typing 1.2s infinite ${delay}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: formatText(message.content) }} />
          )}
        </div>
        {message.result && (
          <div className="ai-result-card">
            <div className="ai-result-title">{message.result.title}</div>
            {message.result.rows.map((r) => (
              <div className="ai-res-row" key={r[0]}>
                <span className="ai-res-label">{r[0]}</span>
                <span className={`ai-res-val${r[2] === "good" ? " good" : ""}`}>{r[1]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
