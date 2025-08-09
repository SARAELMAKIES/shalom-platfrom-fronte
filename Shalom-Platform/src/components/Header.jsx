import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import logo from '../assets/logo.png';
import defaultAvatar from '../assets/default_avatar.png'; // וודא שקובץ זה קיים בנתיב הנכון!
import * as locationsApi from '../api/locationsApi';
// Import icons (example: using SVG directly or from a library like Heroicons)
// For demonstration, I'm including SVGs directly.

const HomeIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>);
const LocationMarkerIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243m11.314 0A8.966 8.966 0 0120 12c0-7.732-6.268-14-14-14S0 4.268 0 12c0 1.761.306 3.46.859 5.065m6.82-8.354l-3.32-3.32a1.998 1.998 0 010-2.828l3.32-3.32a1.998 1.998 0 012.828 0l3.32 3.32a1.998 1.998 0 010 2.828l-3.32 3.32a1.998 1.998 0 01-2.828 0z"></path></svg>);
const AnnotationIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10M7 16h7M10 21l-3.279-3.279A2 2 0 016 16.517V15a2 2 0 00-2-2V7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-1.517A2 2 0 0016.721 21L10 21z"></path></svg>);
const PlusCircleIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const DocumentAddIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>);
const SunIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.732l-.707-.707M6.343 17.657l-.707.707M16.95 18.364l.707-.707M7.05 6.343l-.707-.707m1.99-1.99a9 9 0 11-10.607 10.607A9 9 0 0112 3z"></path></svg>);
const UserCircleIcon = () => (<svg className="w-6 h-6 text-golden-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>); // Changed size and color for prominence
const MapIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243m11.314 0A8.966 8.966 0 0120 12c0-7.732-6.268-14-14-14S0 4.268 0 12c0 1.761.306 3.46.859 5.065m6.82-8.354l-3.32-3.32a1.998 1.998 0 010-2.828l3.32-3.32a1.998 1.998 0 012.828 0l3.32 3.32a1.998 1.998 0 010 2.828l-3.32 3.32a1.998 1.998 0 01-2.828 0z"></path></svg>);
const DocumentTextIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>);
const HeartIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>);
const ChartBarIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7m0 4v4m0-4h4m-4 0H8m0 0v12c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V5c0-.552.448-1 1-1h3c.552 0 1 .448 1 1v6zm8-6V5c0-.552-.448-1-1-1h-3c-.552 0-1 .448-1 1v12c0 .552.448 1 1 1h3c.552 0 1-.448 1-1V9zm-5 0V5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1v12c0 .552.448 1 1 1h3c.552 0 1-.448 1-1V9z"></path></svg>);
const CogIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.504-1.783 2.52-1.783 3.024 0l.583 2.073c.121.43.504.708.918.784l2.074.583c1.783.504 1.783 2.52 0 3.024l-2.073.583c-.414.121-.692.504-.784.918l-.583 2.074c-.504 1.783-2.52 1.783-3.024 0l-.583-2.073c-.121-.43-.504-.708-.918-.784l-2.074-.583c-1.783-.504-1.783-2.52 0-3.024l2.073-.583c.414-.121.692.504.784-.918l.583-2.074z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const ExclamationCircleIcon = () => (<svg className="w-5 h-5 text-red-500 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const LoginIcon = () => (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h6a2 2 0 012 2v1"></path></svg>);
const UserAddIcon = () => (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2v3M9 14l3 3m0 0l3-3m-3 3V3"></path></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h6a2 2 0 012 2v1"></path></svg>);
const DocumentDraftsIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>); // New icon for drafts
const DraftIcon = () => (<svg className="w-5 h-5 text-gray-500 group-hover:text-golden-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>);

const Header = () => {
  const [user, setUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef(null);
  const mobileNavRef = useRef(null);
  
  // --- מצב זמני: האם המשתמש אדמין? ---
  // ✅ שינוי: נשתמש ב-user?.uid כדי להעביר את ה-userId האמיתי
  const [isAdmin, setIsAdmin] = useState(false); 
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ מצב חדש לשמירת ה-UID של המשתמש המחובר
  // ------------------------------------

  // --- Search states ---
  // מצב חדש לשליטה על פתיחת תפריט תוצאות החיפוש (היסטוריה/תוצאות)
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); 
  // מצב חדש לשליטה על הצגת תיבת החיפוש הניידת עצמה
  const [isMobileSearchBarActive, setIsMobileSearchBarActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const mobileSearchBarRef = useRef(null); // Ref for the mobile search bar container

  const [searchError, setSearchError] = useState(null); // Added state for search error

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const storedSearches = localStorage.getItem('recentSearches');
      return storedSearches ? JSON.parse(storedSearches) : [];
    } catch (e) {
      console.error("Failed to parse recent searches from localStorage", e);
      return [];
    }
  });

  // Effect to manage recent searches in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (e) {
      console.error("Failed to save recent searches to localStorage", e);
    }
  }, [recentSearches]);

  // Effect to focus the mobile search input when it becomes active
  useEffect(() => {
    if (isMobileSearchBarActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchBarActive]);


  // Effect for authentication state changes and click outside handlers
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // ✅ הוספתי async
      setUser(currentUser);
      if (currentUser) {
        setCurrentUserId(currentUser.uid); // ✅ שמור את ה-UID
        // כאן תוכל להוסיף לוגיקה לבדיקה אם המשתמש הוא אדמין בפועל (למשל, מול Firebase Firestore)
        // לדוגמה:
        try {
          const response = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            setIsAdmin(userData.role === 'admin');
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setCurrentUserId(null); // ✅ נקה את ה-UID כשהמשתמש מתנתק
      }
    });

    const handleClickOutside = (event) => {
      // סגור תפריט משתמש נפתח אם נלחץ מחוץ לו
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }

      // טפל בנראות תפריט החיפוש (דסקטופ ומובייל)
      const isClickInsideSearchArea =
        (searchInputRef.current && searchInputRef.current.contains(event.target)) ||
        (searchResultsRef.current && searchResultsRef.current.contains(event.target));

      if (!isClickInsideSearchArea) {
        setIsSearchDropdownOpen(false); // סגור את התפריט הנפתח אם נלחץ מחוץ לשדה הקלט/תוצאות
        setSearchError(null); // נקה שגיאות חיפוש כשהפוקוס אובד
      }

      // טפל בנראות סרגל החיפוש הנייד
      const isClickInsideMobileSearchBarArea =
        (mobileSearchBarRef.current && mobileSearchBarRef.current.contains(event.target));
      const isSearchToggleButtonClick = event.target.closest('.mobile-search-toggle-button');

      if (isMobileSearchBarActive && !isClickInsideMobileSearchBarArea && !isSearchToggleButtonClick) {
        setIsMobileSearchBarActive(false);
        setSearchTerm(''); // נקה את מונח החיפוש כשסרגל החיפוש הנייד נסגר
        setIsSearchDropdownOpen(false); // וודא שגם התפריט הנפתח נסגר
      }

      // סגור ניווט נייד אם נלחץ מחוץ לו (ולא על כפתור ההפעלה/כיבוי)
      const isNavToggleButtonClick = event.target.closest('.mobile-nav-toggle-button');
      if (isMobileNavOpen && mobileNavRef.current && !mobileNavRef.current.contains(event.target) && !isNavToggleButtonClick) {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileNavOpen, isMobileSearchBarActive]); // הוספנו את isMobileSearchBarActive כתלות

  // Effect to fetch filtered places based on search term
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') {
        setFilteredPlaces([]);
        setSearchError(null);
        return;
      }

      // try {
      //   setSearchError(null); // Clear previous errors
      //     const data = await locationsApi.searchLocations(searchTerm);
      //   // const response = await fetch(`http://localhost:3001/api/locations/search?q=${encodeURIComponent(searchTerm)}`);
      //   if (!response.ok) {
      //     throw new Error(`HTTP error! status: ${response.status}`);
      //   }
      //   const data = await response.json();
      try {
  setSearchError(null); // נקה שגיאות קודמות

  const data = await locationsApi.searchLocations(searchTerm);

  // כאן תעבדי עם התוצאה שקיבלת
  console.log('תוצאות החיפוש:', data);
  setSearchResults(data); // או מה שאת צריכה לעשות איתן
        setFilteredPlaces(data.items || []); // Backend now returns { items: [...] }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchError("Failed to fetch search results. Please try again.");
        setFilteredPlaces([]); // Clear results on error
      }
    };

    // Add a debounce to limit API calls while typing
    const handler = setTimeout(() => {
      fetchSearchResults();
    }, 300); // Debounce for 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]); // Re-run when searchTerm changes

  // Adds a search term to recent searches
  const addSearchTermToRecent = (term) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    setRecentSearches(prevSearches => {
      const newSearches = prevSearches.filter(s => s !== trimmedTerm);
      return [trimmedTerm, ...newSearches].slice(0, 5);
    });
  };

  // Handles user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserDropdownOpen(false); // סגור את התפריט הנפתח בדסקטופ
      setIsMobileNavOpen(false); // סגור את תפריט הניווט הנייד
      setIsMobileSearchBarActive(false); // סגור גם את סרגל החיפוש הנייד
      navigate('/signin');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Determines active link classes based on current path
  const getLinkClasses = (path) => {
    const baseClasses = "px-3 py-2 focus:outline-none focus:ring-2 focus:ring-golden-brown focus:ring-opacity-50 group";
    const activeClasses = "text-golden-brown font-bold bg-golden-brown-lightest rounded-md";
    const inactiveClasses = "text-gray-800 hover:text-golden-brown-dark hover:bg-gray-100 rounded-md";

    if (path === '/' && location.pathname === '/') {
        return `${baseClasses} ${activeClasses}`;
    }
    // Handle specific paths like profile/edit-profile
    if (path === '/profile') {
      if (location.pathname === '/profile' || location.pathname === '/edit-profile') {
        return `${baseClasses} ${activeClasses}`;
      }
    }
    // Handle routes that start with the path (e.g., /admin, /admin/categories)
    if (path !== '/' && location.pathname.startsWith(path)) {
      // Ensure it's a direct match or a sub-path (e.g., /admin/something, not /adminuser)
      if (location.pathname === path || location.pathname.charAt(path.length) === '/') {
        return `${baseClasses} ${activeClasses}`;
      }
    }
    return `${baseClasses} ${inactiveClasses}`;
  };


  // Handles click on a search result
  const handleSearchResultClick = (placeId, placeName) => {
    console.log('handleSearchResultClick נקראה!');
    console.log('placeId:', placeId, 'placeName:', placeName);
    console.log('מנסה לנווט אל:', `/place/${placeId}`);

    navigate(`/place/${placeId}`); // שורת הניווט בפועל

    addSearchTermToRecent(placeName);
    setSearchTerm('');
    setIsSearchDropdownOpen(false); // סגור את התפריט הנפתח
    setIsMobileSearchBarActive(false); // סגור את סרגל החיפוש הנייד אם הוא פתוח
    setIsMobileNavOpen(false); // Close mobile nav if search happens within it
  };

  // Handles click on a recent search term
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    // Optionally, you might want to trigger a search immediately here
    // Or just let the useEffect for searchTerm handle it
  };

  // Closes all modals/dropdowns after a link click
  const handleLinkClick = () => {
    setIsUserDropdownOpen(false);
    setIsMobileNavOpen(false);
    setIsMobileSearchBarActive(false); // סגור גם את סרגל החיפוש הנייד
    setSearchTerm(''); // נקה מונח חיפוש
    setIsSearchDropdownOpen(false); // נקה את תפריט החיפפוש
  };

  // Helper for displaying user's name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.displayName || user.email.split('@')[0];
  };

  // Helper for getting user's photo URL or default
  const getUserPhotoURL = () => {
    return user?.photoURL || defaultAvatar;
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center relative"> {/* Changed fixed top-0 w-full z-50 to relative */}
      <Link to="/" className="flex items-center flex-shrink-0" onClick={handleLinkClick}>
        <img src={logo} alt="Shalom Logo" className="h-10 mr-2" />
      </Link>

      {/* Desktop Main Navigation - Hidden on small/medium screens, visible on md and up */}
      <nav className="hidden md:flex space-x-2 mx-auto">
        <Link to="/" className={`${getLinkClasses('/')} text-sm`} onClick={handleLinkClick}>Home Page</Link>
        <Link to="/community-places" className={`${getLinkClasses('/community-places')} text-sm`} onClick={handleLinkClick}>Community Places</Link>
        <Link to="/community-posts" className={`${getLinkClasses('/community-posts')} text-sm`} onClick={handleLinkClick}>Community Posts</Link>
        <Link to="/add-place" className={`${getLinkClasses('/add-place')} text-sm`} onClick={handleLinkClick}>Add Place</Link>
        <Link to="/add-post" className={`${getLinkClasses('/add-post')} text-sm`} onClick={handleLinkClick}>Add Post</Link>
        <Link to="/shabbat-times" className={`${getLinkClasses('/shabbat-times')} text-sm`} onClick={handleLinkClick}>Shabbat Times</Link>
      </nav>

      {/* Search Bar (Desktop) - Hidden on small/medium screens, visible on md and up */}
      <div className="relative ml-auto hidden md:block max-w-[250px] lg:max-w-xs z-[1]">
        <input
          type="text"
          placeholder="Place search..."
          className="shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchDropdownOpen(true)} // פתח את התפריט הנפתח בפוקוס
          onBlur={() => setIsSearchDropdownOpen(false)} // סגור את התפריט הנפתח בטשטוש (יימנע ע"י onMouseDown על התפריט עצמו)
          ref={searchInputRef}
          aria-label="Search places by name or city"
        />
        {(isSearchDropdownOpen || searchTerm.trim() !== '') && ( // הצג אם התפריט פתוח או שיש טקסט חיפוש
          <div
            ref={searchResultsRef}
            onMouseDown={(e) => e.preventDefault()} // מונע את אירוע ה-blur של שדה הקלט בלחיצה על התפריט
            className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 py-1 max-h-60 overflow-y-auto z-[9999] min-w-[250px] w-full lg:min-w-[300px] animate-fade-in"
          >
            {searchError && ( // הצג הודעת שגיאה אם יש כזו
              <div className="py-2 px-4 text-center text-red-600 text-sm">
                {searchError}
              </div>
            )}
            {searchTerm.trim() === '' && recentSearches.length > 0 ? (
              <>
                <h5 className="text-xs text-gray-500 px-4 pt-2 pb-1 text-left">Recent Searches:</h5>
                <ul className="flex flex-col gap-1 px-3 pb-2">
                  {recentSearches.map((term, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleRecentSearchClick(term)}
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-md w-full text-left hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 mt-1 pt-1 text-center">
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-red-500 text-xs px-4 py-1 hover:underline"
                  >
                    Clear Searches
                  </button>
                </div>
              </>
            ) : searchTerm.trim() !== '' ? (
            filteredPlaces.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredPlaces.map(place => {
                  return (
                    <li key={place.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                        onClick={() => handleSearchResultClick(place.id, place.name)}
                    >
                      <h4 className="font-semibold text-gray-800">{place.name}</h4>
                      <p className="text-sm text-gray-500">{place.city}</p>
                    </li>
                  );
                })}
              </ul>

              ) : (
                <div className="py-2 px-4 text-center text-gray-500">No places found.</div>
              )
            ) : null}
          </div>
        )}
      </div>

      {/* User Area / Login/Signup (Desktop) - Hidden on small/medium screens, visible on md and up */}
      <div className="relative hidden md:block ml-4" ref={userDropdownRef}>
        {user ? (
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 text-golden-brown font-bold py-1 px-2 hover:text-golden-brown-dark transition duration-200 focus:outline-none"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={isUserDropdownOpen}
          >
            {/* === תמונת פרופיל ושלום, [שם משתמש] בדסקטופ === */}
            <img
              src={getUserPhotoURL()}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-golden-brown"
            />
            <span>{getUserDisplayName()}</span>
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        ) : (
          <div className="flex space-x-2">
            <Link
              to="/signin"
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
              onClick={handleLinkClick}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-golden-brown text-white py-2 px-4 rounded-md hover:bg-golden-brown-dark transition duration-200"
              onClick={handleLinkClick}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* User Dropdown Menu (Desktop) */}
        {user && isUserDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
           <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>My Profile</Link>
<Link to="/my-locations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>My Locations</Link>
<Link to="/my-posts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>My Posts</Link>
<Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>Favorites</Link>
<Link to="/my-activity" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>My Activity</Link>

{/* Updated My Drafts link to be consistent and include the icon */}
<Link to="/my-drafts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem" onClick={handleLinkClick}>
  <DocumentDraftsIcon /> <span className="ml-2">My Drafts</span>
</Link>

{isAdmin && currentUserId && ( // ✅ וודא ש-currentUserId קיים לפני יצירת הקישורים
  <>
    {/* קישור מעודכן ל"מסך מנהל" בדסקטופ */}
    <Link to={`/admin?userId=${currentUserId}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold text-golden-brown-dark" role="menuitem" onClick={handleLinkClick}>מסך מנהל</Link>
    <Link to={`/admin/categories?userId=${currentUserId}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>ניהול קטגוריות</Link>
    <Link to={`/admin/reports?userId=${currentUserId}`} className="block px-4 py-2 text-sm text-red-600 font-bold hover:bg-gray-100" role="menuitem" onClick={handleLinkClick}>Manage Reports</Link>
  </>
)}
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200 mt-1 pt-1" role="menuitem">Logout</button>
          </div>
        )}
      </div>

      {/* Mobile-specific elements: Search Icon and Navigation Toggle (visible on small/medium screens, hidden on md and up) */}
      <div className="flex items-center md:hidden ml-auto">
        {/* Search Icon for Mobile */}
        <button
          onClick={() => setIsMobileSearchBarActive(!isMobileSearchBarActive)} // הפעל/כבה את סרגל החיפוש הנייד
          className="mobile-search-toggle-button text-gray-800 hover:text-golden-brown focus:outline-none focus:ring-2 focus:ring-golden-brown p-2 rounded-full mr-2"
          aria-label="Toggle search input"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>

        {/* Mobile Navigation Toggle Button (e.g., Hamburger) */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="mobile-nav-toggle-button text-gray-800 hover:text-golden-brown focus:outline-none focus:ring-2 focus:ring-golden-brown p-2 rounded-full ml-2"
          aria-label="Toggle main navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileNavOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Search Bar (appears when search icon clicked) */}
      {/* This search bar takes full width below the header on mobile when activated. */}
      {isMobileSearchBarActive && ( // הצג רק אם isMobileSearchBarActive הוא true
        <div 
          className="md:hidden absolute top-full left-0 right-0 p-4 bg-white shadow-lg z-50"
          ref={mobileSearchBarRef} // Ref חדש לאזור סרגל החיפוש הנייד
        >
          <input
            type="text"
            placeholder="Search places or cities..."
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchDropdownOpen(true)} // פתח את התפריט הנפתח בפוקוס
            onBlur={() => setIsSearchDropdownOpen(false)} // סגור את התפריט הנפתח בטשטוש (יימנע ע"י onMouseDown על התפריט עצמו)
            ref={searchInputRef}
            aria-label="Search places by name or city"
          />
          {/* Search Results / Recent Searches (same as desktop, but placed here for mobile layout) */}
          {(isSearchDropdownOpen || searchTerm.trim() !== '') && ( // הצג אם התפריט פתוח או שיש טקסט חיפוש
            <div
              ref={searchResultsRef}
              onMouseDown={(e) => e.preventDefault()} // מונע את אירוע ה-blur של שדה הקלט בלחיצה על התפריט
              className="bg-white border border-gray-200 rounded-lg shadow-lg mt-2 py-1 max-h-60 overflow-y-auto z-[9999] w-full animate-fade-in"
            >
              {searchError && ( // הצג הודעת שגיאה אם יש כזו
                <div className="py-2 px-4 text-center text-red-600 text-sm">
                  {searchError}
                </div>
              )}
              {searchTerm.trim() === '' && recentSearches.length > 0 ? (
                <>
                  <h5 className="text-xs text-gray-500 px-4 pt-2 pb-1 text-left">Recent Searches:</h5>
                  <ul className="flex flex-col gap-1 px-3 pb-2">
                    {recentSearches.map((term, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleRecentSearchClick(term)}
                          className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-md w-full text-left hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-100 mt-1 pt-1 text-center">
                    <button
                      onClick={() => setRecentSearches([])}
                      className="text-red-500 text-xs px-4 py-1 hover:underline"
                    >
                      Clear Searches
                    </button>
                  </div>
                </>
              ) : searchTerm.trim() !== '' ? (
                filteredPlaces.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {filteredPlaces.map(place => (

                      <li key={place.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                          onClick={() => handleSearchResultClick(place.id, place.name)}
                      >
                        <h4 className="font-semibold text-gray-800">{place.name}</h4>
                        <p className="text-sm text-gray-500">{place.city}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-2 px-4 text-center text-gray-500">No places found.</div>
                )
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Mobile Navigation Modal (המבורגר) */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-end md:hidden animate-fade-in"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            ref={mobileNavRef}
            className="bg-white w-full max-w-xs h-full overflow-y-auto p-4 shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()} // מונע סגירה בלחיצה בתוך הניווט
            style={{ transform: isMobileNavOpen ? 'translateX(0)' : 'translateX(100%)' }} // החלקה מימין
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="text-gray-800 hover:text-golden-brown focus:outline-none focus:ring-2 focus:ring-golden-brown p-1 rounded-full"
                aria-label="Close navigation menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              {/* === אזור המשתמש בתוך תפריט ההמבורגר (מוצג בבולטות למעלה) === */}
              {user && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <Link to="/profile" onClick={handleLinkClick} className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={getUserPhotoURL()}
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-golden-brown"
                    />
                    <div className="ml-3">
                      <p className="text-lg font-bold text-golden-brown">שלום, {getUserDisplayName()}</p>
                      <p className="text-sm text-gray-600">View Profile</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Main Navigation Links with Icons */}
              <Link to="/" className={`${getLinkClasses('/')} text-lg flex items-center`} onClick={handleLinkClick}>
                <HomeIcon /> <span className="ml-2">Home Page</span>
              </Link>
              <Link to="/community-places" className={`${getLinkClasses('/community-places')} text-lg flex items-center`} onClick={handleLinkClick}>
                <LocationMarkerIcon /> <span className="ml-2">Community Places</span>
              </Link>
              <Link to="/community-posts" className={`${getLinkClasses('/community-posts')} text-lg flex items-center`} onClick={handleLinkClick}>
                <AnnotationIcon /> <span className="ml-2">Community Posts</span>
              </Link>
              <Link to="/add-place" className={`${getLinkClasses('/add-place')} text-lg flex items-center`} onClick={handleLinkClick}>
                <PlusCircleIcon /> <span className="ml-2">Add Place</span>
              </Link>
              <Link to="/add-post" className={`${getLinkClasses('/add-post')} text-lg flex items-center`} onClick={handleLinkClick}>
                <DocumentAddIcon /> <span className="ml-2">Add Post</span>
              </Link>
              <Link to="/shabbat-times" className={`${getLinkClasses('/shabbat-times')} text-lg flex items-center`} onClick={handleLinkClick}>
                <SunIcon /> <span className="ml-2">Shabbat Times</span>
              </Link>

              {/* User Links (if logged in) */}
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2"></div>
                  {/* These are the specific profile links, might consider moving some to a sub-menu under "My Profile" if the list gets too long */}
                  <Link to="/my-locations" className={`${getLinkClasses('/my-locations')} text-lg flex items-center`} onClick={handleLinkClick}><MapIcon /> <span className="ml-2">My Locations</span></Link>
                  <Link to="/my-posts" className={`${getLinkClasses('/my-posts')} text-lg flex items-center`} onClick={handleLinkClick}><DocumentTextIcon /> <span className="ml-2">My Posts</span></Link>
                  <Link to="/favorites" className={`${getLinkClasses('/favorites')} text-lg flex items-center`} onClick={handleLinkClick}><HeartIcon /> <span className="ml-2">Favorites</span></Link>
                  <Link to="/my-activity" className={`${getLinkClasses('/my-activity')} text-lg flex items-center`} onClick={handleLinkClick}><ChartBarIcon /> <span className="ml-2">My Activity</span></Link>
                  {/* New link for Drafts in mobile menu */}
                  <Link to="/my-drafts" className={`${getLinkClasses('/my-drafts')} text-lg flex items-center`} onClick={handleLinkClick}> {/* Changed /drafts to /my-drafts */}
                    <DocumentDraftsIcon /> <span className="ml-2">My Drafts</span>
                  </Link>

                  {isAdmin && currentUserId && ( // ✅ וודא ש-currentUserId קיים לפני יצירת הקישורים
                    <>
                      {/* קישור ל"מסך מנהל" בתוך תפריט המובייל - הוספתי אותו כאן! */}
                      <Link to={`/admin?userId=${currentUserId}`} className={`${getLinkClasses('/admin')} text-lg flex items-center font-bold text-golden-brown-dark`} onClick={handleLinkClick}>
                        <ChartBarIcon /> <span className="ml-2">מסך מנהל</span>
                      </Link>
                      <Link to={`/admin/categories?userId=${currentUserId}`} className={`${getLinkClasses('/admin/categories')} text-lg flex items-center`} onClick={handleLinkClick}><CogIcon /> <span className="ml-2">ניהול קטגוריות</span></Link>
                      <Link to={`/admin/reports?userId=${currentUserId}`} className={`${getLinkClasses('/admin/reports')} text-lg flex items-center text-red-600 font-bold`} onClick={handleLinkClick}><ExclamationCircleIcon /> <span className="ml-2">Manage Reports</span></Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"><LogoutIcon /> <span className="ml-2">Logout</span></button>
                </>
              )}
              {/* Login/Signup Links (if not logged in) */}
              {!user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link to="/signin" className="block bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200 text-center flex items-center justify-center" onClick={handleLinkClick}><LoginIcon /> <span className="ml-2">Login</span></Link>
                  <Link to="/signup" className="block bg-golden-brown text-white py-2 px-4 mt-2 rounded-md hover:bg-golden-brown-dark transition duration-200 text-center flex items-center justify-center" onClick={handleLinkClick}><UserAddIcon /> <span className="ml-2">Sign Up</span></Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
