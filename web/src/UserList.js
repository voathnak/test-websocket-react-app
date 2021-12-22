import React, { useState, useCallback, useEffect } from "react";

import useWebSocket, { ReadyState } from "react-use-websocket";

import Chat from "./Chat";

const { REACT_APP_WEB_SOCKET_URL: webSocketUrl } = process.env;
const UserList = () => {
  // "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";
  // Public API that will echo messages sent to it back to the client
  // const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  // const [messageHistory, setMessageHistory] = useState([]);
  // const [sentMessageHistory, setSentMessageHistory] = useState([]);
  const [users, setUsers] = useState("");

  const { socketData, lastSocketData, readyState } = useWebSocket(webSocketUrl);

  useEffect(() => {
    if (socketData !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      const data = JSON.parse(lastSocketData.data);
      setUsers([
        ...users,
        {
          id: lastSocketData,
        },
      ]);
    }
  }, [lastSocketData, setUsers]);

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
    userList(
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

  const listUserOnline = () => {
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
    <div className="user-list-box">
      {listUserOnline()}
      <div className="input">
        <input onChange={onTextChanged} />
        <button type="submit" onClick={onSubmit}>
          Send
        </button>
      </div>
    </div>
  );
};

export default UserList;
