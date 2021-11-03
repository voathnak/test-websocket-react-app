import firebase from "firebase/compat";

const firebaseConfig = {
  apiKey: "AIzaSyA0oFNYi693Yytck3JoC4AJp2SvS_ILwaU",
  authDomain: "sousdeychat.firebaseapp.com",
  projectId: "sousdeychat",
  storageBucket: "sousdeychat.appspot.com",
  messagingSenderId: "439427997561",
  appId: "1:439427997561:web:cd84a28c8afc58bbcb99a8",
  measurementId: "G-GXQ1BJYS63",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

const googleProvider = new firebase.auth.GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup(googleProvider);
    const { user } = res;
    // const query = await db
    //   .collection("users")
    //   .where("uid", "==", user.uid)
    //   .get();
    // if (query.docs.length === 0) {
    //   await db.collection("users").add({
    //     uid: user.uid,
    //     name: user.displayName,
    //     authProvider: "google",
    //     email: user.email,
    //   });
    // }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const signInWithEmailAndPassword = async (email, password) => {
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await auth.createUserWithEmailAndPassword(email, password);
    const { user } = res;
    await db.collection("users").add({
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordResetEmail = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  auth.signOut();
};

export {
  auth,
  signInWithGoogle,
  signInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordResetEmail,
  logout,
};
