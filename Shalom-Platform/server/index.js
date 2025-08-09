const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = 3001;
const { v4: uuidv4 } = require('uuid');

// הגדרות אחסון לקבצים המועלים (תמונות)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // תיקיית היעד לשמירת קבצים
  },
  filename: (req, file, cb) => {
    // שם הקובץ יהיה חותמת זמן + שם הקובץ המקורי
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage }); // יצירת מופע של multer עם הגדרות האחסון

// Middlewares - פונקציות שרצות לפני הטיפול בבקשות
app.use(cors()); // מאפשר בקשות ממקורות שונים (לדוגמה, מה-Frontend שלך שרץ בפורט אחר)
app.use(express.json()); // מנתח בקשות עם גוף בפורמט JSON
app.use('/uploads', express.static('uploads')); // מגיש קבצים סטטיים מהתיקייה 'uploads'

// נתוני דמה (In-memory data stores) - אלו מערכים ששומרים את הנתונים כל עוד השרת פועל.
// ברגע שהשרת נכבה, הנתונים אובדים. בפרויקט אמיתי, נשתמש במסד נתונים.

let locations = []; // מערך מיקומים ריק בתחילה - ישתמש רק במיקומים שנוספו ע"י משתמשים

let posts = []; // מערך לפוסטים

// ✅ שינוי קריטי: הגדרת משתמש המנהל עם ה-UID האמיתי שלך
// ה-UID מהקונסול שלך הוא: 2ZtQ98Z7XbUkAwKfi0u0cE1hI
const ADMIN_UID = 'xIrFhcm8azWFFMVMgpl8exW0rcB2'; 

let users = [
  { id: ADMIN_UID , name: 'מנהל מערכת', email: 'admin@gmail.com', role: 'admin', phoneNumber: '054-8567714' },
  { id: 'testUser1', name: 'משתמש בדיקה 1', email: 'test1@example.com', role: 'user' },
  { id: 'testUser2', name: 'משתמש בדיקה 2', email: 'test2@example.com', role: 'user' },
  { id: '2zZtOM8z75Oukavkf8iUVbCEitH3', name: 'נעמה פרץ', email: 'nape1412@gmail.com', role: 'user', city: 'תל אביב', phoneNumber: '054-1234567' },
];

let likes = []; // מערך ללייקים
const comments = []; // מערך לתגובות
const reports = []; // מערך לדיווחים
let favorites = []; // מערך למועדפים
let drafts = []; // מערך לטיוטות

// ✅ מערך חדש לקטגוריות
let categories = [
  { id: 'cat1', name: 'מסעדות', type: 'location' },
  { id: 'cat2', name: 'מאפיות', type: 'location' },
  { id: 'cat3', name: 'בתי קפה', type: 'location' },
  { id: 'cat4', name: 'אחר', type: 'location' }, // קטגוריית "אחר" למיקומים
  { id: 'cat5', name: 'חדשות', type: 'post' },
  { id: 'cat6', name: 'אירועים', type: 'post' },
  { id: 'cat7', name: 'הודעות', type: 'post' },
  { id: 'cat8', name: 'שיעורים', type: 'post' },
  { id: 'cat9', name: 'אחר', type: 'post' }, // קטגוריית "אחר" לפוסטים
];

// ✅ הגדרת סיבות הדיווח עם ה-labels בעברית (כמו ב-frontend)
const reportReasonsMap = {
  'offensive_content': 'תוכן פוגעני או מעליב',
  'hate_speech': 'דברי שנאה או הסתה',
  'misleading_info': 'מידע שגוי או מטעה',
  'inappropriate_content': 'תוכן לא ראוי/בלתי הולם',
  'incorrect_location': 'מיקום שגוי או לא קיים',
  'duplicate_spam': 'תוכן כפול או ספאם',
  'privacy_violation': 'פגיעה בפרטיות או מידע רגיש',
  'irrelevant_fake_images': 'תמונות לא רלוונטיות / מזויפות',
  'unauthorized_commercial': 'פרסום מסחרי לא מורשה',
  'other': 'אחר (פרט)',
};


// --- פונקציית עזר לבדיקת הרשאות אדמין ---
const isAdminUser = (userId) => {
  const user = users.find(u => u.id === userId);
  return user && user.role === 'admin';
};

// --- נקודות קצה (API Endpoints) ---

// ✅ נקודות קצה לניהול קטגוריות
app.get('/api/categories', (req, res) => {
  const { type } = req.query; // ניתן לסנן לפי type (location/post)
  let filteredCategories = categories;
  if (type) {
    filteredCategories = categories.filter(cat => cat.type === type);
  }
  console.log(`📚 אחזור קטגוריות (type: ${type || 'all'}):`, filteredCategories.length);
  res.json(filteredCategories);
});

app.post('/api/categories', (req, res) => {
  const { name, type, userId } = req.body;

  if (!isAdminUser(userId)) {
    return res.status(403).json({ error: 'Not authorized. Admin access required.' });
  }

  if (!name || !type) {
    return res.status(400).json({ error: 'Missing category name or type' });
  }
  if (!['location', 'post'].includes(type)) {
    return res.status(400).json({ error: 'Invalid category type. Must be "location" or "post".' });
  }

  const newCategory = {
    id: uuidv4(),
    name,
    type,
    created_at: new Date().toISOString()
  };
  categories.push(newCategory);
  console.log('➕ קטגוריה חדשה נוצרה:', newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, userId } = req.body;

  if (!isAdminUser(userId)) {
    return res.status(403).json({ error: 'Not authorized. Admin access required.' });
  }

  const categoryIndex = categories.findIndex(cat => cat.id === id);
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  if (name !== undefined) categories[categoryIndex].name = name;
  if (type !== undefined) {
    if (!['location', 'post'].includes(type)) {
      return res.status(400).json({ error: 'Invalid category type. Must be "location" or "post".' });
    }
    categories[categoryIndex].type = type;
  }
  console.log('✏️ קטגוריה עודכנה:', categories[categoryIndex]);
  res.json(categories[categoryIndex]);
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query; // קבלת userId מ-query parameters

  if (!isAdminUser(userId)) {
    return res.status(403).json({ error: 'Not authorized. Admin access required.' });
  }

  const initialLength = categories.length;
  categories = categories.filter(cat => cat.id !== id);

  if (categories.length < initialLength) {
    console.log('🗑️ קטגוריה נמחקה:', id);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});


// נקודות קצה למשתמשים
app.post('/api/users', (req, res) => {
  const { id, name, email, role = 'user', city, phoneNumber } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ error: 'Missing required user fields (id, name, email)' });
  }

  const existingUserIndex = users.findIndex(u => u.id === id);
  if (existingUserIndex !== -1) {
    console.log(`ℹ️ User with ID ${id} already exists in backend. Updating existing user.`);
    users[existingUserIndex].name = name;
    users[existingUserIndex].email = email;
    users[existingUserIndex].role = (id === ADMIN_UID) ? 'admin' : role; 
    users[existingUserIndex].city = city || users[existingUserIndex].city;
    users[existingUserIndex].phoneNumber = phoneNumber || users[existingUserIndex].phoneNumber;
    return res.status(200).json({ success: true, user: users[existingUserIndex], message: 'User updated successfully' });
  }

  const newUser = {
    id,
    name,
    email,
    role: (id === ADMIN_UID) ? 'admin' : role, 
    city: city || '',
    phoneNumber: phoneNumber || '',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  console.log('👤 משתמש חדש נוצר ב-backend:', newUser);
  res.status(201).json({ success: true, user: newUser, message: 'User created successfully' });
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, city, phoneNumber, role } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (name !== undefined) users[userIndex].name = name;
  if (email !== undefined) users[userIndex].email = email;
  if (city !== undefined) users[userIndex].city = city;
  if (phoneNumber !== undefined) users[userIndex].phoneNumber = phoneNumber;
  if (role !== undefined && userId !== ADMIN_UID) users[userIndex].role = role;

  console.log('✏️ משתמש עודכן ב-backend:', users[userIndex]);
  res.status(200).json({ success: true, user: users[userIndex], message: 'User profile updated successfully' });
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.get('/api/users/:userId/activity-summary', (req, res) => {
  const { userId } = req.params;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userPosts = posts.filter(p => p.user_id === userId);
  const totalPosts = userPosts.length;

  const userLocations = locations.filter(l => l.user_id === userId);
  const totalLocations = userLocations.length;

  const userContentIds = [
    ...userPosts.map(p => p.id),
    ...userLocations.map(l => l.id)
  ];

  const totalLikesReceived = likes.filter(like => userContentIds.includes(like.item_id)).length;

  const totalCommentsReceived = comments.filter(comment => userContentIds.includes(comment.item_id)).length;


  const summary = {
    userId: userId,
    totalPosts: totalPosts,
    totalLocations: totalLocations,
    totalLikesReceived: totalLikesReceived,
    totalCommentsReceived: totalCommentsReceived
  };

  console.log(`📊 סיכום פעילות עבור משתמש ${userId}:`, summary);
  res.json(summary);
});


// נקודות קצה לדיווחים
app.post('/api/reports', (req, res) => {
  const { item_type, item_id, user_id, reason } = req.body;

  if (!item_type || !item_id || !user_id || !reason) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const newReport = {
    id: uuidv4(),
    item_type,
    item_id,
    user_id,
    reason,
    status: 'open',
    created_at: new Date().toISOString()
  };

  reports.push(newReport);
  console.log('📣 דיווח חדש:', newReport);
  res.status(201).json({ success: true, report: newReport });
});

app.get('/api/reports', (req, res) => {
  const { type, status } = req.query;

  let filteredReports = reports;

  if (type && (type === 'location' || type === 'post')) {
    filteredReports = filteredReports.filter(report => report.item_type === type);
  }

  if (status && ['open', 'in_review', 'pending_action', 'resolved'].includes(status)) {
    filteredReports = filteredReports.filter(report => report.status === status);
  }

  const enrichedReports = filteredReports.map(report => {
    const user = users.find(u => u.id === report.user_id);
    let category_name = 'לא ידוע';
    let item;
    if (report.item_type === 'location') {
      item = locations.find(loc => loc.id === report.item_id);
    } else if (report.item_type === 'post') {
      item = posts.find(post => post.id === report.item_id);
    }
    if (item && item.category_id) {
      const category = categories.find(cat => cat.id === item.category_id);
      category_name = category ? category.name : 'לא ידוע';
    }

    // ✅ מיפוי סיבת הדיווח מה-value ל-label בעברית
    const displayReason = reportReasonsMap[report.reason] || report.reason;

    return {
      ...report,
      user_name: user ? user.name : 'משתמש לא ידוע', // ✅ וודא ששם המשתמש נשלף
      category_name: category_name,
      display_reason: displayReason, // ✅ הוספת השדה החדש עם הסיבה בעברית
    };
  });

  console.log(`📊 אחזור דיווחים (type: ${type || 'all'}, status: ${status || 'all'}): ${enrichedReports.length} דיווחים`);
  res.status(200).json(enrichedReports);
});

app.put('/api/reports/:reportId/status', (req, res) => {
  const { reportId } = req.params;
  const { userId, newStatus } = req.body;

  if (!isAdminUser(userId)) {
    return res.status(403).json({ error: 'Not authorized. Admin access required to change report status.' });
  }

  if (!newStatus || !['open', 'in_review', 'pending_action', 'resolved'].includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid new status provided. Must be "open", "in_review", "pending_action", or "resolved".' });
  }

  const reportIndex = reports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return res.status(404).json({ message: 'Report not found' });
  }

  reports[reportIndex].status = newStatus;
  reports[reportIndex].updated_at = new Date().toISOString();

  if (newStatus === 'resolved') {
    reports[reportIndex].resolved_by = userId;
    reports[reportIndex].resolved_at = new Date().toISOString();
  } else {
    delete reports[reportIndex].resolved_by;
    delete reports[reportIndex].resolved_at;
  }

  console.log(`✅ דיווח ${reportId} שונה סטטוס ל: ${newStatus} על ידי ${userId}`);
  res.status(200).json({ success: true, report: reports[reportIndex], message: `Report status changed to ${newStatus} successfully!` });
});

// נקודות קצה למיקומים
app.post('/api/locations/:id/view', (req, res) => {
  const locId = req.params.id;
  const loc = locations.find(l => l.id === locId);
  if (!loc) return res.status(404).json({ error: 'Location not found' });
  loc.views = (loc.views || 0) + 1;
  res.json({ success: true, views: loc.views });
});

app.get('/api/locations', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const userId = req.query.userId; 
  const category_id = req.query.category_id; 

  console.log(`--- GET /api/locations ---`);
  console.log(`Received userId for filtering: "${userId}"`);
  console.log(`Received category_id for filtering: "${category_id}"`); 
  console.log(`Current total locations in memory: ${locations.length}`);


  let filteredLocations = locations;
  if (userId && typeof userId === 'string' && userId.trim() !== '') { 
    filteredLocations = locations.filter(loc => {
      const isMatch = loc.user_id === userId;
      return isMatch;
    });
    console.log(`Filtered locations count for userId "${userId}": ${filteredLocations.length}`);
  } else {
    console.log(`No userId provided or invalid. Returning all locations.`);
  }

  if (category_id && category_id !== 'all') {
    filteredLocations = filteredLocations.filter(loc => loc.category_id === category_id);
    console.log(`Further filtered locations by category_id "${category_id}": ${filteredLocations.length}`);
  }


  const enrichedLocations = filteredLocations.map(location => { 
    const user = users.find(u => u.id === location.user_id);
    const category = categories.find(cat => cat.id === location.category_id);
    return {
      ...location,
      user_name: user ? user.name : 'Anonymous',
      category_name: category ? category.name : 'Unknown Category' 
    };
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagedItems = enrichedLocations.slice(startIndex, endIndex);
  const hasMore = endIndex < enrichedLocations.length;

  res.json({
    items: pagedItems,
    hasMore,
  });
});

app.get('/api/locations/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  console.log(`Received GET request for /api/locations/search with query: "${query}"`);

  const filtered = locations.filter(place =>
    (place.name && place.name.toLowerCase().includes(query)) ||
    (place.city && place.city.toLowerCase().includes(query)) ||
    (place.description && place.description.toLowerCase().includes(query))
  );

  const enrichedFilteredPlaces = filtered.map(place => {
    const user = users.find(u => u.id === place.user_id);
    const category = categories.find(cat => cat.id === place.category_id);
    return {
      ...place,
      user_name: user ? user.name : 'Anonymous',
      category_name: category ? category.name : 'Unknown Category' 
    };
  });

  res.json({ items: enrichedFilteredPlaces });
});

app.post('/api/locations', upload.array('images'), (req, res) => {
  const {
    name, description, category_id, lat, lng,
    city, area, country,
    like_count, comment_count, user_id, 
    restaurantType, kosherAuthority, kosherAuthorityOther, customCategoryName,
    existing_images
  } = req.body;

  if (!name || !category_id) {
    return res.status(400).json({ error: 'Missing name or category_id' });
  }

  let allImages = [];
  if (req.files) {
    allImages = req.files.map((f) => f.filename);
  }
  if (existing_images) {
    try {
      const parsedExistingImages = JSON.parse(existing_images);
      allImages = [...allImages, ...parsedExistingImages];
    } catch (e) {
      console.error("Failed to parse existing_images:", e);
    }
  }

  const newLocation = {
    id: uuidv4(),
    name,
    description: description || '',
    category_id,
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
    city: city || '',
    area: area || '',
    country: country || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(), 
    like_count: like_count ? Number(like_count) : 0,
    comment_count: comment_count ? Number(comment_count) : 0,
    user_id: user_id || null, 
    images: allImages,
    views: 0,
    restaurantType: restaurantType || '',
    kosherAuthority: kosherAuthority || '',
    kosherAuthorityOther: kosherAuthorityOther || '',
    customCategoryName: customCategoryName || '',
  };

  locations.push(newLocation);
  const user = users.find((u) => u.id === user_id);
  const category = categories.find(cat => cat.id === newLocation.category_id);
  console.log('📍 מיקום חדש התקבל ונשמר:', newLocation.id, 'עם user_id:', newLocation.user_id); 
  console.log('Current locations array size:', locations.length); 

  res.status(201).json({
    ...newLocation,
    user_name: user ? user.name : 'Anonymous',
    category_name: category ? category.name : 'Unknown Category' 
  });
});

app.put('/api/locations/:id', upload.array('images'), (req, res) => {
  const { id } = req.params;
  const {
    name, description, category_id, lat, lng,
    city, area, country,
    restaurantType, kosherAuthority, kosherAuthorityOther, customCategoryName,
    existing_images, user_id, 
  } = req.body;

  const locationIndex = locations.findIndex(loc => loc.id === id);

  if (locationIndex === -1) {
    return res.status(404).json({ message: 'Location not found' });
  }

  const existingLocation = locations[locationIndex];

  console.log(`--- בדיקת הרשאות למיקום ${id} ---`);
  console.log(`יוצר המיקום (existingLocation.user_id): ${existingLocation.user_id}`);
  console.log(`משתמש מבצע פעולה (user_id מהבקשה): ${user_id}`);
  const requestingUser = users.find(u => u.id === user_id);
  const userRole = requestingUser?.role;
  console.log(`תפקיד המשתמש המבצע (userRole): ${userRole}`);
  console.log(`האם המשתמש הוא יוצר הממיקום? ${existingLocation.user_id === user_id}`);
  console.log(`האם המשתמש הוא אדמין? ${userRole === 'admin'}`);

  if (existingLocation.user_id !== user_id && userRole !== 'admin') {
      console.warn(`🚫 ניסיון עדכון לא מורשה: מיקום ${id} על ידי משתמש ${user_id} עם תפקיד ${userRole}. יוצר המיקום: ${existingLocation.user_id}`);
      return res.status(403).json({ error: 'Not authorized to update this location' });
  }

  let allImages = [];
  if (req.files) {
    allImages = req.files.map((f) => f.filename);
  }
  if (existing_images) {
    try {
      const parsedExistingImages = JSON.parse(existing_images);
      allImages = [...allImages, ...parsedExistingImages];
    } catch (e) {
      console.error("Failed to parse existing_images for update:", e);
    }
  }

  const updatedLocation = {
    ...existingLocation,
    name: name || existingLocation.name,
    description: description || existingLocation.description,
    category_id: category_id || existingLocation.category_id,
    lat: lat ? Number(lat) : existingLocation.lat,
    lng: lng ? Number(lng) : existingLocation.lng,
    city: city || existingLocation.city,
    area: area || existingLocation.area,
    country: country || existingLocation.country,
    images: allImages,
    restaurantType: restaurantType || existingLocation.restaurantType,
    kosherAuthority: kosherAuthority || existingLocation.kosherAuthority,
    kosherAuthorityOther: kosherAuthorityOther || existingLocation.kosherAuthorityOther,
    customCategoryName: customCategoryName || existingLocation.customCategoryName,
    updated_at: new Date().toISOString(), 
  };

  locations[locationIndex] = updatedLocation;
  const user = users.find(u => u.id === updatedLocation.user_id);
  const category = categories.find(cat => cat.id === updatedLocation.category_id);
  console.log('✏️ מיקום עודכן:', updatedLocation.id, 'עם user_id:', updatedLocation.user_id); 

  res.json({
    ...updatedLocation,
    user_name: user ? user.name : 'Anonymous',
    category_name: category ? category.name : 'Unknown Category' 
  });
});

app.get('/api/locations/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  console.log(`--- GET /api/locations/user/${userId} ---`);
  console.log(`Filtering locations for user ID: "${userId}"`);
  console.log(`Total locations in memory: ${locations.length}`);
  console.log(`Requested page: ${page}, limit: ${limit}`);

  const userLocations = locations
    .filter(loc => {
      const isMatch = loc.user_id === userId;
      console.log(`  Location ID: ${loc.id}, Stored user ID: ${loc.user_id}, Match: ${isMatch}`);
      return isMatch;
    })
    .map(loc => {
      const category = categories.find(cat => cat.id === loc.category_id);
      return {
        ...loc,
        user_name: user ? user.name : 'Anonymous',
        category_name: category ? category.name : 'Unknown Category' 
      };
    });

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pagedItems = userLocations.slice(startIndex, endIndex);
  const hasMore = endIndex < userLocations.length;

  console.log(`Found ${userLocations.length} locations for user "${userId}". Returning ${pagedItems.length} for page ${page}. hasMore: ${hasMore}`);
  res.json({ items: pagedItems, hasMore });
});

// ✅ נקודת קצה: קבלת מיקום בודד לפי ID - עכשיו עם העשרת נתונים
app.get('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  const location = locations.find(loc => loc.id === id);
  if (location) {
    const user = users.find(u => u.id === location.user_id);
    const category = categories.find(cat => cat.id === location.category_id);
    res.json({
      ...location,
      user_name: user ? user.name : 'Anonymous',
      category_name: category ? category.name : 'Unknown Category' 
    });
  } else {
    res.status(404).json({ message: 'Location not found' });
  }
});

app.delete('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  const userRole = req.query.role; 

  const locationIndex = locations.findIndex(loc => loc.id === id);
  if (locationIndex === -1) {
    return res.status(404).send('Location not found');
  }

  const locationToDelete = locations[locationIndex];

  const user = users.find(u => u.id === userId); 
  const actualUserRole = user?.role; 

  if (locationToDelete.user_id !== userId && actualUserRole !== 'admin') {
    console.warn(`🚫 ניסיון מחיקה לא מורשה: מיקום ${id} על ידי משתמש ${userId} עם תפקיד ${actualUserRole}. יוצר המיקום: ${locationToDelete.user_id}`);
    return res.status(403).json({ error: 'Not authorized to delete this location.' });
  }

  locations.splice(locationIndex, 1);
  console.log(`🗑️ מיקום נמחק: ${id}`);
  res.status(204).send(); 
});

// נקודות קצה לפוסטים
app.post('/api/posts/:id/view', (req, res) => {
  const postId = req.params.id;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.views = (post.views || 0) + 1;
  res.json({ success: true, views: post.views });
});

app.post('/api/posts', upload.array('images'), (req, res) => {
  const {
    title, content, user_id, 
    location_id, category_id,
    existing_images
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }

  let allImages = [];
  if (req.files) {
    allImages = req.files.map((f) => f.filename);
  }
  if (existing_images) {
    try {
      const parsedExistingImages = JSON.parse(existing_images);
      allImages = [...allImages, ...parsedExistingImages];
    } catch (e) {
      console.error("Failed to parse existing_images for post:", e);
    }
  }

  const newPost = {
    id: uuidv4(),
    title,
    content,
    user_id: user_id || null, 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(), 
    location_id: location_id || null,
    category_id: category_id || null,
    images: allImages,
    views: 0,
  };

  posts.push(newPost);
  const user = users.find((u) => u.id === user_id);
  const category = categories.find(cat => cat.id === newPost.category_id);
  console.log('📝 פוסט חדש התקבל ונשמר:', newPost.id, 'עם user_id:', newPost.user_id); 
  console.log('Current posts array size:', posts.length); 

  res.status(201).json({
    ...newPost,
    user_name: user ? user.name : 'Anonymous',
    category_name: category ? category.name : 'Unknown Category' 
  });
});

app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const userId = req.query.userId; 
  const category_id = req.query.category_id; 

  console.log(`--- GET /api/posts ---`);
  console.log(`Received userId for filtering: "${userId}"`);
  console.log(`Received category_id for filtering: "${category_id}"`); 
  console.log(`Current total posts in memory: ${posts.length}`);

  let filteredPosts = [...posts]; 
  if (userId && typeof userId === 'string' && userId.trim() !== '') { 
    filteredPosts = posts.filter(post => {
      const isMatch = post.user_id === userId;
      console.log(`  Post ID: ${post.id}, Stored user ID: ${post.user_id}, Match: ${isMatch}`);
      return isMatch;
    });
    console.log(`Filtered posts count for userId "${userId}": ${filteredPosts.length}`);
  } else {
    console.log(`No userId provided or invalid. Returning all posts.`);
  }

  if (category_id && category_id !== 'all') {
    filteredPosts = filteredPosts.filter(post => post.category_id === category_id);
    console.log(`Further filtered posts by category_id "${category_id}": ${filteredPosts.length}`);
  }

  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pagedPosts = sortedPosts.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedPosts.length; 

  const enrichedPosts = pagedPosts.map(post => {
    const user = users.find(u => u.id === post.user_id);
    const category = categories.find(cat => cat.id === post.category_id);
    return {
      ...post,
      user_name: user ? user.name : 'Anonymous',
      category_name: category ? category.name : 'Unknown Category' 
    };
  });

  res.json({
    items: enrichedPosts,
    hasMore,
  });
});

app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const post = posts.find(p => p.id === id);
  if (post) {
    const category = categories.find(cat => cat.id === post.category_id);
    const user = users.find(u => u.id === post.user_id);
    res.json({
      ...post,
      category_name: category ? category.name : 'Unknown Category',
      user_name: user ? user.name : 'Anonymous'
    });
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

app.put('/api/posts/:id', upload.array('images'), (req, res) => {
  const { id } = req.params;
  const {
    title, content, user_id, 
    location_id, category_id,
    existing_images
  } = req.body;

  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const existingPost = posts[postIndex];

  const requestingUser = users.find(u => u.id === user_id);
  const userRole = requestingUser?.role; 

  console.log(`--- בדיקת הרשאות לפוסט ${id} ---`);
  console.log(`יוצר הפוסט (existingPost.user_id): ${existingPost.user_id}`);
  console.log(`משתמש מבצע פעולה (user_id מהבקשה): ${user_id}`);
  console.log(`תפקיד המשתמש המבצע (userRole): ${userRole}`);
  console.log(`האם המשתמש הוא יוצר הפוסט? ${existingPost.user_id === user_id}`);
  console.log(`האם המשתמש הוא אדמין? ${userRole === 'admin'}`);

  if (existingPost.user_id !== user_id && userRole !== 'admin') {
    console.warn(`🚫 ניסיון עדכון פוסט לא מורשה: פוסט ${id} על ידי משתמש ${user_id} עם תפקיד ${userRole}. יוצר הפוסט: ${existingPost.user_id}`);
    return res.status(403).json({ error: 'Not authorized to update this post.' });
  }

  let allImages = [];
  if (req.files) {
    allImages = req.files.map((f) => f.filename);
  }
  if (existing_images) {
    try {
      const parsedExistingImages = JSON.parse(existing_images);
      allImages = [...allImages, ...parsedExistingImages];
    } catch (e) {
      console.error("Failed to parse existing_images for post update:", e);
    }
  }

  const updatedPost = {
    ...existingPost,
    title: title || existingPost.title,
    content: content || existingPost.content,
    location_id: location_id || existingPost.location_id,
    category_id: category_id || existingPost.category_id,
    images: allImages,
    updated_at: new Date().toISOString(), 
  };

  posts[postIndex] = updatedPost;
  const user = users.find(u => u.id === updatedPost.user_id);
  const category = categories.find(cat => cat.id === updatedPost.category_id);
  console.log('✏️ פוסט עודכן:', updatedPost.id, 'עם user_id:', updatedPost.user_id); 

  res.json({
    ...updatedPost,
    user_name: user ? user.name : 'Anonymous',
    category_name: category ? category.name : 'Unknown Category' 
  });
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  const userRole = req.query.role; 

  const postIndex = posts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).send('Post not found');
  }

  const postToDelete = posts[postIndex];

  const user = users.find(u => u.id === userId); 
  const actualUserRole = user?.role; 

  if (postToDelete.user_id !== userId && actualUserRole !== 'admin') {
    console.warn(`🚫 ניסיון מחיקת פוסט לא מורשה: פוסט ${id} על ידי משתמש ${userId} עם תפקיד ${actualUserRole}. יוצר הפוסט: ${postToDelete.user_id}`);
    return res.status(403).json({ error: 'Not authorized to delete this post.' });
  }

  posts.splice(postIndex, 1);
  console.log(`🗑️ פוסט נמחק: ${id}`);
  res.status(204).send(); 
});

app.get('/api/posts/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  console.log(`--- GET /api/posts/user/${userId} ---`);
  console.log(`Filtering posts for user ID: "${userId}"`);
  console.log(`Total posts in memory: ${posts.length}`);
  console.log(`Requested page: ${page}, limit: ${limit}`);

  const userPosts = posts
    .filter(p => {
      const isMatch = p.user_id === userId;
      console.log(`  Post ID: ${p.id}, Stored user ID: ${p.user_id}, Match: ${isMatch}`);
      return isMatch;
    })
    .map(p => {
      const category = categories.find(cat => cat.id === p.category_id);
      return {
        ...p,
        user_name: user ? user.name : 'Anonymous',
        category_name: category ? category.name : 'Unknown Category' 
      };
    });

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pagedItems = userPosts.slice(startIndex, endIndex);
  const hasMore = endIndex < userPosts.length;

  console.log(`Found ${userPosts.length} posts for user "${userId}". Returning ${pagedItems.length} for page ${page}. hasMore: ${hasMore}`);
  res.json({ items: pagedItems, hasMore });
});

// נקודות קצה לתגובות
app.get('/api/comments/post/:postId', (req, res) => {
  const { postId } = req.params;
  const postComments = comments.filter(c => c.item_type === 'post' && c.item_id === postId);
  const enriched = postComments.map(c => {
    const user = users.find(u => u.id === c.user_id);
    return { ...c, user_name: user ? user.name : 'Anonymous' };
  });
  res.json(enriched);
});

app.get('/api/comments/location/:locationId', (req, res) => {
  const { locationId } = req.params;
  const locationComments = comments.filter(c => c.item_type === 'location' && c.item_id === locationId);
  const enriched = locationComments.map(c => {
    const user = users.find(u => u.id === c.user_id);
    return { ...c, user_name: user ? user.name : 'Anonymous' };
  });
  res.json(enriched);
});

app.post('/api/comments', (req, res) => {
  const { item_id, item_type, user_id, content, parent_id = null, rating = 0 } = req.body;

  if (!item_id || !item_type || !user_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newComment = {
    id: Date.now().toString(),
    item_id,
    item_type,
    user_id,
    content,
    parent_id,
    created_at: new Date().toISOString(),
    rating: rating
  };

  comments.push(newComment);

  const user = users.find(u => u.id === user_id);

  res.json({
    ...newComment,
    user_name: user ? user.name : 'Anonymous'
  });
});

// נקודות קצה ללייקים (Votes)
app.post('/api/votes', (req, res) => {
  console.log('📩 קיבלנו בקשת לייק (POST):', req.body);
  const { user_id, item_type, item_id } = req.body;

  if (!user_id || !item_type || !item_id) {
    return res.status(400).json({ error: 'Missing required fields: user_id, item_type, item_id' });
  }

  const existingLike = likes.find(
    (l) => l.user_id === user_id && l.item_id === item_id && l.item_type === item_type
  );

  if (existingLike) {
    return res.status(409).json({ message: 'Item already liked by this user' });
  }

  likes.push({ user_id, item_type, item_id, value: 1, created_at: new Date().toISOString() });
  console.log(`❤️ New like added: user ${user_id} on ${item_type} ${item_id}`);

  const totalLikes = likes.filter(
    (l) => l.item_type === item_type && l.item_id === item_id && l.value === 1
  ).length;

  res.status(201).json({ success: true, message: 'Like added', totalLikes });
});

app.delete('/api/votes/:userId/:itemType/:itemId', (req, res) => {
  console.log('📩 קיבלנו בקשת לייק (DELETE):', req.params);
  const { userId, itemType, itemId } = req.params;

  const initialLength = likes.length;
  likes = likes.filter(
    (l) => !(l.user_id === userId && l.item_type === itemType && l.item_id === itemId)
  );

  if (likes.length < initialLength) {
    const totalLikes = likes.filter(
      (l) => l.item_type === itemType && l.item_id === itemId && l.value === 1
    ).length;
    console.log(`💔 Like removed: user ${userId} on ${itemType} ${itemId}. Total likes: ${totalLikes}`);
    res.json({ success: true, message: 'Like removed', totalLikes });
  } else {
    res.status(404).json({ message: 'Like not found for this user and item' });
  }
});

app.get('/api/votes/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params;

  const totalLikes = likes.filter(
    (l) => l.item_type === itemType && l.item_id === itemId && l.value === 1
  ).length;

  res.json({ totalLikes });
});

app.get('/api/user/:userId/likes', (req, res) => {
  const { userId } = req.params;
  const userLikedItems = likes.filter(l => l.user_id === userId && l.value === 1).map(l => ({
    itemId: l.item_id,
    itemType: l.item_type
  }));
  console.log(`👍 אחזור לייקים עבור משתמש ${userId}:`, userLikedItems.length);
  res.json(userLikedItems);
});

app.get('/api/likes/public-counts', (req, res) => {
  const itemIdsParam = req.query.itemIds;
  const itemType = req.query.itemType;

  if (!itemIdsParam || !itemType) {
    return res.status(400).json({ error: 'Missing itemIds or itemType query parameters' });
  }

  const itemIds = itemIdsParam.split(',');
  const publicLikesCounts = {};

  itemIds.forEach(itemId => {
    const count = likes.filter(l => l.item_id === itemId && l.item_type === itemType && l.value === 1).length;
    publicLikesCounts[itemId] = count;
  });

  console.log(`📊 אחזור ספירות לייקים ציבוריות עבור ${itemType}s:`, publicLikesCounts);
  res.json(publicLikesCounts);
});

// נקודות קצה להיסטוריית פעילות משתמש
app.get('/api/user/:userId/history', (req, res) => {
  const userId = req.params.userId;

  const userPosts = posts
    .filter(p => p.user_id === userId)
    .map(p => ({
      action_type: 'post',
      action_id: p.id,
      created_at: p.created_at,
      description: p.title,
    }));

  const userLocations = locations
    .filter(l => l.user_id === userId)
    .map(l => ({
      action_type: 'location',
      action_id: l.id,
      created_at: l.created_at,
      description: l.name,
    }));

  const userComments = comments
    .filter(c => c.user_id === userId)
    .map(c => ({
      action_type: 'comment',
      action_id: c.id,
      created_at: c.created_at,
      description: c.content.length > 50 ? c.content.slice(0, 47) + '...' : c.content,
    }));

  const userLikes = likes
    .filter(l => l.user_id === userId)
    .map((l, i) => ({
      action_type: 'vote',
      action_id: `like-${i}`,
      created_at: l.created_at,
      description: `Voted on item ${l.item_id} (${l.item_type})`,
    }));

  const userReports = reports
    .filter(r => r.user_id === userId)
    .map((r, i) => ({
      action_type: 'report',
      action_id: `report-${i}`,
      created_at: null, // דיווחים לא תמיד מקבלים created_at בדוגמה זו
      description: `Reported item ${r.item_id} (${r.item_type}) reason: ${r.reason}`,
    }));

  const allActions = [...userPosts, ...userLocations, ...userComments, ...userLikes, ...userReports];

  allActions.sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json(allActions);
});

// נקודות קצה למנהל מערכת (Admin)
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    posts: posts.length,
    locations: locations.length,
    reports: reports.filter(r => r.status === 'open').length,
    users: users.length
  };

  const postsByCategory = [];
  const categoryMap = {};

  posts.forEach(post => {
    const catId = post.category_id || 'uncategorized';
    if (!categoryMap[catId]) {
      categoryMap[catId] = { category: catId, count: 0 };
      postsByCategory.push(categoryMap[catId]);
    }
    categoryMap[catId].count += 1;
  });

  res.json({ stats, postsByCategory });
});

app.get('/api/admin/activity-log', (req, res) => {
  const logs = [];

  posts.slice(-5).forEach(post => {
    logs.push(`📝 New post titled "${post.title}" was added.`);
  });

  locations.slice(-5).forEach(loc => {
    logs.push(`📍 New location "${loc.name}" was added.`);
  });

  reports.slice(-5).forEach(report => {
    logs.push(`🚩 New report on item ${report.item_id} (${report.item_type})`);
  });

  res.json(logs.reverse());
});

// ==========================================================
// ✅ התיקון: נקודת הקצה החסרה לקבלת רשימת משתמשים למנהל
// ==========================================================
app.get('/api/admin/users', (req, res) => {
  const { userId } = req.query; // קבלת ה-userId שנשלח מה-frontend

  // בדיקה אם המשתמש הוא מנהל בעזרת הפונקציה הקיימת
  if (!isAdminUser(userId)) {
    return res.status(403).json({ error: 'Not authorized. Admin access required.' });
  }

  // אם המשתמש הוא מנהל, החזר את כל מערך המשתמשים
  console.log(`🔑 Admin user [${userId}] requested the full user list. Sending ${users.length} users.`);
  res.status(200).json(users);
});
// ==========================================================


// נקודות קצה למועדפים (Favorites)
app.post('/api/user/favorites', (req, res) => {
  const { userId, itemType, itemId } = req.body;

  if (!userId || !itemType || !itemId) {
    return res.status(400).json({ error: 'Missing userId, itemType, or itemId' });
  }

  const existingFavorite = favorites.find(
    (fav) => fav.userId === userId && fav.itemType === itemType && fav.itemId === itemId
  );

  if (existingFavorite) {
    return res.status(409).json({ message: 'Item already in favorites' });
  }

  const newFavorite = { id: uuidv4(), userId, itemType, itemId, createdAt: new Date().toISOString() };
  favorites.push(newFavorite);
  console.log('❤️ New favorite added:', newFavorite);
  res.status(201).json({ success: true, favorite: newFavorite });
});

app.delete('/api/user/favorites/:userId/:itemType/:itemId', (req, res) => {
  const { userId, itemType, itemId } = req.params;

  const initialLength = favorites.length;
  const updatedFavorites = favorites.filter(
    (fav) => !(fav.userId === userId && fav.itemType === itemType && fav.itemId === itemId)
  );

  if (updatedFavorites.length === initialLength) {
    return res.status(404).json({ message: 'Favorite not found' });
  }

  favorites.splice(0, favorites.length, ...updatedFavorites);
  console.log('💔 Favorite removed:', { userId, itemType, itemId });
  res.json({ success: true, message: 'Favorite removed' });
});

app.get('/api/user/favorites/:userId', (req, res) => {
  const { userId } = req.params;
  const userFavorites = favorites.filter(fav => fav.userId === userId);
  res.json(userFavorites);
});

// פונקציית עזר להוצאת פרטי פריט לפי ID (מחפש גם במיקומים וגם בפוסטים)
const getItemDetails = (itemId) => {
  let foundItem = locations.find(loc => loc.id === itemId);
  if (foundItem) {
    const category = categories.find(cat => cat.id === foundItem.category_id);
    const user = users.find(u => u.id === foundItem.user_id);
    return { 
      ...foundItem, 
      type: 'location',
      category_name: category ? category.name : 'Unknown Category',
      user_name: user ? user.name : 'Anonymous'
    };
  }
  foundItem = posts.find(post => post.id === itemId);
  if (foundItem) {
    const category = categories.find(cat => cat.id === foundItem.category_id);
    const user = users.find(u => u.id === foundItem.user_id);
    return { 
      ...foundItem, 
      type: 'post',
      category_name: category ? category.name : 'Unknown Category',
      user_name: user ? user.name : 'Anonymous'
    };
  }
  return null;
};

app.get('/api/items/by-ids', (req, res) => {
  const idsParam = req.query.ids;

  if (!idsParam) {
    return res.status(200).json([]);
  }

  const itemIds = idsParam.split(',');

  const detailedItems = itemIds.map(itemId => {
    const details = getItemDetails(itemId);
    if (details) {
      // user_name ו-category_name כבר מועשרים ב-getItemDetails
      return details;
    }
    return null;
  }).filter(Boolean);

  res.json(detailedItems);
});

// נקודות קצה לטיוטות
app.post('/api/drafts', (req, res) => {
  const { draftId, type, data } = req.body;
  const user_id = data.user_id;

  if (!user_id || !type || !data) {
    return res.status(400).json({ error: 'Missing user_id, type, or data for draft' });
  }

  let draftIndex = -1;
  if (draftId) {
    draftIndex = drafts.findIndex(d => d.id === draftId && d.user_id === user_id && d.type === type);
  }

  if (draftIndex > -1) {
    drafts[draftIndex] = {
      ...drafts[draftIndex],
      data: data,
      updated_at: new Date().toISOString(),
    };
    console.log('✏️ טיוטה עודכנה:', drafts[draftIndex]);
    res.json({ success: true, id: drafts[draftIndex].id, message: 'Draft updated successfully', draft: drafts[draftIndex] });
  } else {
    const newDraft = {
      id: uuidv4(),
      user_id: user_id,
      type: type,
      data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    drafts.push(newDraft);
    console.log('📝 טיוטה חדשה נוצרה:', newDraft);
    res.status(201).json({ success: true, id: newDraft.id, message: 'Draft saved successfully', draft: newDraft });
  }
});

app.get('/api/drafts/:draftId', (req, res) => {
  const { draftId } = req.params;
  const normalizedDraftId = draftId.replace('_post', ''); // Remove '_post' suffix
  const draft = drafts.find(d => d.id === normalizedDraftId);

  if (!draft) {
    console.error(`Draft with ID ${draftId} not found after normalization`);
    return res.status(404).json({ message: 'Draft not found' });
  }

  res.json(draft);
});

app.delete('/api/drafts/:draftId', (req, res) => {
  const { draftId } = req.params;
  const initialLength = drafts.length;
  const updatedDrafts = drafts.filter(d => d.id !== draftId);
  if (updatedDrafts.length < initialLength) {
    drafts.splice(0, drafts.length, ...updatedDrafts);
    console.log('🗑️ טיוטה נמחקה:', draftId);
    res.status(204).send();
  } else {
    res.status(404).send('Draft not found');
  }
});

app.get('/api/user/:userId/drafts', (req, res) => {
  const { userId } = req.params;
  const userDrafts = drafts.filter(draft => draft.user_id === userId);
  console.log(`📚 אחזור טיוטות עבור משתמש ${userId}:`, userDrafts.length);
  res.json(userDrafts);
});

app.post('/api/upload-temp-images', upload.array('images'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded.' });
  }
  const filenames = req.files.map(file => file.filename);
  console.log('🖼️ תמונות זמניות הועלו:', filenames);
  res.json({ success: true, filenames: filenames });
});


// הפעלת השרת
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
