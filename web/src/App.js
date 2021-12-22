import firebase from "firebase/compat";
import { useSelector } from "react-redux";

import ChatSecondModified from "./ChatSecondModified";
import Login from "./Login";
import logo from "./logo.svg";
import "./App.css";
import "./Chat.css";
import { SignIn } from "./SignIn";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0oFNYi693Yytck3JoC4AJp2SvS_ILwaU",
  authDomain: "sousdeychat.firebaseapp.com",
  projectId: "sousdeychat",
  storageBucket: "sousdeychat.appspot.com",
  messagingSenderId: "439427997561",
  appId: "1:439427997561:web:cd84a28c8afc58bbcb99a8",
  measurementId: "G-GXQ1BJYS63",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = app.auth();
const login = () => {
  firebase.auth().signInWithEmailAndPassword("test@test.com", "password");
};
const logout = () => {
  firebase.auth().signOut();
};
function App() {
  const { user } = useSelector((state) => state.user);
  const url =
    "wss://jwt2n8ki5m.execute-api.ap-southeast-1.amazonaws.com/dev-vi";

  // const updateTextMessageHistory = async (history) => {
  //   setTextMessagesHistory(history);
  // };
  console.info("user.isLoggedIn", user.isLoggedIn);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      {!user.isLoggedIn ? (
        <Login />
      ) : (
        <div className="chat-container">
          {/* <Chat /> */}
          {/* <ChatSecond /> */}
          <ChatSecondModified />
        </div>
      )}
    </div>
  );
}

export default App;
