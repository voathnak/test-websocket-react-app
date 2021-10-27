import React, { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Chat from "./Chat";

const ChatSecond = () => {
  const url =
    "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";
  // Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(url);
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      console.info({ lastMessage });

      setMessageHistory((prev) => {
        console.info({ prev });
        return prev.concat(lastMessage);
      });
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickChangeSocketUrl = useCallback(() => setSocketUrl(url), []);

  const handleClickSendMessage = useCallback(
    () =>
      sendMessage(
        JSON.stringify({
          data: "hello",
          action: "sendmessage",
        })
      ),
    []
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div>
      <button type="button" onClick={handleClickChangeSocketUrl}>
        Click Me to change Socket Url
      </button>
      <button
        type="button"
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send Hello
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
};

export default ChatSecond;
