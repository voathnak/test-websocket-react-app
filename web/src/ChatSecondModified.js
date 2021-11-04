import React, { useState, useCallback, useEffect } from "react";

import useWebSocket, { ReadyState } from "react-use-websocket";

import Chat from "./Chat";

const ChatSecondModified = () => {
  const url =
    "wss://cy7hzvh3n2.execute-api.ap-southeast-1.amazonaws.com/pydev-vi";
  // "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";
  // Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(url);
  const [messageHistory, setMessageHistory] = useState([]);
  const [sentMessageHistory, setSentMessageHistory] = useState([]);
  const [textMessage, setTextMessage] = useState("");

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      const data = JSON.parse(lastMessage.data);
      setMessageHistory([
        ...messageHistory,
        {
          type: lastMessage.type,
          data: {
            text: data.text,
            id: data.id,
            type: "received",
          },
          time: lastMessage.timeStamp,
        },
      ]);
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickChangeSocketUrl = useCallback(() => setSocketUrl(url), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const onTextChanged = ({ target: { value } }) => {
    console.info(value);
    setTextMessage(value);
  };

  const onSubmit = useCallback(() => {
    console.info("sending text:", textMessage);
    sendMessage(
      JSON.stringify({
        data: JSON.stringify({
          text: textMessage,
          id: new Date().getTime(),
        }),
        action: "sendmessage",
      })
    );
    const id = new Date().getTime();
    setMessageHistory([
      ...messageHistory,
      {
        type: "sent",
        data: {
          text: textMessage,
          id,
          type: "sent",
        },
        time: id,
      },
    ]);
  }, [textMessage]);

  const listMessageHistory = () => {
    console.info("messageHistory:", messageHistory);
    const messages = messageHistory.map((x) => {
      return (
        <li key={x.time} className={x.data.type}>
          <div className="message-box">
            <p>{`${x.data.text}`}</p>
            <p className="time">{x.time}</p>
          </div>
        </li>
      );
    });
    return <ul>{messages}</ul>;
  };

  return (
    <div className="chat-box">
      <span>The WebSocket is currently {connectionStatus}</span>
      {listMessageHistory()}
      <div className="input">
        <input onChange={onTextChanged} />
        <button type="submit" onClick={onSubmit}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSecondModified;
