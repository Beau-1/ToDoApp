// Imports required functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, addDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";

// Add to your Firebase config:
const auth = getAuth(app);

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    return (
        <div className="app">
            {user ? (
                <>
                    <div className="user-info">
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <button onClick={handleSignOut}>Sign Out</button>
                    </div>
                    <ToDoList db={db} userId={user.uid} />
                </>
            ) : (
                <button onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    );
}

// Imports CSS styles
import "./App.css";

// Imports the ToDoList component
import ToDoList from "./ToDoList";

// Firebase configuration object with credentials and project identifiers
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

// Initialize the Firebase application using the config object
const app = initializeApp(firebaseConfig);

// Initialize Firestore database and get a reference to use it
const db = getFirestore(app);

// Main React component
function App() {
    return (
        <>
            <ToDoList db={db} />
        </>
    );
}

// Export the App component as default
export default App;

//  Google authentication with Firebase
// document.addEventListener("DOMContentLoaded", (Event) => {
//     const app = firebase.app();
// });

// function googleLogin() {
//     const provider = new firebase.auth.GoogleAuthProvider();
//     firebase
//         .auth()
//         .signInWithPopup(provider)
//         .then((result) => {
//             const user = result.user;
//             document.write(`Hello ${user.displayName}`);
//             console.log(user);
//         })
//         .catch(console.log);
// }
