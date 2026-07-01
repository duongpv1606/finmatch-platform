import { ChatMessage } from "@/types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`chat-msg${isUser ? " chat-user" : ""}`}>
      <div className="chat-av">{isUser ? "🧑" : "🤖"}</div>
      <div className={`chat-bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
        {message.content.split("\n").map((line, i) => (
          <p key={i} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
        {message.streaming && <span className="typing-cursor">▌</span>}
      </div>
    </div>
  );
}
