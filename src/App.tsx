import React, { Fragment, useState } from "react";
import { IoSend } from "react-icons/io5";
import "./App.css";
import { ws } from "./utils/websocket";

type Message = {
  id: string;
  body: string;
  senderId: string;
};
function App() {
  const [message, setMessage] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [uid, setUID] = useState<string>("");
  const messagesContainer = document.getElementById("messages");

  ws.onopen = () => {
    setUID(Math.random().toString(32).substring(2, 22));
    console.log("Connected to server");

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: uid,
          channel: "messageChannel",
        }),
      })
    );
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "ping") return;
    if (data.type === "welcome") return;
    if (data.type === "confirm_subscription") return;

    const message = data.message;
    setMessageandScrool([...message, message]);
  };

  React.useEffect(() => {
    fetchMessage();
  });

  React.useEffect(() => {
    resetScroll();
  });

  const fetchMessage = async () => {
    try {
      const response = await fetch(
        "https://testrails.richardosinulingga.site/messages"
      );
      const data = await response.json();
      setMessageandScrool(data);
    } catch {
      throw new Error("Failed to fetch messages");
    }
  };

  const resetScroll = () => {
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const setMessageandScrool = async (data: Message[]) => {
    setMessage(data);
    resetScroll();
  };

  const sendMessageHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetch("https://testrails.richardosinulingga.site/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: inputMessage,
        }),
      });
      setInputMessage("");
    } catch {
      throw new Error("Failed to send message");
    }
  };
  return (
    <Fragment>
      <div className="flex flex-col min-h-screen w-full">
        <nav className="bg-teal-800 justify-between flex flex-row p-4 ">
          <h1 className="font-semibold text-xl">
            Hello <span>{uid}</span>
          </h1>
        </nav>

        <div className="messages" id="messages">
          {message.map((msg) => {
            return (
              <div
                className={`chat ${
                  msg.senderId === uid ? "chat-end" : "chat-start"
                }`}
                key={msg.id}
              >
                <p className="chat-bubble">{msg.body}</p>
              </div>
            );
          })}
        </div>

        <div className="idForm bottom-0 fixed w-full">
          <form
            onSubmit={sendMessageHandler}
            className="flex flex-row space-x-4"
          >
            <input
              className="input w-full"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              type="text"
              name="messages"
              placeholder="isi pesan anda"
            />
            <button>
              <IoSend size={30} />
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
