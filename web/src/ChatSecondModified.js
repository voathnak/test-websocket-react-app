import React, { useState, useCallback, useEffect } from "react";

import useWebSocket, { ReadyState } from "react-use-websocket";

import Chat from "./Chat";

const { REACT_APP_WEB_SOCKET_URL: webSocketUrl } = process.env;

const ChatSecondModified = () => {
  // Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  const [messageHistory, setMessageHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [textMessage, setTextMessage] = useState("");

  const {
    sendMessage,
    lastMessage,
    readyState,
    sendJsonMessage,
    lastJsonMessage,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      // const data = JSON.parse(lastMessage.data);
      console.info({ lastJsonMessage });
      console.info({ lastMessage });
      const { data, type } = lastJsonMessage;
      console.info({ data, type });
      // const {type} = lastMessage;
      // if(type = )
      if (type === "message") {
        const { text, id } = JSON.parse(data);
        setMessageHistory([
          ...messageHistory,
          {
            type,
            data: {
              text,
              id,
              type: "received",
            },
            time: lastMessage.timeStamp,
          },
        ]);
      } else if (type === "online-user") {
        setOnlineUsers(data);
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl(webSocketUrl),
    []
  );

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

  const getConnection = () => {
    const m = JSON.stringify({
      action: "configuration",
      data: JSON.stringify({ type: "rpc", name: "get-connections" }),
    });
    console.info({ m });
    sendMessage(m);
  };

  useEffect(() => {
    getConnection();
  }, []);

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

  const listOnlineUser = () => {
    console.info("onlineUsers:", onlineUsers);
    const users = onlineUsers.map((x) => {
      return (
        <li key={x}>
          <div>
            <p>{`${x}`}</p>
          </div>
        </li>
      );
    });
    return <ul>{users}</ul>;
  };

  return (
    <div className="chat-window">
      <div className="chat-users">{listOnlineUser()}</div>
      <div className="chat-box">
        <span>The WebSocket is currently {connectionStatus}</span>
        {listMessageHistory()}
        <div className="input">
          <input onChange={onTextChanged} />
          <button type="submit" onClick={onSubmit}>
            Send
          </button>
          <button type="submit" onClick={getConnection}>
            getConnection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSecondModified;
