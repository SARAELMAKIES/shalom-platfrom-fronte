import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdTitle, MdDescription } from 'react-icons/md';
import { FaList, FaFileImage } from 'react-icons/fa';
// DOIT
// import ReactGA from 'react-ga'; 

const PostForm = ({ onSubmit, categories, defaultLocationId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm();

  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (defaultLocationId) {
      setValue('location_id', defaultLocationId);
    }
  }, [defaultLocationId, setValue]);

  const handleFormSubmit = (data) => {
    // DOIT
  //     ReactGA.event({
  //   category: 'Posts',
  //   action: 'Submit New Post',
  //   label: 'User submitted a post',
  // });
    onSubmit(data);
    reset();
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = watch('images') || [];

    const newImages = files.filter(
      (file) => file.type.startsWith('image/') && currentImages.length < 5
    );

    if (currentImages.length + newImages.length > 5) {
      alert('You can upload up to 5 images only');
      return;
    }

    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, { file, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });

    setValue('images', [...currentImages, ...newImages]);
  };

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);

    const currentImages = watch('images') || [];
    currentImages.splice(index, 1);
    setValue('images', currentImages);
  };

  return (
    <div className="flex gap-4 px-4 min-h-[400px] max-w-7xl mx-auto">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-6 flex-[3] bg-white p-8 rounded-xl shadow-lg"
        noValidate
      >
        {/* כותרת הטופס - צבע זהוב-חום */}
        <h2 className="text-center text-3xl font-semibold text-golden-brown mb-8">
          Create a New Post
        </h2>

        <div className="flex flex-col gap-10 flex-grow">
          {/* שדה הכותרת - מסגרת זהובה-חומה ופינות ישרות */}
          <div className="flex items-center border border-golden-brown overflow-hidden focus-within:ring-2 focus-within:ring-golden-brown-dark">
            <MdTitle className="text-golden-brown mx-3 text-2xl" />
            <input
              type="text"
              placeholder="Title"
              {...register('title', {
                required: 'This field is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 100, message: 'Maximum 100 characters' },
              })}
              className={`flex-grow h-14 px-3 outline-none ${
                errors.title ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}

          {/* שדה הקטגוריה - מסגרת זהובה-חומה ופינות ישרות */}
          <div className="flex items-center border border-golden-brown overflow-hidden focus-within:ring-2 focus-within:ring-golden-brown-dark">
            <FaList className="text-golden-brown mx-3 text-lg" />
            <select
              {...register('category_id', {
                required: 'This field is required',
              })}
              value={watch('category_id') || ''}
              onChange={(e) => setValue('category_id', e.target.value)}
              className={`flex-grow h-14 px-3 bg-transparent appearance-none outline-none ${
                errors.category_id ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {errors.category_id && (
            <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>
          )}

          {/* שדה התוכן - מסגרת זהובה-חומה ופינות ישרות */}
          <div className="flex items-start border border-golden-brown overflow-hidden focus-within:ring-2 focus-within:ring-golden-brown-dark">
            <MdDescription className="text-golden-brown mx-3 mt-3 text-2xl" />
            <textarea
              rows={4}
              placeholder="Content"
              {...register('content', {
                required: 'This field is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 1000, message: 'Maximum 1000 characters' },
              })}
              className={`flex-grow px-3 py-2 resize-none outline-none ${
                errors.content ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
          )}

          {/* שדה סמוי ל-location_id */}
          <input type="hidden" {...register('location_id')} />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-2">
              {imagePreviews.map((img, index) => (
                <div
                  key={index}
                  className="relative w-28 h-28 rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={img.url}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full w-7 h-7 flex items-center justify-center text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-6 flex-wrap">
            {/* כפתור הוספת תמונות - צבע זהוב-חום ופינות ישרות */}
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center flex-grow min-w-[280px] max-w-[600px] bg-golden-brown hover:bg-golden-brown-dark text-white font-semibold cursor-pointer h-10 select-none"
            >
              <FaFileImage className="mr-2" />
              Add images to illustrate your post
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageChange}
              />
            </label>

            {/* כפתור שליחת הפוסט - צבע זהוב-חום ופינות ישרות */}
            <button
              type="submit"
              className="flex-grow min-w-[160px] max-w-[300px] bg-golden-brown hover:bg-golden-brown-dark text-white font-semibold h-10"
            >
              Submit Post
            </button>
          </div>
        </div>
      </form>

      {/*
        תמונת הסינגוגה.
        ודא שהנתיב 'src="/images/synagogue.jpg"' הוא הנתיב הנכון בפרויקט שלך.
        אם התמונה היא בתוך תיקיית 'public' או תיקיה אחרת, ודא שהנתיב מוביל אליה נכון.
      */}
{/*       <img
        src="/images/synagogue.jpg" // ודא שנתיב זה נכון אצלך בפרויקט
        alt="Synagogue"
        className="flex-[1] object-cover rounded-xl shadow-md max-h-[630px] w-full"
      /> */}
    </div>
  );
};

export default PostForm;