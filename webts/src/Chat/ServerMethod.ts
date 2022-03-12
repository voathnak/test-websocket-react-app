import {SendMessage} from "react-use-websocket";
import {User} from "../type";

export const getConnection = (sendMessage: SendMessage, user: User) => {
  const messageData = JSON.stringify({
    action: 'configuration',
    data: JSON.stringify({
      type: 'rpc',
      name: 'get-connections',
      data: {token: user.token},
    }),
  });
  console.info("getConnection --->", {messageData});
  sendMessage(messageData);
};

export const setConnection = (sendMessage: SendMessage, user: User) => {
  const m = JSON.stringify({
    action: 'configuration',
    data: JSON.stringify({
      type: 'rpc',
      name: 'set-connection',
      data: {token: user.token},
    }),
  });
  console.info({m});
  sendMessage(m);
};