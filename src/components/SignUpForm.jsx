// src/components/SignUpForm.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../layouts/AuthLayout';
import userService from '../api/userService'; // ✅ ייבוא שירות המשתמשים


const SignUpForm = ({ onSignInClick }) => {
  // --- State Variables ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Error and Success Messages
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Email Domain Suggestion States
  const [emailDomainSuggestion, setEmailDomainSuggestion] = useState('');
  const [showDomainSuggestion, setShowDomainSuggestion] = useState(false);
  const emailInputRef = useRef(null);

  const navigate = useNavigate();
  // Access the login function from AuthContext
  const { login } = useContext(AuthContext);

  // --- Handlers ---

  // Handles changes to the email input field and provides domain suggestions
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Clear related error/success messages on input change
    setEmailError('');
    setGeneralError('');
    setSuccessMessage('');

    // Logic for email domain suggestion
    const atIndex = value.indexOf('@');
    if (atIndex !== -1 && atIndex === value.length - 1) {
      setEmailDomainSuggestion('gmail.com');
      setShowDomainSuggestion(true);
    } else if (atIndex !== -1 && value.substring(atIndex + 1).toLowerCase().startsWith('g')) {
      setEmailDomainSuggestion('gmail.com');
      setShowDomainSuggestion(true);
    } else {
      setEmailDomainSuggestion('');
      setShowDomainSuggestion(false);
    }
  };

  // Applies the suggested email domain to the email input field
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

  // Handles the sign-up process
  const handleSignUp = async (e) => {
    e.preventDefault();
    // Clear all previous errors and messages
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setShowDomainSuggestion(false);

    // Basic client-side validation for password match
    if (password !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות.');
      setConfirmPasswordError('הסיסמאות אינן תואמות.');
      setGeneralError('הסיסמאות אינן תואמות.');
      return;
    }

    setIsSigningUp(true); // Set loading state for UI feedback

    try {
      // Set Firebase authentication persistence (local or session)
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user's profile (display name) in Firebase
      await updateProfile(user, {
        displayName: fullName,
      });

      console.log("SignUpForm: Firebase Sign-up successful. User:", user);

      // ✅ Call to your backend to create a new user record using userService
      try {
        const backendUserData = await userService.createBackendUser({
          id: user.uid,        // Firebase User ID (UID)
          name: fullName,      // Display name
          email: user.email,   // User's email
          role: 'user'         // Default role for new users
        });
        console.log("SignUpForm: Backend user created successfully:", backendUserData);

      } catch (backendErr) {
        console.error("SignUpForm: Error calling backend for user creation:", backendErr);
        setGeneralError(`שגיאה ביצירת משתמש בשרת: ${backendErr.message}`);
        setIsSigningUp(false);
        return;
      }

      // ✅ After successful Firebase signup AND backend user creation:
      // Update the AuthContext with the new user's token and UID
      login(user.accessToken, user.uid);

      setSuccessMessage('נרשמת בהצלחה!');

      // ✅ ניתוב חזרה לדף הקודם או לדף הבית
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin'); // נקה את הנתיב השמור
        navigate(redirectPath);
      } else {
        navigate('/'); // נווט לדף הבית כברירת מחדל
      }

    } catch (err) {
      // Handle Firebase authentication errors
      let errorMessage = 'אירעה שגיאה לא ידועה.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          setEmailError('כתובת אימייל זו כבר בשימוש. אנא התחבר/י או השתמש/י באימייל אחר.');
          errorMessage = 'כתובת אימייל זו כבר בשימוש.';
          break;
        case 'auth/invalid-email':
          setEmailError('כתובת אימייל לא חוקית.');
          errorMessage = 'כתובת אימייל לא חוקית.';
          break;
        case 'auth/weak-password':
          setPasswordError('הסיסמה צריכה להיות לפחות 6 תווים.');
          errorMessage = 'הסיסמה חלשה מדי (מינימום 6 תווים).';
          break;
        case 'auth/missing-password':
          setPasswordError('אנא הזן/הזיני סיסמה.');
          errorMessage = 'אנא הזן/הזיני סיסמה כדי להמשיך.';
          break;
        default:
          errorMessage = 'אירעה שגיאה. אנא נסה/נסי שוב מאוחר יותר.';
          console.error("Firebase Auth Error:", err); // Log the full error for debugging
      }
      setGeneralError(errorMessage);
    } finally {
      setIsSigningUp(false); // Ensure loading state is reset
    }
  };

  // --- Render Logic ---
  return (
    <div className="w-full max-w-screen-lg mx-auto flex flex-col items-center py-4">
      <div className="flex flex-col items-center w-full py-4">
        <p className="text-golden-brown text-center text-lg mb-8 mt-2 w-full">
          החברים שלנו כבר נהנים מהיתרונות—אל תישארו מאחור. <br />הירשמו עכשיו והיו חלק מהקהילה שלנו!
        </p>

        {generalError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4 w-full max-w-lg mx-auto" role="alert">
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-yellow-500" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
            </span>
            <span className="block sm:inline pr-8">{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 w-full max-w-lg mx-auto" role="alert">
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-green-500" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.707 9.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l6-6a1 1 0 0 0-1.414-1.414L9 11.586 6.707 9.293z"/></svg>
            </span>
            <span className="block sm:inline pr-8">{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row w-full justify-center items-start md:space-x-12 space-y-6 md:space-y-0 px-4">

          <div className="md:w-1/2 w-full flex flex-col items-center">
            <form onSubmit={handleSignUp} className="w-full max-w-xs">
              <div className="mb-4 pt-0">
                <label htmlFor="fullName" className="block text-gray-text text-sm font-bold mb-2">
                  *שם מלא / שם משתמש
                </label>
                <input
                  type="text"
                  id="fullName"
                  className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${fullNameError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                  placeholder="הזן את שמך המלא או שם המשתמש"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFullNameError('');
                    setGeneralError('');
                    setSuccessMessage('');
                  }}
                  required
                  aria-label="Full name or username"
                  aria-describedby={fullNameError ? "full-name-error" : null}
                />
                {fullNameError && <p id="full-name-error" className="text-red-500 text-xs mt-1">{fullNameError}</p>}
              </div>
              <div className="mb-2">
                <label htmlFor="email" className="block text-gray-text text-sm font-bold mb-2">
                  *אימייל
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    ref={emailInputRef}
                    className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                    placeholder="הזן את כתובת האימייל שלך"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    aria-label="Email address"
                    aria-describedby={emailError ? "email-error" : null}
                  />
                  {emailError && <p id="email-error" className="text-red-500 text-xs mt-1">{emailError}</p>}

                  {/* Email domain suggestion */}
                  {showDomainSuggestion && emailDomainSuggestion && (
                    <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg mt-1 z-10">
                      <button
                        type="button"
                        onClick={applyDomainSuggestion}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        aria-label={`Append ${emailDomainSuggestion} to email`}
                      >
                        {email + emailDomainSuggestion}
                        <span className="text-gray-500 ml-1">(לחץ/י להשלמה)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="md:w-1/2 w-full flex flex-col items-center">
            <form onSubmit={handleSignUp} className="w-full max-w-xs">
              <div className="mb-4 pt-0">
                <label htmlFor="password" className="block text-gray-text text-sm font-bold mb-2">
                  *סיסמה
                </label>
                <input
                  type="password"
                  id="password"
                  className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                  placeholder="הזן את סיסמתך"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setGeneralError('');
                    setSuccessMessage('');
                    if (confirmPassword && e.target.value !== confirmPassword) {
                      setConfirmPasswordError('הסיסמאות אינן תואמות.');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  required
                  aria-label="Password"
                  aria-describedby={passwordError ? "password-error" : null}
                />
                {passwordError && <p id="password-error" className="text-red-500 text-xs mt-1">{passwordError}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-text text-sm font-bold mb-2">
                  *אימות סיסמה
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`shadow-sm appearance-none border rounded-none w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-form-border focus:ring-form-border'}`}
                  placeholder="אמת את סיסמתך"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError('');
                    setGeneralError('');
                    setSuccessMessage('');
                    if (password && e.target.value !== password) {
                      setConfirmPasswordError('הסיסמאות אינן תואמות.');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  required
                  aria-label="Confirm password"
                  aria-describedby={confirmPasswordError ? "confirm-password-error" : null}
                />
                {confirmPasswordError && <p id="confirm-password-error" className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
              </div>
            </form>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <input
            type="checkbox"
            id="rememberMeSignUp"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="form-checkbox h-4 w-4 text-golden-brown border-gray-300 rounded focus:ring-golden-brown mr-2"
            aria-label="Remember me on this device for future logins"
          />
          <label htmlFor="rememberMeSignUp" className="text-sm text-gray-text">
            זכור אותי
          </label>
        </div>

        <div className="w-full max-w-xs text-center mt-4">
          <button
            type="submit"
            onClick={handleSignUp}
            className={`bg-golden-brown text-white font-bold py-2.5 px-8 rounded-none hover:bg-golden-brown-dark focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-form-border transition duration-200 ${isSigningUp ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSigningUp}
            aria-label="Create a new account"
          >
            {isSigningUp ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'צור/צרי חשבון'
            )}
          </button>

          <p className="text-center text-gray-text text-sm mt-2">
            כבר יש לך חשבון?{' '}
            <Link
              to="/signin"
              className="font-bold text-link-blue hover:underline focus:outline-none rounded-none"
              aria-label="Sign in to your existing account"
              onClick={onSignInClick}
            >
              התחבר/י עכשב
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
