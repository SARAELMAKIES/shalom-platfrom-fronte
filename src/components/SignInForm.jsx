// src/components/SignInForm.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged, // נשאיר את הייבוא אך נסיר את השימוש ב-useEffect
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import googleIcon from '../assets/google.png';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../layouts/AuthLayout';

const SignInForm = ({ onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // זהו המשתמש מ-Firebase, לא בהכרח זהה ל-userId בקונטקסט
  const [displayedName, setDisplayedName] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false); // ✅ שיניתי ל-false כברירת מחדל, כי ה-AuthLayout מטפל בטעינה הראשונית
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [emailDomainSuggestion, setEmailDomainSuggestion] = useState('');
  const [showDomainSuggestion, setShowDomainSuggestion] = useState(false);
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  // ✅ קבל את פונקציית login מה-AuthContext
  const { login } = useContext(AuthContext);

  // ✅ הסרתי את ה-useEffect הזה. ה-AuthLayout אחראי על ניהול מצב האותנטיקציה הגלובלי והניווט.
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     if (currentUser) {
  //       setDisplayedName(currentUser.displayName || currentUser.email);
  //       setGeneralError('');
  //       setSuccessMessage('');
  //     } else {
  //       setDisplayedName('');
  //     }
  //     setLoadingAuth(false);
  //   });
  //   return () => unsubscribe();
  // }, []); 

  // ✅ useEffect חדש למילוי אוטומטי של אימייל מ-sessionStorage
  useEffect(() => {
    const prefillEmail = sessionStorage.getItem('prefillEmailForLogin');
    if (prefillEmail) {
      setEmail(prefillEmail);
      sessionStorage.removeItem('prefillEmailForLogin'); // נקה לאחר שימוש
      // ניתן להוסיף פוקוס לשדה האימייל אם רוצים:
      // emailInputRef.current?.focus(); 
    }
  }, []); // הרץ פעם אחת בטעינת הקומפוננטה


  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');

    const atIndex = value.indexOf('@');
    if (atIndex !== -1 && atIndex === value.length - 1) {
      setEmailDomainSuggestion('gmail.com');
      setShowDomainSuggestion(true);
    } else {
      setEmailDomainSuggestion('');
      setShowDomainSuggestion(false);
    }
  };

  const applyDomainSuggestion = () => {
    const atIndex = email.indexOf('@');
    if (atIndex !== -1) {
      setEmail(email.substring(0, atIndex + 1) + emailDomainSuggestion);
    } else {
      setEmail(email + '@' + emailDomainSuggestion);
    }
    setShowDomainSuggestion(false);
    emailInputRef.current.focus();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setIsSigningIn(true);
    setShowDomainSuggestion(false);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log("SignInForm: Email/Password Sign-in successful. User:", userCredential.user);
      // ✅ התחברות מוצלחת: עדכן את ה-AuthContext
      login(userCredential.user.accessToken, userCredential.user.uid); 
      
      setGeneralError('');
      setSuccessMessage('Signed in successfully!');
      
      // ✅ ניתוב חזרה לדף הקודם או לדף הבית
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin'); // נקה את הנתיב השמור
          navigate(redirectPath);
      } else {
          navigate('/'); // נווט לדף הבית כברירת מחדל
      }

    } catch (err) {
      let errorMessage = 'An unknown error occurred.';
      switch (err.code) {
        case 'auth/user-not-found':
          setEmailError('No user found with this email.');
          setGeneralError('Invalid email or password');
          break;
        case 'auth/wrong-password':
          setPasswordError('Incorrect password.');
          setGeneralError('Invalid email or password');
          break;
        case 'auth/invalid-email':
          setEmailError('Invalid email address.');
          setGeneralError('Invalid email or password');
          break;
        case 'auth/invalid-credential':
          setGeneralError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setGeneralError('Too many failed login attempts. Please try again later or reset your password.');
          break;
        default:
          setGeneralError(err.message);
          break;
      }
      console.error("Firebase Auth Error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setIsGoogleSigningIn(true);
    setShowDomainSuggestion(false);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);

      console.log("SignInForm: Google Sign-in successful. User:", result.user);
      // ✅ התחברות מוצלחת עם גוגל: עדכן את ה-AuthContext
      login(result.user.accessToken, result.user.uid); 

      setGeneralError('');
      setSuccessMessage('Signed in with Google successfully!');
      
      // ✅ ניתוב חזרה לדף הקודם או לדף הבית
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin'); // נקה את הנתיב השמור
          navigate(redirectPath);
      } else {
          navigate('/'); // נווט לדף הבית כברירת מחדל
      }

    } catch (err) {
      let errorMessage = 'Could not sign in with Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in window closed.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Popup already opened.';
      } else if (err.code === 'auth/credential-already-in-use') {
        errorMessage = 'This email is already associated with another login method. Please sign in using that method.';
      } else {
        errorMessage = err.message;
      }
      setGeneralError(errorMessage);
      console.error("Google Auth Error:", err);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setShowDomainSuggestion(false);
    if (!email) {
      setEmailError('Please enter your email to reset password.');
      setGeneralError('Please enter your email to reset password.');
      return;
    }
    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      let errorMessage = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        setEmailError('No user found with this email.');
        errorMessage = 'No user found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        setEmailError('Invalid email address.');
        errorMessage = 'Please enter a valid email address.';
      } else {
        errorMessage = err.message;
      }
      setGeneralError(errorMessage);
      console.error("Password Reset Error:", err);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ✅ הסרנו את תנאי ה-loadingAuth כאן, מכיוון שה-AuthLayout כבר מטפל בטעינה הראשונית של האותנטיקציה
  // ומונע רינדור של הילדים (כולל SignInForm) עד שהאותנטיקציה מאותחלת.
  // if (loadingAuth) {
  //   return (
  //     <div className="text-center w-full py-16">
  //       <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">Loading...</h2>
  //       <p className="text-gray-text mb-6">Please wait while we verify your authentication status.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full max-w-screen-lg mx-auto py-8 px-8">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-dark-gray-text w-full">
          SIGN IN
        </h2>

        {generalError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-yellow-500" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
            </span>
            <span className="block sm:inline pr-8">{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-green-500" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.707 9.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l6-6a1 1 0 0 0-1.414-1.414L9 11.586 6.707 9.293z"/></svg>
            </span>
            <span className="block sm:inline pr-8">{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row w-full justify-center items-start md:space-x-12 space-y-6 md:space-y-0">

          <div className="md:w-1/2 w-full flex flex-col items-center">
            <form onSubmit={handleSignIn} className="w-full max-w-xs">
              <div className="mb-4 pt-1">
                <label htmlFor="email" className="block text-gray-text text-sm font-bold mb-2">
                  *Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    ref={emailInputRef}
                    className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    aria-label="Email address"
                    aria-describedby={emailError ? "email-error" : null}
                  />
                  {emailError && <p id="email-error" className="text-red-500 text-xs mt-1">{emailError}</p>}
                  {showDomainSuggestion && emailDomainSuggestion && (
                    <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg mt-1 z-10">
                      <button
                        type="button"
                        onClick={applyDomainSuggestion}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        aria-label={`Append ${emailDomainSuggestion} to email`}
                      >
                        {email + emailDomainSuggestion}
                        <span className="text-gray-500 ml-1">(Click to complete)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-2 relative">
                <label htmlFor="password" className="block text-gray-text text-sm font-bold mb-2">
                  *Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setGeneralError('');
                    setSuccessMessage('');
                  }}
                  required
                  aria-label="Password"
                  aria-describedby={passwordError ? "password-error" : null}
                />
                {passwordError && <p id="password-error" className="text-red-500 text-xs mt-1">{passwordError}</p>}
              </div>

              <div className="mb-6 flex items-center justify-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-golden-brown border-gray-300 rounded focus:ring-golden-brown mr-2"
                  aria-label="Remember me on this device"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-text">
                  Remember me
                </label>
              </div>

              <div className="flex items-center justify-center mb-6">
                <button
                  type="submit"
                  onClick={handleSignIn}
                  className={`bg-golden-brown text-white font-bold py-2 px-8 rounded-none hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200 ${isSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSigningIn}
                  aria-label="Sign in to your account"
                >
                  {isSigningIn ? (
                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:block w-px bg-gray-300 mx-8 self-stretch"></div>

          <div className="md:w-1/2 w-full flex flex-col items-center">
            <div className="w-full max-w-xs">
              <button
                type="button"
                onClick={handlePasswordReset}
                className={`inline-block align-baseline font-bold text-sm text-link-blue hover:underline focus:outline-none rounded-none mb-6 text-center w-full ${isResettingPassword ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isResettingPassword}
                aria-label="Forgot your password? Click to reset"
              >
                {isResettingPassword ? (
                  <svg className="animate-spin h-4 w-4 text-link-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Forgot your password?'
                )}
              </button>

              <div className="text-center text-gray-text mb-2 w-full">OR</div>

              <button
                onClick={handleGoogleSignIn}
                className={`w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-none flex items-center justify-center space-x-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200 ${isGoogleSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isGoogleSigningIn}
                aria-label="Continue with Google"
              >
                {isGoogleSigningIn ? (
                  <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <React.Fragment>
                    <img src={googleIcon} alt="Google" className="h-5 w-5" />
                    <span>Continue With Google</span>
                  </React.Fragment>
                )}
              </button>

              <p className="text-center text-gray-text text-sm mt-4 w-full">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-link-blue hover:underline focus:outline-none rounded-none"
                  aria-label="Sign up for a new account"
                  onClick={onSignUpClick}
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
