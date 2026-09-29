import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { chatResponses, getAutoResponse } from "@/lib/chatResponses";

interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  time: string;
}

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm CashPay Assistant. How can I help you today?\n\nYou can ask me about:\n• Buying Airtime or Data\n• Your Account & Balance\n• Transactions & Transfers\n• Is CashPay legit?\n• And much more!",
      sender: "assistant",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        text: getAutoResponse(text),
        sender: "assistant",
        time: getTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-3 left-3 sm:left-auto sm:w-[370px] z-[9999] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col"
          style={{ maxHeight: "72dvh" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[15px] leading-tight">CashPay Assistant</h3>
              <span className="flex items-center gap-1.5 text-[11px] opacity-90">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                Online — Typically replies instantly
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-muted/20 p-3 space-y-3" style={{ minHeight: "220px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground shadow-sm border border-border rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1.5 ${
                      msg.sender === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="bg-card border-t border-border/50 px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto">
            {["Is CashPay legit?", "Buy Airtime", "Support"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => {
                    const userMsg: Message = { id: Date.now(), text: q, sender: "user", time: getTime() };
                    setMessages((prev) => [...prev, userMsg]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [...prev, { id: Date.now() + 1, text: getAutoResponse(q), sender: "assistant", time: getTime() }]);
                    }, 1000);
                    setInput("");
                  }, 100);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-primary/30 text-primary font-medium whitespace-nowrap hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="bg-card border-t border-border p-2.5 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button - positioned above the bottom nav */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[85px] right-4 z-[9999] h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </button>
      )}
    </>
  );
};

export default ChatAssistant;
