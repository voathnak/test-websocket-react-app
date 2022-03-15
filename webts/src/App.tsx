// import { SignIn } from "./SignIn";
import Chat from './Chat';
import logo from './logo.svg';
import { useSelector } from 'react-redux';
import { RootState } from './redux';
import Login from './Login';
import './App.css';

const firebaseConfig = {
  apiKey: 'AIzaSyA0oFNYi693Yytck3JoC4AJp2SvS_ILwaU',
  authDomain: 'sousdeychat.firebaseapp.com',
  projectId: 'sousdeychat',
  storageBucket: 'sousdeychat.appspot.com',
  messagingSenderId: '439427997561',
  appId: '1:439427997561:web:cd84a28c8afc58bbcb99a8',
  measurementId: 'G-GXQ1BJYS63',
};

const { REACT_APP_WEB_SOCKET_URL: webSocketUrl } = process.env;
// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = app.auth();
// const login = () => {
//   firebase.auth().signInWithEmailAndPassword("test@test.com", "password");
// };
// const logout = () => {
//   firebase.auth().signOut();
// };
function App() {
  const { user } = useSelector((state: RootState) => state.user);
  const url =
    'wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi';

  // const updateTextMessageHistory = async (history) => {
  //   setTextMessagesHistory(history);
  // };
  console.info('user.isLoggedIn', user.isLoggedIn);
  return (
    <div className="App">
      {!user.isLoggedIn ? (
        <Login />
      ) : (
        <Chat webSocketUrl={webSocketUrl as string} />
      )}
    </div>
  );
}

export default App;
