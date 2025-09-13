import React, { useState, useEffect, useRef } from "react";

export default function ChatBot({ analysisResult }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! Ask me about your report or how to use this page." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (shareAnalysis = false) => {
    if (!input.trim() && !shareAnalysis) return;
    setLoading(true);

    setMessages(msgs => [...msgs, { sender: "user", text: input }]);

    let prompt = input;
    if (shareAnalysis && analysisResult) {
      prompt += `\n\nHere is my analysis result:\nTransmission: ${analysisResult.transmission}\nDrug Resistance: ${analysisResult.drug_resistant}\nMutation: ${analysisResult.mutation}`;
    }

    try {
      const res = await fetch("http://localhost:8000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages(msgs => [...msgs, { sender: "bot", text: "⚠️ Sorry, I couldn't get a response." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                     text-white rounded-full shadow-xl w-14 h-14 flex items-center justify-center 
                     text-2xl animate-bounce transition-all duration-300"
          aria-label="Open ChatBot"
        >
          💬
        </button>
      )}

      {/* ChatBot Window */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl w-[450px] h-[600px] max-w-[90vw] border border-gray-200 
                        flex flex-col animate-fade-in-up">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl text-white">
            <span className="font-semibold text-lg">Genomic AI ChatBot</span>
            <button
              onClick={() => setOpen(false)}
              className="hover:text-red-300 text-xl font-bold transition"
              aria-label="Close ChatBot"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 h-[470px] overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-md ${
                  msg.sender === "bot"
                    ? "bg-blue-50 text-blue-800 self-start"
                    : "bg-indigo-600 text-white self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={() => sendMessage(false)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                           text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
              >
                {loading ? "..." : "Send"}
              </button>
              <button
                onClick={() => sendMessage(true)}
                disabled={loading || !analysisResult}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                           text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
              >
                Share report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
