import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyDVmnnh2OVuGLwp0dfR6U2YejGXaXt72hs',
  authDomain: 'superchat-da74d.firebaseapp.com',
  projectId: 'superchat-da74d',
  storageBucket: 'superchat-da74d.appspot.com',
  messagingSenderId: '805713436263',
  appId: '1:805713436263:web:6f4a2904188b3fe2577ec2',
  measurementId: 'G-EYTRQ9ND5T',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
          }
          alt="avatar"
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
