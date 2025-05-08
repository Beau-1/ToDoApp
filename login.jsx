import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./Login.css"; // You'll create this for styling

function Login({ onLogin }) {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(getAuth(), provider);
            onLogin();
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Welcome to ToDo App</h1>
                <p>Please sign in to access your tasks</p>
                <button
                    className="google-signin-btn"
                    onClick={signInWithGoogle}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                        alt="Google logo"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

export default Login;
