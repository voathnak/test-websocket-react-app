import React, {useState, useCallback, useEffect} from 'react';

import {useSelector} from 'react-redux';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import "./Chat.css"
import {RootState} from "../redux";
import {getConnection, setConnection} from "./ServerMethod";
import {User} from "../type";

const {REACT_APP_WEB_SOCKET_URL: socketUrl} = process.env;

interface MessageHistory {
  type: 'online-user' | 'health-check' | 'message';
  data: {
    text: string;
    id: string;
    type: 'received';
  };
  time: string;
  username?: string;
  profilePhoto?: string;
}



interface Properties {
  webSocketUrl: string
}

const ChatSecondModified = ({webSocketUrl}: Properties) => {
  const {user, status, test} = useSelector((state: RootState) => state.user);
  // Public API that will echo messages sent to it back to the client
  // const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  const [messageHistory, setMessageHistory] = useState([] as MessageHistory[]);
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
  } = useWebSocket(getSocketUrl);

  const onOnlineUserUpdate = () => {
    const {data} = lastJsonMessage;
    setOnlineUsers(data);
  };
  const onMessageUpdate = () => {
    const {data, type} = lastJsonMessage;
    const {text, id} = JSON.parse(data);
    setMessageHistory([
      ...messageHistory,
      {
        type,
        data: {
          text,
          id,
          type: 'received',
        },
        time: lastMessage?.timeStamp,
      },
    ] as MessageHistory[]);
  };

  const onHealthCheck = () => {
    console.info('INFO: server health checking');
  };

  const receiveUpdate: { [key: string]: () => void } = {
    'online-user': onOnlineUserUpdate,
    message: onMessageUpdate,
    'health-check': onHealthCheck,
  };

  useEffect(() => {
    if (lastMessage !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      // const data = JSON.parse(lastMessage.data);
      console.info({lastJsonMessage});
      console.info({lastMessage});
      const {data, type} = lastJsonMessage;
      console.info({data, type});
      // const {type} = lastMessage;
      // if(type = )
      console.info('receiveUpdate', receiveUpdate);
      console.info('receiveUpdate[type]', receiveUpdate[type]);
      try {
        receiveUpdate[type]();
      } catch (error) {
        if (error instanceof TypeError) {
          console.warn(`Type: ${type} was not handling`);
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

  const onSelectUser = (user: User) => {
    console.info(user);
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
    sendMessage(
      JSON.stringify({
        data: JSON.stringify({
          text: `${user.username}: ${textMessage}`,
          id: new Date().getTime(),
        }),
        action: 'sendmessage',
      })
    );
    const id = new Date().getTime();
    setMessageHistory([
      ...messageHistory,
      {
        type: '',
        data: {
          text: textMessage,
          id,
          type: 'sent',
        },
        time: id,
      },
    ] as MessageHistory[]);
    setTextMessage("");
  }, [textMessage]);

  const listMessageHistory = () => {
    console.info('messageHistory:', messageHistory);
    const messages = messageHistory.map((x) => {
      return (
        <div key={x.time} className={[x.data.type, "message-row"].join(" ")}>
          <div className={"message-balloon"}>
            <div className="message-box">
              <div className="time">{x.username && `${x.username}, `}{x.time}</div>
              <div className="message-text-box">
                <span>{`${x.data.text}`}</span>
              </div>
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
        <div className="chat-box">
          <div className="messages-container">{listMessageHistory()}</div>
          <div className="input">
            <input onChange={onTextChanged} onKeyDown={handleKeypress} value={textMessage}/>
            <button type="submit" onClick={onSubmit} disabled={readyState !== ReadyState.OPEN}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSecondModified;
