import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./Login.css";

function Login({ auth }) {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>To Do App</h1>
                <p>Sign in to continue</p>
                <button onClick={signInWithGoogle} className="google-btn">
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
