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
  photoURL?: string
}

export type Room = {
  type: 'direct' | 'group',
  name: string,
  photoURL?: string
}
