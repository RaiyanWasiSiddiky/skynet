import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Phone, X, House, UserRound, Save, Upload, Bed, Bath, Square, DollarSign, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import axios from "axios";

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id); // if id exists, we are in Edit mode
  const [property, setProperty] = useState({
    name: '',
    type: 'Standard Room',
    description: '',
    location: '',
    address: '',
    price: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: '',
    maxGuests: 1,
    amenities: {
      wifi: false,
      parking: false,
      breakfast: false,
      airConditioning: false,
      heating: false,
      tv: false,
      kitchen: false,
      workspace: false
    },
    availability: {
      startDate: '',
      endDate: ''
    },
    mobile: '',
    email: '',
    images: []
  });
  const [tempProperty, setTempProperty] = useState({});

  const [preview, setPreview] = useState([]);

  // State for tracking validation errors
  const [errors, setErrors] = useState({});

  
    useEffect(() => {
      if (isEditMode) {
        const getProperty = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendor/getProperty/${id}`, { withCredentials: true});
            if (response.data.success) {
              const fetchedProperty = response.data.data;
              fetchedProperty.squareFeet = fetchedProperty.squareFeet == "null" ? "" : fetchedProperty.squareFeet;
              fetchedProperty.availability.startDate = fetchedProperty.availability.startDate == null ? "" : fetchedProperty.availability.startDate;
              fetchedProperty.availability.endDate = fetchedProperty.availability.endDate == null ? "" : fetchedProperty.availability.endDate;
              setProperty(fetchedProperty)
              setTempProperty(fetchedProperty);

              // Convert stored images into preview format
              const storedImages = Array.isArray(response.data.data.images) // Check if property had images
              ? response.data.data.images.map((image) => ({
                  preview: `${import.meta.env.VITE_API_URL}/${image}`,
                  file: image, // No file data for already stored images
                  stored: true, // Mark as existing image from DB
                  })) 
              : [];
              setPreview(storedImages);

            } else {
              console.error("Error fetching property:", response.data.error)
            }
          } catch (error) {
            console.error("Error fetching property:", error);
          }
        }
        getProperty();
      }
    }, 
  [id])
  

  const propertyTypes = [
    { id: 'Standard Room', name: 'Standard Room' },
    { id: 'Luxury Room', name: 'Luxury Room' },
    { id: 'Business Suite', name: 'Business Suite' },
    { id: 'Apartment', name: 'Apartment' },
    { id: 'Villa', name: 'Villa' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleNumberInput = (event) => {
    const { name, value } = event.target;
  
    // Allow only numbers
    if (/^\d*$/.test(value) || value === "") {
      setProperty((prev) => ({ 
        ...prev, 
        [name]: value === "" ? "" : Number(value)  // Convert to Number
      }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDecimalInput = (event) => {
    const { name, value } = event.target;
  
    // Allow only numbers (upto 2 d.p.)

    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setProperty((prev) => ({ 
        ...prev, 
        [name]: value
      }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setProperty(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked
      }
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [name]: value
      }
    }));
  };

  const handleMobileInput = (event) => {
    const { name, value } = event.target;
    // Allow only numbers and +
    if (/^[+]?\d*$/.test(value) || value === "") {
      setProperty((prev) => ({ 
        ...prev, 
        [name]: value
      }
    ));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }

  // Validate the form
  const validateForm = () => {
    // Extract validation helpers
    const validators = {
      isEmpty: (value) => typeof value === 'string' && value.trim().length === 0,
      isMissing: (value) => value === null || value === undefined || validators.isEmpty(value),
      isInvalidEmail: (email) => !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
      isInvalidMobile: (mobile) => !/^\+?\d{10,15}$/.test(mobile),
      isValidInteger: (value, min = 1) => Number.isInteger(value) && value >= min
    };
  
    // Initialize errors object
    const errors = {};
    
    // Validate required text fields
    const requiredFields = [
      { key: 'name', message: 'Property name is required' },
      { key: 'description', message: 'Description is required' },
      { key: 'location', message: 'Location is required' },
      { key: 'address', message: 'Address is required' },
      { key: 'mobile', message: 'Mobile is required' },
      { key: 'email', message: 'Email is required' },
    ];
    
    requiredFields.forEach(({ key, message }) => {
      if (validators.isMissing(property[key])) {
        errors[key] = message;
      }
    });
    
    // Validate numeric fields
    const numericValidations = [
      { key: 'price', condition: property.price === null || property.price === undefined, message: 'Price is required' },
      { key: 'bedrooms', condition: !validators.isValidInteger(property.bedrooms), message: 'Bedrooms must be at least 1' },
      { key: 'bathrooms', condition: !validators.isValidInteger(property.bathrooms), message: 'This field is required' },
      { key: 'maxGuests', condition: !validators.isValidInteger(property.maxGuests), message: 'Max guests must be at least 1' }
    ];
    
    numericValidations.forEach(({ key, condition, message }) => {
      if (condition) {
        errors[key] = message;
      }
    });
    
    // Validate format fields
    if (property.mobile && validators.isInvalidMobile(property.mobile)) {
      errors.mobile = "Invalid mobile number";
    }
    
    if (property.email && validators.isInvalidEmail(property.email)) {
      errors.email = "Invalid email address";
    }
    
    // Validate date range
    validateDateRange(property, errors);
    
    return errors;
  };
  
  // Extracted date validation to a separate function
  const validateDateRange = (property, errors) => {
    const { startDate, endDate } = property.availability || {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.endDate = "End date cannot be before start date";
      }
    }
  };
  

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate file size (Max 5MB)
    const validSizeFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validSizeFiles.length !== files.length) {
      alert('Files exceed the 5MB limit.');
      return;
    }

    // Validate file format (Only JPG, PNG, WEBP)
    const validFiles = validSizeFiles.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (validFiles.length !== files.length) {
      alert('Some files have an invalid format. Please upload JPG, PNG, or WEBP only.');
      return;
    }

    // Convert files to an array of objects with URL previews
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      ...(isEditMode && { stored: false }) // Mark as new upload
    }));

    // Append valid files to state
    setProperty(prevProperty => ({...prevProperty, images: [...prevProperty.images, ...validFiles]}));
    setPreview(prev => [...prev, ...newImages]);

  }
  
  const removeImage = (index, e) => {
    e.preventDefault(); // Prevent form submission
  
    // Handle simple case (not edit mode)
    if (!isEditMode) {
      // Update property images
      setProperty(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
  
      // Update preview list
      setPreview(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      return;
    }
  
    // Handle edit mode - get the image being removed
    const removedImage = preview[index];
    const isStoredImage = removedImage?.stored;
    
    // Update property based on image type
    if (isStoredImage) {
      setProperty(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        removedImages: [...(prev.removedImages || []), removedImage.file],
      }));
    } else {
      setProperty(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
    
    // Update preview list
    setPreview(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // If there are errors, stop submission
    if (Object.keys(formErrors).length > 0) {
      // Scroll to the first error
      const firstErrorField = document.getElementById(Object.keys(formErrors)[0]);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    // Form is valid, proceed with submission
    console.log('Submitting property form:', property);
    const formData = new FormData();

    if (!isEditMode) {
      // Append the form fields to formData
      formData.append("name", property.name);
      formData.append("type", property.type);
      formData.append("description", property.description);
      formData.append("location", property.location);
      formData.append("address", property.address);
      formData.append("price", property.price);
      formData.append("bedrooms", property.bedrooms);
      formData.append("bathrooms", property.bathrooms);
      formData.append("squareFeet", property.squareFeet);
      formData.append("maxGuests", property.maxGuests);
      formData.append("amenities", JSON.stringify(property.amenities)); // If you need to store it as a string
      formData.append("availability", JSON.stringify(property.availability)); // Same for availability
      formData.append("mobile", property.mobile);
      formData.append("email", property.email);

      // Append images to formData
      property.images.forEach((image) => {
        formData.append("images", image); // Each image is appended with the key "images"
      });

      // Make the API request to upload
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendor/create-property`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
    
        if (response.status === 201) {
          navigate('/');
          alert("Property created successfully");
        }
      } catch (err) {
        alert("Error submitting property. Property could not be created.")
        console.error("Error submitting property:", err);
      }
    } else {
      formData.append("updatedName", property.name);
      formData.append("updatedType", property.type);
      formData.append("updatedDescription", property.description);
      formData.append("updatedLocation", property.location);
      formData.append("updatedAddress", property.address);
      formData.append("updatedPrice", property.price);
      formData.append("updatedBedrooms", property.bedrooms);
      formData.append("updatedBathrooms", property.bathrooms);
      formData.append("updatedSquareFeet", property.squareFeet);
      formData.append("updatedMaxGuests", property.maxGuests);
      formData.append("updatedAmenities", JSON.stringify(property.amenities)); // If you need to store it as a string
      formData.append("updatedAvailability", JSON.stringify(property.availability)); // Same for availability
      formData.append("updatedMobile", property.mobile);
      formData.append("updatedEmail", property.email);

      // Append images to formData
      preview.forEach((image) => {
        if (!image.stored) { // Only append images that aren't already in the DB 
          formData.append("newImages", image.file); // Each image is appended with the key "newImages"
        }
      });

      // Append removed images to formData
      property.removedImages?.forEach((image) => {
        formData.append("removedImages", image); // Each image is appended with the key "removedImages"
      });

      // Make the API request to upload
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/vendor/update-property/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
    
        if (response.status === 200) {
          navigate(`/property/${id}`);
          alert("Property updated successfully");
        }
      } catch (err) {
          alert("Something went wrong, changes were not submitted");
          console.error("Error submitting property:", err);
      }
    }

  };

  // Helper function to determine if a field has error
  const hasError = (fieldName) => {
    return errors[fieldName];
  };

  // Helper function to rendor error message
  const inputClass = (fieldName, hasIcon=false) => 
      `w-full ${hasIcon ? 'pl-10 pr-3' : 'px-4'} py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError(fieldName) ? 'border-red-500' : 'border-gray-300'
        }`
      
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {isEditMode ? "Edit Property" : "Create New Property"}
          </h1>
          <form onSubmit={handleSubmit} noValidate>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    Property Name* (maximum 15 characters)
                    {hasError('name') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.name}</span>
                    )}
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={property.name}
                    maxLength = {15}
                    onChange={handleInputChange}
                    required
                    className={inputClass("name")}
                    placeholder="Enter property name"
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-gray-700 mb-2">Property Type*</label>
                  <select
                    id="type"
                    name="type"
                    value={property.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {propertyTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-gray-700 mb-2">
                    Description* 
                    {hasError('description') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.description}</span>
                    )}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={property.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className={inputClass("description")}
                    placeholder="Describe your property"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-gray-700 mb-2">
                    City/Area* (maximum 25 characters)
                    {hasError('location') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.location}</span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={property.location}
                      maxLength={25}
                      onChange={handleInputChange}
                      required
                      className={inputClass("location", true)}
                      placeholder="e.g., New York, Miami"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-gray-700 mb-2">
                    Full Address*
                    {hasError('address') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.address}</span>
                    )}
                  </label>
                  <div className="relative">
                    <House className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                        id="address"
                        type="text"
                        name="address"
                        value={property.address}
                        onChange={handleInputChange}
                        required
                        className={inputClass("address", true)}
                        placeholder="Full street address"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="price" className="block text-gray-700 mb-2">
                    Price per Night*
                    {hasError('price') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.price}</span>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="price"
                      type="text"
                      inputMode="decimal"
                      name="price"
                      value={property.price}
                      onChange={handleDecimalInput}
                      required
                      className={inputClass("price", true)}
                      placeholder="99.99"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bedrooms" className="block text-gray-700 mb-2">
                    Bedrooms*
                    {hasError('bedrooms') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.bedrooms}</span>
                    )}
                  </label>
                  <div className="relative">
                    <Bed className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="bedrooms"
                      type="text"
                      name="bedrooms"
                      value={property.bedrooms}
                      onChange={handleNumberInput}
                      required
                      className={inputClass("bedrooms", true)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-gray-700 mb-2">
                    Bathrooms*
                    {hasError('bathrooms') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.bathrooms}</span>
                    )}
                  </label>
                  <div className="relative">
                    <Bath className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="bathrooms"
                      type="text"
                      name="bathrooms"
                      value={property.bathrooms}
                      onChange={handleNumberInput}
                      required
                      className={inputClass("bathrooms", true)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="squareFeet" className="block text-gray-700 mb-2">Size (sq ft)</label>
                  <div className="relative">
                    <Square className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="squareFeet"
                      type="text"
                      name="squareFeet"
                      value={property.squareFeet}
                      onChange={handleNumberInput}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="maxGuests" className="block text-gray-700 mb-2">
                    Max Guests*
                    {hasError('maxGuests') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.maxGuests}</span>
                    )}
                  </label>
                  <div className="relative">
                    <UserRound className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                        id="maxGuests"
                        type="text"
                        name="maxGuests"
                        value={property.maxGuests}
                        onChange={handleNumberInput}
                        required
                        className={inputClass("maxGuests", true)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(property.amenities).map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={amenity}
                      name={amenity}
                      checked={property.amenities[amenity]}
                      onChange={handleAmenityChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={amenity} className="ml-2 text-gray-700">
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Availability */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Availability</h2>
              <p className="text-sm text-gray-500 mb-4">
                You can leave this blank, which will specify that the property is available on all dates except dates it is already booked.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-gray-700 mb-2">Available From</label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={property.availability?.startDate ? new Date(property.availability.startDate).toISOString().split('T')[0] : ''}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    max={property.availability?.endDate ? new Date(property.availability.endDate).toISOString().split('T')[0] : ''}
                    onChange={handleAvailabilityChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-gray-700 mb-2">
                    Available Until
                    {hasError('endDate') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.endDate}</span>
                    )}
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={property.availability?.endDate ? new Date(property.availability.endDate).toISOString().split('T')[0] : ''}
                    min={
                      property.availability?.startDate
                      ? new Date(new Date(property.availability.startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]  // fallback to today if no start date
                    } 
                    onChange={handleAvailabilityChange}
                    className={inputClass("endDate")}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Your Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mobile" className="block text-gray-700 mb-2">
                    Mobile*
                    {hasError('mobile') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.mobile}</span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="mobile"
                      type="text"
                      name="mobile"
                      value={property.mobile}
                      onChange={handleMobileInput}
                      required
                      className={inputClass("mobile", true)}
                      placeholder="e.g. +880 1234567899"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email*
                    {hasError('email') && (
                      <span className="text-red-500 ml-1 text-sm">{errors.email}</span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                    <input
                      id="email"
                      type="text"
                      name="email"
                      value={property.email}
                      onChange={handleInputChange}
                      required
                      className={inputClass("email", true)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Property Images</h2>
              <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">Drag and drop your images here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Supported formats: JPG, PNG, WEBP (Max 5MB each)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="property-images"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="property-images"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                  Select Images
                </label>
              </div>
            </div>

            {/* Preview of Selected Images */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {preview.map((image, index) => (
                <div key={image.preview} className="relative group">
                  <img
                    src={image.preview}
                    alt={`preview-${index}`}
                    className="mb-2 w-full h-32 sm:h-40 md:h-48 object-cover bg-gray-100 rounded-md border"
                  />
                  <button
                    type="button"
                    aria-label="remove image"
                    onClick={(e) => removeImage(index, e)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

                
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={JSON.stringify(tempProperty) === JSON.stringify(property)}
                className={`px-6 py-3 rounded-md flex items-center transition duration-300 
                  ${JSON.stringify(tempProperty) === JSON.stringify(property) 
                    ? 'bg-gray-400 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`}
              >
                <Save className="mr-2" size={20} />
                {isEditMode ? "Save Changes" : "Create Property"}
              </button>
            </div>

          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PropertyForm;