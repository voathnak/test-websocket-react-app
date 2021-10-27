import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import "./Chat.css";
import Chat from "./Chat";
import ChatSecond from "./ChatSecond";
import ChatSecondModified from "./ChatSecondModified";

// const socket = new WebSocket(url);

function App() {
  const url =
    "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";

  // const updateTextMessageHistory = async (history) => {
  //   setTextMessagesHistory(history);
  // };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="chat-container">
        {/* <Chat /> */}
        {/* <ChatSecond /> */}
        <ChatSecondModified />
      </div>
    </div>
  );
}

export default App;
