import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import "./Chat.css"
import {RootState} from "../redux";
import {getConnection, getMessages, setConnection} from "./ServerMethod";
import {Contact, DisplayMessage, MessageContent, Room, User} from "../type";
import {setSelectedRoom} from "../redux/environmentVariable";
import {userContact} from "../redux/usersSlice";
import {setMessageHistory} from "../redux/messageHistory";

const {REACT_APP_WEB_SOCKET_URL: socketUrl} = process.env;



interface Properties {
  webSocketUrl: string
}

const getProfilePhoto = (contacts: Contact[], username: string) => {
  const loggedInUserContacts = contacts.filter(x => x.username === username);
  return loggedInUserContacts.length ? loggedInUserContacts[0].photoURL: false;
}

const Chat = ({webSocketUrl}: Properties) => {
  const dispatch = useDispatch();
  const {user: currentLoggedInUser, status, test, contacts} = useSelector((state: RootState) => state.user);
  const {messageHistory} = useSelector((state: RootState) => state.messageHistory);
  const {selectedRoom} = useSelector((state: RootState) => state.environmentVariable);
  // Public API that will echo messages sent to it back to the client
  // const [socketUrl, setSocketUrl] = useState(webSocketUrl);
  const [debug, setDebug] = useState(false);
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
      setConnection(sendMessage, currentLoggedInUser);
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const send = (message: DisplayMessage) => {
    sendMessage(JSON.stringify(message));
  }

  const onOnlineUserUpdate = () => {
    const {content} = lastJsonMessage;
    setOnlineUsers(content.connectionIds);
  };
  const onMessageUpdate = () => {
    const {content, messageType} = lastJsonMessage;
    const {text, timestamp, sender, room} = content;
    const messageContent: MessageContent = {text, timestamp, sender, room};
    const message: DisplayMessage = {
      messageType: messageType,
      content: messageContent,
      direction: sender !== currentLoggedInUser.username ? 'received' : 'sent',
      time: timestamp.toString(),
      status: "sent"
    }
    // message list that exclude that just got sent
    const filteredMessageHistory = messageHistory[room] ? messageHistory[room].filter((x) =>
      x.content.timestamp !== timestamp.toString()) : [];
    dispatch(setMessageHistory({
      room,
      messages: [
        ...filteredMessageHistory,
        message,
      ]
    }));
    // @ts-ignore
    window.messageHistory = messageHistory
  };

  const onMessageHistoryUpdate = () => {
    console.group("onMessageHistoryUpdate");
    const messageContents: MessageContent[] = lastJsonMessage.content.messageList;
    const messages: DisplayMessage[] = messageContents.map(msc => ({
      messageType: "text-message",
      content: msc,
      direction: msc.sender !== currentLoggedInUser.username ? 'received' : 'sent',
      time: msc.timestamp,
      status: "sent"
    } as DisplayMessage));

    console.log({messages});
    console.log({messageContents});
    const messageIds = messages.map(ms => ms.content.timestamp);
    console.log({messageIds});
    if (messageContents.length) {
      const room =  messageContents[0].room;
      console.log({room});
      const filteredMessageHistory = room in messageHistory && messageHistory[room] ? messageHistory[room].filter((x) =>
        !messageIds.includes(x.content.timestamp)) : [];
      dispatch(setMessageHistory({
        room,
        messages: [
          ...filteredMessageHistory,
          ...messages,
        ]
      }));
    }
    console.groupEnd();
  };

  const onHealthCheck = () => {
    console.info('onHealthCheck', 'INFO: server health checking');
  };

  const receiveUpdate: { [key: string]: () => void } = {
    'online-user': onOnlineUserUpdate,
    'text-message': onMessageUpdate,
    'health-check': onHealthCheck,
    'message-history': onMessageHistoryUpdate,
  };

  useEffect(() => {
    if (lastMessage !== null) {
      // setMessageHistory((prev) => prev.concat(lastMessage));
      // const data = JSON.parse(lastMessage.data);
      console.group('useEffect/lastMessage');
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
          console.error({error});
        } else {
          console.error({error});
        }
      }
    }
    console.groupEnd();
  }, [lastMessage]);

  // const handleClickChangeSocketUrl = useCallback(
  //   () => setSocketUrl(webSocketUrl),
  //   []
  // );

  const onSelectRoom = (selectedRoom: Contact) => {
    console.info("onSelectRoom", selectedRoom);
    const room: Room = {
      type: 'direct',
      name: [selectedRoom.username, currentLoggedInUser.username].sort().join("-"),
      photoURL: selectedRoom.photoURL
    };
    getMessages(sendMessage, currentLoggedInUser, room.name);
    dispatch(setSelectedRoom(room));
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
    getConnection(sendMessage, currentLoggedInUser);
    console.info('####$$$$');
    console.info({user: currentLoggedInUser, status, test});
  }, []);

  const onSubmit = useCallback(() => {
    console.group('onSubmit/useCallback/textMessage');
    console.info('sending text:', textMessage);
    const time = new Date().getTime();
    const messageContent = {
      text: `${currentLoggedInUser.username}: ${textMessage}`,
      timestamp: time.toString(),
      sender: currentLoggedInUser.username,
      room: selectedRoom.name
    } as MessageContent;
    const messageData = JSON.stringify({
      data: JSON.stringify(messageContent),
      action: 'sendmessage',
    });
    console.info('sending --->', messageData,
      JSON.parse(JSON.parse(messageData).data));
    sendMessage(messageData);
    dispatch(setMessageHistory({
      room: selectedRoom.name,
      messages: [
      ...messageHistory[selectedRoom.name],
        {
          content: messageContent,
          direction: 'sent',
        },
      ] as DisplayMessage[]
    }));
    setTextMessage("");
    console.groupEnd();
  }, [textMessage]);

  const listMessageHistory = () => {
    console.info('messageHistory:', messageHistory);
    let messages: any[] = [];
    if (selectedRoom.name in messageHistory && messageHistory[selectedRoom.name]) {
      const roomMessages = messageHistory[selectedRoom.name];
      messages = roomMessages.map((x, index) => {
        const selfMessage = currentLoggedInUser.username == x.content.sender;
        const date = new Date(parseInt(x.content.timestamp));
        const isRepeat = index > 0 && x.content.sender == roomMessages[index - 1].content.sender;

        return (
          <div key={x.content.timestamp} className={[
            x.direction,
            "message-row",
            isRepeat ? 'repeat' : 'non-repeat'
          ].join(" ")}>
            <div className={"message-container"}>
              <div className="message-box">
                <div className="message-balloon">
                  <div className={'info'}>
                    {!isRepeat && !selfMessage && (<div className={"sender"}>{`${x.content.sender}`}</div>)}
                  </div>
                  <div className={"message-text-box"}>
                    <div className={'message-text'}>{`${x.content.text}`}</div>
                    <div className={"time"}>{`${date.getHours()}:${date.getMinutes()}`}</div>
                  </div>
                </div>
                {debug &&(
                  <div className="debug-info">
                    <div>{x.content.sender && `${x.content.sender}, `}{x.content.timestamp}</div>
                    <div>direction: {x.direction}</div>
                    <div>status: {x.status}</div>
                    <div>isRepeat: {isRepeat.toString()}</div>
                  </div>
                )}

              </div>
              <div className={'profile-photo-container'}>
                {!isRepeat && (<div className={"profile-photo"}>
                  <img
                    src={getProfilePhoto(contacts, x.content.sender) || "https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_2.jpg"}
                    alt={`profile-photo`}/>
                </div>)}
              </div>
            </div>
          </div>
        );
      });
    }
    return <div className={"messages-inner-container"}>{messages}</div>;
  };

  const listOnlineUser = () => {
    console.info('onlineUsers:', onlineUsers);
    // const users = onlineUsers.map((u: User) => {
    const exclude_self_contact = contacts.filter(x => x.username != currentLoggedInUser.username);
    const users = exclude_self_contact.map((contact: Contact) => {
      return (
        <div key={contact.username}>
          <button type="button" onClick={() => onSelectRoom(contact)}
                  className={selectedRoom.name === [contact.username, currentLoggedInUser.username].sort().join("-")
                    ? "selected" : "other"}>

            <div className={"profile-photo"}>
              <img src={contact.photoURL || "https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_2.jpg"}
                   alt={`profile-photo`}/>
            </div>
            <div className={'room-info'}>
              <div className={'room-name'}>
                {`${contact.username}`}
              </div>
              <div className={'last-chat-message'}>
                members,
              </div>
            </div>
          </button>
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
    dispatch(userContact());
    return () => {
      // setTextMessage("");
    };
  }, [currentLoggedInUser.isLoggedIn]);

  useEffect(() => {
    console.group('useEffect/textMessage-messageHistory-onlineUsers');
    const d = new Date();
    console.group(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`);
    console.info({textMessage});
    console.info({messageHistory});
    console.info({onlineUsers});
    console.info({onlineUsers: JSON.stringify(onlineUsers)});
    console.groupEnd();
    console.groupEnd();
    return () => {
      // setTextMessage("");
    };
  }, [textMessage, messageHistory, onlineUsers]);


  return (
    <div className="chat-container">
      <button className={'debug-button'} onClick={() => setDebug(!debug)}>😈</button>
      {
        debug && (
          <div className="control-panel">
            <div>
              <span>
                currently loggedIn: <b>{currentLoggedInUser.username}</b>
              </span>
            </div>
            <div>
              <span>
                connectionStatus: <b>{connectionStatus}</b>
              </span>
            </div>
            <div className="manual-control-box">
              <span>Manual Control: </span>

              <button type="submit" onClick={() => getConnection(sendMessage, currentLoggedInUser)}>
                getConnection
              </button>
              <button type="submit" onClick={() => setConnection(sendMessage, currentLoggedInUser)}>
                setConnection
              </button>
              <button type="submit" onClick={() => getMessages(sendMessage, currentLoggedInUser, selectedRoom.name)}>
                getMessages
              </button>
            </div>
          </div>
        )
      }

      <div className="chat-window">
        <div className="chat-users">
          <div className={'chat-list-header'}>

          </div>
          {listOnlineUser()}
        </div>
        {selectedRoom.name && (<div className="chat-box">
          <div className="messages-window">
            <div className={'messages-container'}>
              <div className={'messages-container-header'}>
                <div className={"profile-photo"}>
                  <img
                    src={selectedRoom.photoURL || "https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_2.jpg"}
                    alt={`profile-photo`}/>
                </div>
                <div className={'header-info'}>
                  <div className={'room-name'}>
                    {selectedRoom.name.split('-').filter(x => x != currentLoggedInUser.username).join('-')}
                  </div>
                  <div className={'info'}>
                    <div className={'member'}>
                      {selectedRoom.name.split('-').length} members,
                    </div>
                    <div className={'status'}>
                      Online
                    </div>
                  </div>
                </div>
              </div>
              {listMessageHistory()}
            </div>
          </div>
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
