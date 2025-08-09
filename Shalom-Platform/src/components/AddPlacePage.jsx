// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addLocation, clearStatus } from '../features/locations/locationSlice';
// import AddLocationForm from '../features/locations/AddLocationForm.jsx';
// import { categories } from '../app/categories';

// const AddLocationPage = ({ userId }) => {
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector(state => state.locations);

//   const handleSubmitLocation = (formData) => {
//     const payload = { ...formData, user_id: userId }; // שימוש ב־prop ולא ב־Redux
//     dispatch(addLocation(payload));
//     console.log('📦 נשלח עם user_id:', payload);
//     setTimeout(() => dispatch(clearStatus()), 3000);
//   };
//
//
//   return (
//     <div className="p-4">
//       {success && <p className="text-green-600 mb-2">Place added successfully</p>}
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {loading && <p className="text-sm text-gray-500 mb-2">loading..</p>}

//       <AddLocationForm
//         onSubmit={handleSubmitLocation}
//         categories={categories}
//         user_id={userId} // העברת ה־user_id בפועל
//       />
//     </div>
//   );
// };

// export default AddLocationPage;
