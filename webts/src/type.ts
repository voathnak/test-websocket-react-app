export type User = {
  connectionId?: string,
  isLoggedIn?: boolean,
  username: string,
  token: string,
  photoURL?: string,
  id: string,
}


export type Contact = {
  username: string,
  connectionId?: string,
  photoURL?: string,
  onlineStatus: boolean
}

export type Room = {
  type: 'direct' | 'group',
  name: string,
  photoURL?: string,
  onlineStatus: boolean
}

export type MessageContent = {
  text: string,
  timestamp: string,
  sender: string,
  room: string,
}

export type DisplayMessage = {
  messageType: 'online-user' | 'health-check' | 'text-message',
  content: MessageContent,
  time: string,
  username?: string,
  profilePhoto?: string,
  direction: 'received' | 'sent',
  status: 'sent' | 'read',
}

export type DisplayMessageHistory = {
  [room: string]: DisplayMessage[]
}