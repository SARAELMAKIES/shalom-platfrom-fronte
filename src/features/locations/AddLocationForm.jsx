import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FaMapMarkerAlt, FaFileImage, FaList } from 'react-icons/fa';
import { MdDescription, MdTitle } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { kosherAuthorities } from '../../app/kosherAuthorities';
import 'leaflet/dist/leaflet.css';
import LocationList from './LocationList';
// DOIT
// import ReactGA from 'react-ga'; 


const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const AddLocationForm = ({ categories, onSubmit, user_id }) => {
  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
  //   defaultValues: {
  //     name: '',
  //     location: '',
  //     description: '',
  //     category_id: '',
  //     images: [],
  //     lat: '',
  //     lng: '',
  //     restaurantType: '',
  //     kosherAuthority: '',
  //   },
  // });
defaultValues: {
  name: '',
  location: '',
  description: '',
  category_id: '',
  images: [],
  lat: '',
  lng: '',
  restaurantType: '',
  kosherAuthority: '',
  city: '',
  area: '',
  country: '',
}, });

  const kosherAuthorityValue = watch('kosherAuthority');
  const showKosherAuthorityOther = kosherAuthorityValue === 'other';

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);
  const [showRestaurantType, setShowRestaurantType] = useState(false);
  const [showKosherAuthority, setShowKosherAuthority] = useState(false);
  const [showCustomCategoryName, setShowCustomCategoryName] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const debounceTimeout = useRef(null);

  const locations = useSelector((state) => state.locations?.locations || []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setPreviewImages(newFiles.map((file) => URL.createObjectURL(file)));
    setValue('images', newFiles);
  };

  const handleRemoveImage = (indexToRemove) => {
    const newFiles = selectedFiles.filter((_, i) => i !== indexToRemove);
    setSelectedFiles(newFiles);
    setPreviewImages(newFiles.map((file) => URL.createObjectURL(file)));
    setValue('images', newFiles);
  };

  const handleLocationInput = (e) => {
    const value = e.target.value;
    setValue('location', value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ShalomApp/1.0 (contact@yourdomain.com)'
          }
        });
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
        setSuggestions([]);
      }
    }, 500);
  };

  // const handleLocationSelect = (place) => {
  //   setValue('location', place.display_name);
  //   setValue('lat', place.lat);
  //   setValue('lng', place.lon);
  //   const lat = parseFloat(place.lat);
  //   const lon = parseFloat(place.lon);
  //   if (!isNaN(lat) && !isNaN(lon)) {
  //     setMapPosition([lat, lon]);
  //   }
  //   setSuggestions([]);
  // };
const handleLocationSelect = (place) => {
  setValue('location', place.display_name);
  setValue('lat', place.lat);
  setValue('lng', place.lon);
  const { city, area, country } = parseLocationString(place.display_name);
  setValue('city', city);
  setValue('area', area);
  setValue('country', country);

  const lat = parseFloat(place.lat);
  const lon = parseFloat(place.lon);
  if (!isNaN(lat) && !isNaN(lon)) {
    setMapPosition([lat, lon]);
  }
  setSuggestions([]);
};

  const onCategoryChange = (selectedId) => {
    setValue('category_id', selectedId);
    const selectedCategory = categories.find((cat) => cat.id === selectedId);

    if (selectedCategory?.name === 'Kosher Restaurant') {
      setShowRestaurantType(true);
      setShowKosherAuthority(true);
      setShowCustomCategoryName(false);
      setCustomCategoryName('');
    } else if (selectedCategory?.name === 'Kosher Hotel') {
      setShowRestaurantType(false);
      setShowKosherAuthority(true);
      setShowCustomCategoryName(false);
      setCustomCategoryName('');
      setValue('restaurantType', '');
    } else if (selectedCategory?.name === 'Other') {
      setShowCustomCategoryName(true);
      setShowRestaurantType(false);
      setShowKosherAuthority(false);
      setCustomCategoryName('');
      setValue('restaurantType', '');
      setValue('kosherAuthority', '');
    } else {
      setShowRestaurantType(false);
      setShowKosherAuthority(false);
      setShowCustomCategoryName(false);
      setCustomCategoryName('');
      setValue('restaurantType', '');
      setValue('kosherAuthority', '');
    }
  };

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
  });
  const parseLocationString = (locationString) => {
  if (!locationString) return { city: '', area: '', country: '' };
  const parts = locationString.split(',').map((p) => p.trim());
  return {
    city: parts[0] || '',
    area: parts[1] || '',
    country: parts[parts.length - 1] || ''
  };
};


  const submitForm = (data) => {
  //     ReactGA.event({
  //   category: 'Locations',
  //   action: 'Submit New Location',
  //   label: 'User submitted a new location',
  // });
    let kosherInfo = '';
    if (showKosherAuthority && data.kosherAuthority) {
      kosherInfo += `\nKosher Authority: ${data.kosherAuthority}`;
    }
    if (showRestaurantType && data.restaurantType) {
      kosherInfo = `Restaurant Type: ${data.restaurantType}` + kosherInfo;
    }

    const finalDescription = data.description ? data.description + kosherInfo : kosherInfo.trim();

    const images = selectedFiles;
    // const payload = {
    //   ...data,
    //   user_id,
    //   lat: Number(data.lat),
    //   lng: Number(data.lng),
    //   description: finalDescription,
    //   images,
    //   created_at: new Date().toISOString(),
    //   like_count: 0,
    //   comment_count: 0,
    // };
const payload = {
  ...data,
  user_id,
  lat: Number(data.lat),
  lng: Number(data.lng),
  description: finalDescription,
  images,
  created_at: new Date().toISOString(),
  like_count: 0,
  comment_count: 0,
  city: data.city,
  area: data.area,
  country: data.country,
};

    onSubmit(payload);

    reset();
    setSelectedFiles([]);
    setPreviewImages([]);
    setMapPosition(null);
    setShowRestaurantType(false);
    setShowKosherAuthority(false);
  };


  return (
     <form
      dir="ltr"
      onSubmit={handleSubmit(submitForm)}
      className="relative max-w-[1000px] min-h-[450px] mx-auto p-12 rounded-lg shadow-lg flex flex-col gap-6
        bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/assets/synagogue.jpg")' }}
    >
      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/80 z-0 rounded-lg"></div>

      <h2 className="text-4xl text-center text-cyan-500 mb-10 z-10 relative">
        Add a New Location
      </h2>

      <div className="flex flex-wrap gap-6 mb-8 z-10 relative">
        <div className="flex-1 min-w-[300px] relative">
          <label
            htmlFor="name"
            className="block mb-1 font-medium text-gray-700"
          >
            Location Name
          </label>
          <div className="relative">
            <MdTitle className="absolute top-3 left-3 text-cyan-500" />
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Location name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 100, message: 'Maximum 100 characters' },
                pattern: {
                  value: /^[\u0590-\u05FFa-zA-Z0-9\s'-]+$/,
                  message:
                    "Only letters, numbers, spaces, apostrophes or hyphens allowed",
                },
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
                ${
                  errors.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              placeholder="Location Name"
            />
            {errors.name && (
              <p className="text-red-600 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[300px] relative">
          <label
            htmlFor="location"
            className="block mb-1 font-medium text-gray-700"
          >
            Location
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute top-3 left-3 text-cyan-500" />
            <input
              type="text"
              id="location"
              {...register('location', { required: 'Location is required' })}
              onChange={handleLocationInput}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
                ${
                  errors.location
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              placeholder="Location"
              autoComplete="off"
            />
            {errors.location && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.location.message}
              </p>
            )}

            {suggestions.length > 0 && (
              <ul className="absolute z-20 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleLocationSelect(place)}
                    className="px-3 py-2 cursor-pointer hover:bg-cyan-100"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-8 z-10 relative flex-wrap">
        <div className="flex-1 min-w-[300px] relative">
          <label
            htmlFor="description"
            className="block mb-1 font-medium text-gray-700"
          >
            Description
          </label>
          <div className="relative">
            <MdDescription className="absolute top-3 left-3 text-cyan-500" />
            <textarea
              id="description"
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 2, message: 'Description must be at least 2 characters' },
                maxLength: { value: 1000, message: 'Description must not exceed 1000 characters' },
                pattern: {
                  value: /^[\u0590-\u05FFa-zA-Z0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>/]*$/,
                  message:
                    'Description can include only letters, numbers, and common punctuation',
                },
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500
                ${
                  errors.description
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              rows={3}
              placeholder="Description"
            />
            {errors.description && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[300px] relative">
          <label
            htmlFor="category_id"
            className="block mb-1 font-medium text-gray-700"
          >
            Category
          </label>
          <div className="relative">
            <FaList className="absolute top-3 left-3 text-cyan-500" />
            <Controller
              name="category_id"
              control={control}
              defaultValue=""
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <select
                  id="category_id"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onCategoryChange(e.target.value);
                  }}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
                    ${
                      errors.category_id
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category_id && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.category_id.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {(showRestaurantType || showKosherAuthority) && (
        <div className="flex gap-6 mb-8 z-10 relative flex-wrap">
          {showRestaurantType && (
            <Controller
              name="restaurantType"
              control={control}
              defaultValue=""
              rules={{ required: showRestaurantType ? 'Restaurant type is required' : false }}
              render={({ field }) => (
                <div className="flex-1 min-w-[300px] relative">
                  <label
                    htmlFor="restaurantType"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Restaurant Type
                  </label>
                  <select
                    id="restaurantType"
                    {...field}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
                      ${
                        errors.restaurantType
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Restaurant Type</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Parve">Parve</option>
                  </select>
                  {errors.restaurantType && (
                    <p className="text-red-600 mt-1 text-sm">
                      {errors.restaurantType.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          {showKosherAuthority && (
            <Controller
              name="kosherAuthority"
              control={control}
              defaultValue=""
              rules={{ required: showKosherAuthority ? 'Kosher authority is required' : false }}
              render={({ field }) => (
                <div className="flex-1 min-w-[300px] relative">
                  <label
                    htmlFor="kosherAuthority"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Kosher Authority
                  </label>
                  <select
                    id="kosherAuthority"
                    {...field}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
                      ${
                        errors.kosherAuthority
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Kosher Authority</option>
                    {kosherAuthorities.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                  {errors.kosherAuthority && (
                    <p className="text-red-600 mt-1 text-sm">
                      {errors.kosherAuthority.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}
        </div>
      )}

      {showCustomCategoryName && (
        <div className="z-10 relative">
          <label
            htmlFor="customCategoryName"
            className="block mb-1 font-medium text-gray-700"
          >
            Custom Category Name
          </label>
          <input
            type="text"
            id="customCategoryName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            placeholder="Enter custom category"
          />
        </div>
      )}

      {showKosherAuthorityOther && (
        <div className="z-10 relative">
          <label
            htmlFor="kosherAuthorityOther"
            className="block mb-1 font-medium text-gray-700"
          >
            Other Kosher Authority
          </label>
          <input
            type="text"
            id="kosherAuthorityOther"
            {...register('kosherAuthorityOther', {
              required: 'Please specify the other kosher authority',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              maxLength: { value: 100, message: 'Must be at most 100 characters' },
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500
              ${
                errors.kosherAuthorityOther
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            placeholder="Specify other kosher authority"
          />
          {errors.kosherAuthorityOther && (
            <p className="text-red-600 mt-1 text-sm">
              {errors.kosherAuthorityOther.message}
            </p>
          )}
        </div>
      )}

      {mapPosition && (
        <div className="mb-8 h-72 w-full z-10 relative rounded-md overflow-hidden">
          <MapContainer
            center={mapPosition}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Marker position={mapPosition} icon={customIcon}>
              <Popup>Selected Location</Popup>
            </Marker>
            <ChangeMapView center={mapPosition} />
          </MapContainer>
        </div>
      )}

      <div className="mb-6 z-10 relative">
        <label
          htmlFor="imageUpload"
          className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 bg-cyan-500 hover:bg-cyan-700 text-white font-semibold rounded-md"
        >
          <FaFileImage />
          Upload Images
          <input
            type="file"
            id="imageUpload"
            hidden
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>

      {previewImages.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-8 justify-center z-10 relative">
          {previewImages.map((src, index) => (
            <div key={index} className="relative">
              <img
                src={src}
                alt={`preview-${index}`}
                className="w-[120px] h-[120px] object-cover rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full text-cyan-600 font-bold w-6 h-6 flex items-center justify-center hover:bg-opacity-100"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center z-10 relative">
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-700 text-white px-12 py-3 rounded-lg text-lg font-semibold"
        >
          Submit
        </button>
      </div>

    
   

     
    </form>
  );
}
export default AddLocationForm;