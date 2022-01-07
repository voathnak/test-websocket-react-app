export interface User {
  connectionId?: string;
  isLoggedIn?: boolean,
  username: string,
  token: string,
  photoURL?: string,
  id: string,
}