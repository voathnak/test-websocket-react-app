import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import "./Chat.css"
import {RootState} from "../redux";
import {getConnection, setConnection} from "./ServerMethod";
import {User} from "../type";
import {setSelectedRoom} from "../redux/environmentVariable";

const {REACT_APP_WEB_SOCKET_URL: socketUrl} = process.env;

type Message = {
  messageType: 'online-user' | 'health-check' | 'text-message',
  content: MessageContent,
  time: string,
  username?: string,
  profilePhoto?: string,
  direction: 'received' | 'sent',
  status: 'sent' | 'read',
}

type MessageContent = {
  text: string,
  timestamp: string,
  sender: string,
  room: string,
}



interface Properties {
  webSocketUrl: string
}

const Chat = ({webSocketUrl}: Properties) => {
  const debug = true;
  const dispatch = useDispatch();
  const {user, status, test} = useSelector((state: RootState) => state.user);
  const { selectedRoom } = useSelector((state: RootState) => state.environmentVariable);
  // Public API that will echo messages sent to it back to the client
  // const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  const [messageHistory, setMessageHistory] = useState([] as Message[]);
  const [onlineUsers, setOnlineUsers] = useState([] as User[]);
  const [textMessage, setTextMessage] = useState('');
  const [customerTab, setCustomerTabs] = useState([]);

  const getSocketUrl = useCallback(() => {
    return new Promise<string>(resolve => {
      resolve(webSocketUrl);
    });
  }, [webSocketUrl]);

  const {
    sendMessage,
    lastMessage,
    readyState,
    sendJsonMessage,
    lastJsonMessage,
  } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      console.log('opened');
      setConnection(sendMessage, user);
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const send = (message: Message) => {
    sendMessage(JSON.stringify(message));
  }

  const onOnlineUserUpdate = () => {
    const {data} = lastJsonMessage;
    setOnlineUsers(data);
  };
  const onMessageUpdate = () => {
    const {content, messageType} = lastJsonMessage;
    const {text, timestamp, sender, room} = content;
    const messageContent: MessageContent = {text, timestamp, sender, room};
    const message: Message = {
      messageType: messageType,
        content: messageContent,
      direction: sender !== user.username ? 'received' : 'sent',
      time: timestamp.toString(),
      status: "sent"
    }
    // message list that exclude that just got sent
    const filteredMessageHistory = messageHistory.filter((x) =>
      x.content.timestamp !== timestamp.toString());
    setMessageHistory([
      ...filteredMessageHistory,
      message,
    ]);
    // @ts-ignore
    window.messageHistory = messageHistory
  };

  const onHealthCheck = () => {
    console.info('INFO: server health checking');
  };

  const receiveUpdate: { [key: string]: () => void } = {
    'online-user': onOnlineUserUpdate,
    'text-message': onMessageUpdate,
    'health-check': onHealthCheck,
  };

  useEffect(() => {
    if (lastMessage !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      // const data = JSON.parse(lastMessage.data);
      console.info({lastJsonMessage});
      console.info({lastMessage});
      const {content, messageType} = lastJsonMessage;
      console.info({content, messageType});
      // const {type} = lastMessage;
      // if(type = )
      console.info('receiveUpdate', receiveUpdate);
      console.info('receiveUpdate[messageType]', receiveUpdate[messageType]);
      try {
        receiveUpdate[messageType]();
      } catch (error) {
        if (error instanceof TypeError) {
          console.warn(`Type: ${messageType} was not handling`);
        } else {
          console.error({error});
        }
      }
    }
  }, [lastMessage, setMessageHistory]);

  // const handleClickChangeSocketUrl = useCallback(
  //   () => setSocketUrl(webSocketUrl),
  //   []
  // );

  const onSelectUser = (activeUser: User) => {
    console.info(activeUser);
    dispatch(setSelectedRoom(
      [activeUser.username, user.username].sort().join("-")
    ));
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const onTextChanged = ({
                           target: {value},
                         }: React.ChangeEvent<HTMLInputElement>) => {
    console.info(value);
    setTextMessage(value);
  };



  useEffect(() => {
    getConnection(sendMessage, user);
    console.info('####$$$$');
    console.info({user, status, test});
  }, []);

  const onSubmit = useCallback(() => {
    console.info('sending text:', textMessage);
    const time = new Date().getTime();
    const messageContent = {
      text: `${user.username}: ${textMessage}`,
      timestamp: time.toString(),
      sender: user.username,
      room: selectedRoom
    } as MessageContent;
    const messageData = JSON.stringify({
      data: JSON.stringify(messageContent),
      action: 'sendmessage',
    });
    console.info('sending --->', messageData,
      JSON.parse(JSON.parse(messageData).data));
    sendMessage(messageData);
    setMessageHistory([
      ...messageHistory,
      {
        content: messageContent,
        direction: 'sent',
      },
    ] as Message[]);
    setTextMessage("");
  }, [textMessage]);

  const listMessageHistory = () => {
    console.info('messageHistory:', messageHistory);
    const messages = messageHistory.map((x) => {
      return (
        <div key={x.content.timestamp} className={[x.direction, "message-row"].join(" ")}>
          <div className={"message-balloon"}>
            <div className="message-box">
              <div className="time">{x.content.sender && `${x.content.sender}, `}{x.content.timestamp}</div>
              <div className="message-text-box">
                <span>{`${x.content.text}`}</span>
              </div>
              {debug && (<div className={"debug-info"}>
                <div className={"header"}>Debug Info:</div>
                <div>
                  <span className={"key"}>direction</span>
                  <span className={"value"}>{`${x.direction}`}</span>
                </div>
                <div>
                  <span className={"key"}>status</span>
                  <span className={"value"}>{`${x.status}`}</span>
                </div>
              </div>)}
            </div>
            <div className={"profile-photo"}>
              <img src={x.profilePhoto || "https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_2.jpg"}
              alt={`profile-photo`}/>
            </div>
          </div>
        </div>
      );
    });
    return <div className={"messages-inner-container"}>{messages}</div>;
  };

  const listOnlineUser = () => {
    console.info('onlineUsers:', onlineUsers);
    const users = onlineUsers.map((user: User) => {
      return (
        <div className={"li"} key={user.connectionId}>
          <div>
            <button type="button" onClick={() => onSelectUser(user)}>
              {`${user.username}`}
            </button>
          </div>
        </div>
      );
    });
    return <div className={"ul"}>{users}</div>;
  };

  const handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.info(e.key);
    if (e.key === 'Enter') {
      onSubmit();
      // e.currentTarget.textContent = "";
    }
  };

  useEffect(() => {
    const d = new Date();
    console.group(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`);
    console.info({textMessage});
    console.info({messageHistory});
    console.info({onlineUsers});
    console.info({onlineUsers: JSON.stringify(onlineUsers)});
    console.groupEnd();
    return () => {
      // setTextMessage("");
    };
  }, [textMessage, messageHistory, onlineUsers]);


  return (
    <div className="chat-container">
      <div className="status-box">
      <span>
        <span>
          currently logged in username <b>{user.username}</b>
  </span>
  </span>
        <span>
  <span>
    connectionStatus: <b>{connectionStatus}</b>
  </span>
  </span>
      </div>
      <div className="manual-control-box">
        <span>Manual Control: </span>

        <button type="submit" onClick={() => getConnection(sendMessage, user)}>
          getConnection
        </button>
        <button type="submit" onClick={() => setConnection(sendMessage, user)}>
          setConnection
        </button>
      </div>

      <div className="chat-window">
        <div className="chat-users">{listOnlineUser()}</div>
        {selectedRoom && (<div className="chat-box">
          <div className="messages-container">{listMessageHistory()}</div>
          <div className="input">
            <input onChange={onTextChanged} onKeyDown={handleKeypress} value={textMessage}/>
            <button type="submit" onClick={onSubmit} disabled={readyState !== ReadyState.OPEN}>
              Send
            </button>
          </div>
        </div>)}
      </div>
    </div>
  );
};

export default Chat;
