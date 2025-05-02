import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

interface Message {
  type: "user" | "bot";
  text: string;
  image?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  useEffect(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }
    setSessionId(sessionId);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://aiservice.fastdo.vn/webhook/e58a00a7-224c-4e1c-a2ad-b58c822dc35d",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            prompt: input,
            sessionId: sessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from n8n:", data);

      // Add bot response
      const botMessage: Message = {
        type: "bot",
        text: data.text || data.message || "No response text",
        image: data.image || data.imageUrl || data.url,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Detailed error:", error);
      let errorMessage = "Sorry, there was an error processing your request.";

      if (error instanceof Error) {
        errorMessage += " Details: " + error.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 shadow-md ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                {message.type === "user" ? (
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {message.text}
                  </p>
                ) : (
                  <div className="prose prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Response"
                    className="mt-3 rounded-lg max-w-full h-auto shadow-sm"
                  />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 bg-white"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
