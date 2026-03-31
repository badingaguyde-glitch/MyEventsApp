import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/EventServices';
import { checkOrganizerStatus } from '../redux/reducer';
import { motion } from 'framer-motion';
import { AlertCircle,Save, X, Calendar, MapPin, Users, DollarSign, Image as ImageIcon, Tag, Clock } from 'lucide-react';
import Loader from './Loader';

const CreateEvents = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'conference',
        date: '',
        time: '',
        city: '',
        address: '',
        venue: '',
        capacity: '',
        price: '',
        longitude: '',
        latitude: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] }); // stocker le fichier
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("date", formData.date);
            data.append("time", formData.time);
            data.append("capacity", Number(formData.capacity));
            data.append("price", Number(formData.price));

            data.append("location.city", formData.city);
            data.append("location.address", formData.address);
            data.append("location.venue", formData.venue);
            data.append("coordinates[0]", formData.longitude);
            data.append("coordinates[1]", formData.latitude);

            if (formData.image) {
                data.append("image", formData.image);
            }

            // envoyer `data` au lieu de `formData`
            await EventService.createEvent(data, user.token);
            dispatch(checkOrganizerStatus(user.token));
            navigate('/my-events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header Section */}
      <div className="px-6 py-8 sm:px-8 sm:py-10 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Launch Experience
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Design and publish your next event
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Narrative Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Event Narrative
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Conceptual Title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Event Detail
              </label>
              <textarea
                name="description"
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-y"
                placeholder="Describe the atmosphere and purpose..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  name="category"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Concert">Concert</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Orchestration Venue */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Orchestration Venue
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                <div className="space-y-4 pl-0 sm:pl-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="address"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="venue"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Event venue"
                      value={formData.venue}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Latitude (e.g., 48.8566)"
                      value={formData.latitude}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Longitude (e.g., 2.3522)"
                      value={formData.longitude}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="time"
                    name="time"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Guest Capacity
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="capacity"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g., 500"
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Ticket Premium ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="price"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter value"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Event Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200"
                />
                {formData.image && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex-shrink-0">
                    Selected: {formData.image.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initializing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save size={20} />
                  Publish Event
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </div>
</div>
    );
};

export default CreateEvents;
