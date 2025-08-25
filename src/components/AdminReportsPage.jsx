// src/components/AdminReportsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { AuthContext } from '../layouts/AuthLayout';
import { 
  fetchCategories, 
  selectAllCategories, 
  selectCategoriesLoading, 
  selectCategoriesError 
} from '../features/categories/categoriesSlice';
import CustomAlertDialog from '../features/PlaceDetail/CustomAlertDialog';
import reportsApi from '../api/reportsApi'; // או מהנתיב הנכון

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loadingAuth, currentUser } = useContext(AuthContext);

  const allCategories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'location', 'post'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', 'in_review', 'pending_action', 'resolved' ✅ סטייט חדש לסינון סטטוס
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' או 'oldest' ✅ סטייט חדש למיון
  const [alertDialog, setAlertDialog] = useState(null);

  // טען קטגוריות כאשר הקומפוננטה נטענת
  useEffect(() => {
    dispatch(fetchCategories()); 
  }, [dispatch]);

  // לוגיקת הגנה על נתיבים
  useEffect(() => {
    if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
      return;
    }

    if (currentUser.role !== 'admin') {
      console.log("AdminReportsPage: User not authorized. Redirecting to home.");
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000); 
      return () => clearTimeout(timer); 
    }
  }, [loadingAuth, currentUser, navigate]);

 // פונקציה לטעינת דיווחים מהשרת
const fetchReports = async () => {
  setLoadingReports(true);
  setReportsError(null);
  try {
    const data = await reportsApi.fetchReports(filterType, filterStatus);
    setReports(data);
  } catch (err) {
    console.error("AdminReportsPage: Failed to fetch reports:", err);
    setReportsError('נכשל בטעינת הדיווחים. אנא נסה שוב מאוחר יותר.');
  } finally {
    setLoadingReports(false);
  }
};


  // טען דיווחים כאשר הקומפוננטה נטענת או כאשר filterType/filterStatus משתנה
  useEffect(() => {
    if (!loadingAuth && currentUser && currentUser.role === 'admin') {
      fetchReports();
    }
  }, [filterType, filterStatus, loadingAuth, currentUser]); // ✅ הוספת filterStatus לתלויות

  // פונקציה לשינוי סטטוס דיווח
  const handleChangeReportStatus = async (reportId, newStatus) => {
    setAlertDialog({
      type: 'confirm',
      message: `האם אתה בטוח שברצונך לשנות את סטטוס הדיווח ל"${getStatusDisplayName(newStatus)}"?`,
      onConfirm: async () => {
        setAlertDialog(null);
        try {
          await reportsApi.updateReportStatus(reportId, newStatus, currentUser.id);
          // await axios.put(`http://localhost:3001/api/reports/${reportId}/status`, { userId: currentUser.id, newStatus }); // ✅ שימוש בנקודת קצה חדשה
          setAlertDialog({ type: 'success', message: 'סטטוס הדיווח עודכן בהצלחה!' });
          fetchReports(); // רענן את רשימת הדיווחים
        } catch (err) {
          console.error("AdminReportsPage: Failed to change report status:", err);
          setAlertDialog({ type: 'error', message: `נכשל בשינוי סטטוס הדיווח: ${err.response?.data?.error || err.message}` });
        } finally {
          setTimeout(() => setAlertDialog(null), 3000);
        }
      },
      onCancel: () => setAlertDialog(null),
      showCancel: true
    });
  };

  // פונקציית עזר לעיצוב תאריך
  const formatDate = (dateString) => {
    if (!dateString) return 'לא ידוע';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
  };

  // פונקציית עזר להצגת שם הסטטוס בעברית
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'open': return 'פתוח';
      case 'in_review': return 'בבדיקה';
      case 'pending_action': return 'לטיפול';
      case 'resolved': return 'טופל';
      default: return status;
    }
  };

  // פונקציית עזר לקבלת צבע רקע לסטטוס
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-200 text-red-900';
      case 'in_review': return 'bg-yellow-200 text-yellow-900';
      case 'pending_action': return 'bg-orange-200 text-orange-900';
      case 'resolved': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  // מיון הדיווחים לפני הצגה
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // הצגת מצבי טעינה/הרשאות
  if (loadingAuth || !currentUser || typeof currentUser.role === 'undefined') {
    return <p className="text-center mt-10 text-gray-500">טוען הרשאות...</p>;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="text-center mt-10 text-red-600 text-lg font-semibold">
        אין לך הרשאה לצפות בדף זה. מנתב לדף הבית...
      </div>
    );
  }

  if (categoriesLoading === 'pending' || loadingReports) {
    return (
      <div className="text-center w-full py-16">
        <h2 className="text-2xl font-bold mb-4 text-dark-gray-text">טוען...</h2>
        <p className="text-gray-text mb-6">אנא המתן...</p>
      </div>
    );
  }

  if (categoriesError) {
    return <p className="text-center mt-10 text-red-600">שגיאה בטעינת קטגוריות: {categoriesError}</p>;
  }

  if (reportsError) {
    return <p className="text-center mt-10 text-red-600">{reportsError}</p>;
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      {alertDialog && (
        <CustomAlertDialog
          message={alertDialog.message}
          type={alertDialog.type}
          onConfirm={alertDialog.onConfirm || (() => setAlertDialog(null))}
          onCancel={alertDialog.onCancel}
          showCancel={alertDialog.showCancel}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-golden-brown">ניהול דיווחים</h1>

      {/* פילטרים ומיון */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        {/* פילטר לפי סוג דיווח */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="report-type-filter" className="block text-gray-700 text-sm font-bold mb-2">
            סנן לפי סוג:
          </label>
          <select
            id="report-type-filter"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">כל הדיווחים</option>
            <option value="location">דיווחים על מיקומים</option>
            <option value="post">דיווחים על פוסטים</option>
          </select>
        </div>

        {/* ✅ פילטר לפי סטטוס */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="report-status-filter" className="block text-gray-700 text-sm font-bold mb-2">
            סנן לפי סטטוס:
          </label>
          <select
            id="report-status-filter"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="open">פתוח</option>
            <option value="in_review">בבדיקה</option>
            <option value="pending_action">לטיפול</option>
            <option value="resolved">טופל</option>
          </select>
        </div>

        {/* ✅ מיון לפי תאריך */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="report-sort-order" className="block text-gray-700 text-sm font-bold mb-2">
            מיין לפי תאריך:
          </label>
          <select
            id="report-sort-order"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-golden-brown-light"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">החדש ביותר</option>
            <option value="oldest">הישן ביותר</option>
          </select>
        </div>
      </div>

      {sortedReports.length === 0 ? (
        <p className="text-gray-600">אין דיווחים להצגה עבור הסינון הנוכחי.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full leading-normal table-fixed">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  ID דיווח
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  סוג
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  מזהה פריט
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  קטגוריה
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  שם מדווח
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-64">
                  תוכן הדיווח
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32"> {/* ✅ רוחב מוגדל עבור סטטוס */}
                  סטטוס
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                  תאריך דיווח
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report) => { // ✅ שימוש ב-sortedReports
                const userName = report.user_name || 'משתמש לא ידוע';
                const categoryName = report.category_name || 'לא ידוע';

                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-normal overflow-hidden text-ellipsis">
                      <p className="text-gray-900">{report.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <p className="text-gray-900">{report.item_type === 'location' ? 'מיקום' : 'פוסט'}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-normal overflow-hidden text-ellipsis">
                      <p className="text-gray-900">{report.item_id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <p className="text-gray-900">{categoryName}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <p className="text-gray-900">{userName}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-normal overflow-hidden text-ellipsis max-w-xs">
                      {/* ✅ שינוי כאן: הצג את השדה display_reason */}
                      <p className="text-gray-900">{report.display_reason}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusBadgeColor(report.status)}`}> {/* ✅ שימוש בפונקציית צבע */}
                        <span className="relative">{getStatusDisplayName(report.status)}</span> {/* ✅ שימוש בפונקציית תצוגה */}
                      </span>
                      {/* ✅ תפריט נפתח לשינוי סטטוס */}
                      <select
                        value={report.status}
                        onChange={(e) => handleChangeReportStatus(report.id, e.target.value)}
                        className="ml-2 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-golden-brown-light"
                      >
                        <option value="open">פתוח</option>
                        <option value="in_review">בבדיקה</option>
                        <option value="pending_action">לטיפול</option>
                        <option value="resolved">טופל</option>
                      </select>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <p className="text-gray-900">{formatDate(report.created_at)}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      {/* {report.status !== 'resolved' && (
                        <button
                          onClick={() => handleChangeReportStatus(report.id, 'resolved')} // ✅ שינוי לשימוש ב-handleChangeReportStatus
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          סמן כטופל
                        </button>
                      )} */}
                      <button
                        onClick={() => navigate(`/${report.item_type === 'location' ? 'place' : 'post'}/${report.item_id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        צפה בפריט
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
