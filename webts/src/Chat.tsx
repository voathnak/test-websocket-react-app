import React, { useState, useCallback, useEffect } from 'react';

import { useSelector } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { RootState } from './redux';
import "./Chat.css"

const { REACT_APP_WEB_SOCKET_URL: socketUrl } = process.env;

interface MessageHistory {
  type: 'online-user' | 'health-check' | 'message' | 'sent';
  data: {
    text: string;
    id: string;
    type: 'received';
  };
  time: string;
}

interface User {
  connectionId: string;
  username: string;
}

interface Properties {
  webSocketUrl: string
}

const ChatSecondModified = ({webSocketUrl}: Properties) => {
  const { user, status, test } = useSelector((state: RootState) => state.user);
  // Public API that will echo messages sent to it back to the client
  // const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  const [messageHistory, setMessageHistory] = useState([] as MessageHistory[]);
  const [onlineUsers, setOnlineUsers] = useState([] as User[]);
  const [textMessage, setTextMessage] = useState('');
  const [customerTab, setCustomerTabs] = useState([]);

  const getSocketUrl = useCallback(() => {
    return new Promise<string>( resolve => {
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
    const { data } = lastJsonMessage;
    setOnlineUsers(data);
  };
  const onMessageUpdate = () => {
    const { data, type } = lastJsonMessage;
    const { text, id } = JSON.parse(data);
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
      console.info({ lastJsonMessage });
      console.info({ lastMessage });
      const { data, type } = lastJsonMessage;
      console.info({ data, type });
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
          console.error({ error });
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
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    console.info(value);
    setTextMessage(value);
  };

  const getConnection = () => {
    const m = JSON.stringify({
      action: 'configuration',
      data: JSON.stringify({
        type: 'rpc',
        name: 'get-connections',
        data: { token: user.token },
      }),
    });
    console.info({ m });
    sendMessage(m);
  };

  const setConnection = () => {
    const m = JSON.stringify({
      action: 'configuration',
      data: JSON.stringify({
        type: 'rpc',
        name: 'set-connection',
        data: { token: user.token },
      }),
    });
    console.info({ m });
    sendMessage(m);
  };

  useEffect(() => {
    getConnection();
    console.info('####$$$$');
    console.info({ user, status, test });
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
        type: 'sent',
        data: {
          text: textMessage,
          id,
          type: 'sent',
        },
        time: id,
      },
    ] as MessageHistory[]);
  }, [textMessage]);

  const listMessageHistory = () => {
    console.info('messageHistory:', messageHistory);
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
    console.info('onlineUsers:', onlineUsers);
    const users = onlineUsers.map((user: User) => {
      return (
        <li key={user.connectionId}>
          <div>
            <button type="button" onClick={() => onSelectUser(user)}>
              {`${user.username}`}
            </button>
          </div>
        </li>
      );
    });
    return <ul>{users}</ul>;
  };

  const handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.info(e.key);
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

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

        <button type="submit" onClick={getConnection}>
          getConnection
        </button>
        <button type="submit" onClick={setConnection}>
          setConnection
        </button>
      </div>

      <div className="chat-window">
        <div className="chat-users">{listOnlineUser()}</div>
        <div className="chat-box">
          <div className="messages-box">{listMessageHistory()}</div>
          <div className="input">
            <input onChange={onTextChanged} onKeyDown={handleKeypress} />
            <button type="submit" onClick={onSubmit}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSecondModified;
