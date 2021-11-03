import { useEffect, useState } from "react";

import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import firebase from "firebase/compat";
import {
  useAuthState,
  useCreateUserWithEmailAndPassword,
} from "react-firebase-hooks/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0oFNYi693Yytck3JoC4AJp2SvS_ILwaU",
  authDomain: "sousdeychat.firebaseapp.com",
  projectId: "sousdeychat",
  storageBucket: "sousdeychat.appspot.com",
  messagingSenderId: "439427997561",
  appId: "1:439427997561:web:cd84a28c8afc58bbcb99a8",
  measurementId: "G-GXQ1BJYS63",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const signIn = () => {
  signInWithEmailAndPassword(auth, "test@test.com", "password");
};
const logout = () => {
  signOut(auth);
};

export const SignIn = () => {
  // const [user, loading, error] = useAuthState(auth);
  const [quickstartSignIn, setQuickstartSignIn] = useState(false);
  const [oauthToken, setOauthToken] = useState();
  const [currentUser, setCurrentUser] = useState({});
  const [userLoginStatus, setUserLoginStatus] = useState(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState("");

  useEffect(() => {
    setUserPhotoUrl(currentUser.photoURL);
  }, [currentUser]);

  useEffect(() => {
    if (firebase.auth().currentUser) {
      console.info("checking logged in user");
      const user = firebase.auth().currentUser;
      console.info({ user });
      setCurrentUser({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  }, []);

  const toggleSignIn = () => {
    // if (!firebase.auth().currentUser) {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const token = result.credential.accessToken;
        // The signed-in user info.
        const { user } = result;
        setOauthToken(token);
        console.info(user);
        setUserLoginStatus(true);
        setCurrentUser({
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error({ errorMessage });
        // The email of the user's account used.
        const { email } = error;
        console.error({ email });
        // The firebase.auth.AuthCredential type that was used.
        const { credential } = error;
        console.error({ credential });
        if (errorCode === "auth/account-exists-with-different-credential") {
          console.info(
            "You have already signed up with a different auth provider for that email."
          );
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error);
        }
      });
    // }
    // else {
    //   console.info("No user signed in");
    //   setUserLoginStatus(false);
    //   const user = firebase.auth().currentUser;
    //   console.info({ user });
    //   // firebase.auth().signOut();
    // }
    setQuickstartSignIn(true);
  };

  return (
    <div>
      <button type="button" onClick={toggleSignIn}>
        Log in with Google account
      </button>
      <button
        type="button"
        onClick={() => {
          firebase.auth().signOut();
        }}
      >
        Sign out
      </button>
      <p>
        Token:<span>{oauthToken}</span>
      </p>
      <p>
        Is logged in:<span>{userLoginStatus.toString()}</span>
      </p>
      <p>
        User:<span>{currentUser.displayName}</span>
      </p>
      <img src={userPhotoUrl} alt={currentUser.uid} />
    </div>
  );
};
