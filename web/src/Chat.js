import { w3cwebsocket as W3CWebSocket } from "websocket/lib/websocket";
import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { websocket } from "./utils";
// import { addMsgHistory } from "./redux/messageHistory";

function Chat() {
  const url =
    "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";
  const openConnection = () => {
    console.info(url);
    // return new W3CWebSocket(url, "echo-protocol");
    return websocket(url);
  };

  // const getInitHistory = () => {
  //   console.info("getInitHistory", new Date());
  //   return [];
  // };
  const [textMessagesHistory, setTextMessagesHistory] = useState([]);
  // const { msgHistory } = useSelector((state) => state.messageHistory);
  const [wsClient, setWsClient] = useState(openConnection());
  const [textMessage, setTextMessage] = useState("");
  const [connStatus, setConnStatus] = useState("connected");
  // const [textMessagesHistory, setTextMessagesHistory] = useState(
  //   getInitHistory()
  // );

  // const addMsgToHistory = (msg) => useDispatch(addMsgHistory(msg));

  const init = () => {
    setWsClient(openConnection());
  };

  const onerror = () => {
    console.info("Connection Error");
  };

  const onTextChanged = ({ target: { value } }) => {
    console.info(value);
    setTextMessage(value);
  };

  const onOpen = () => {
    console.info("WebSocket Client Connected");
    if (connStatus !== "connected") {
      setConnStatus("connected");
    }
  };

  const onclose = () => {
    console.info("echo-protocol Client Closed");
    setConnStatus("disconnected");
  };

  const sendMessage = (text) => {
    console.info("sending...");
    wsClient.send(
      JSON.stringify({
        data: text,
        action: "sendmessage",
      })
    );
  };

  const onSubmit = () => {
    // console.info(textMessage);
    if (connStatus === "connected") {
      sendMessage(textMessage);
    }
  };

  const timeFromTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    const hours = date.getHours();
    // Minutes part from the timestamp
    const minutes = `0${date.getMinutes()}`;
    // Seconds part from the timestamp
    const seconds = `0${date.getSeconds()}`;

    // Will display time in 10:30:23 format
    return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
  };

  const onReceived = (message) => {
    console.info("onReceived");
    console.info(message);
    console.info(1, { textMessagesHistory });
    setTextMessagesHistory([
      ...textMessagesHistory,
      {
        type: "received",
        text: message.data,
        timeStamp: timeFromTimestamp(message.timeStamp),
      },
    ]);
    console.info(2, { textMessagesHistory });
  };

  useEffect(() => {
    // wsClient.onopen = onOpen;
    wsClient.addEventListener("message", onReceived);
    // wsClient.onmessage = onReceived;
    // wsClient.onerror = onerror;
    // wsClient.onclose = onclose;
    console.info("testing run times", new Date());
  }, []);

  useEffect(() => {
    init();
  }, [connStatus]);

  const listMessageHistory = () => {
    console.info("messageHistory:", textMessagesHistory);
    const messages = textMessagesHistory.map((x) => {
      return (
        <li key={x.timeStamp} className={x.type}>
          <div className="message-box">
            <p>{`${x.text}`}</p>
            <p className="time">{x.timeStamp}</p>
          </div>
        </li>
      );
    });
    return <ul>{messages}</ul>;
  };

  return (
    <div className="chat-box">
      {listMessageHistory()}
      <div className="input">
        <input onChange={onTextChanged} />
        <button type="submit" onClick={onSubmit}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
