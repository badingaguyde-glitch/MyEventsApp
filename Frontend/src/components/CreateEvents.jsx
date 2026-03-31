import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/EventServices';
import { checkOrganizerStatus } from '../redux/reducer';
import { motion } from 'framer-motion';
import { AlertCircle, Save, X, Calendar, MapPin, Users, DollarSign, Image as ImageIcon, Tag, Clock } from 'lucide-react';
import Loader from './Loader';

const CreateEvents = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      setFormData({ ...formData, image: files[0] });
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

      data.append("location[city]", formData.city);
      data.append("location[address]", formData.address);
      data.append("location[venue]", formData.venue);
      data.append("coordinates[0]", formData.longitude || 0);
      data.append("coordinates[1]", formData.latitude || 0);

      if (formData.image) {
        data.append("image", formData.image);
      }


      await EventService.createEvent(data, user.token);
      dispatch(checkOrganizerStatus(user.token));
      navigate('/my-events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card glass p-10 space-y-10 border"
          style={{ borderColor: 'var(--border-white)' }}
        >

          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b"
            style={{ borderBottom: '1px solid var(--border-white)' }}>
            <div>
              <h1 className="text-3xl font-black">Launch Experience</h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                Design and publish your next event
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="p-3 glass rounded-full text-slate-400 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Event Narrative */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Event Narrative
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input"
                  placeholder="Conceptual Title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Event Detail
                </label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  className="input py-4"
                  placeholder="Describe the atmosphere and purpose..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select
                    name="category"
                    className="input pl-12 appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="conference">Confce</option>
                    <option value="workshop">Workshop</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="art">Art</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Orchestration Venue
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                    type="text"
                    name="city"
                    className="input"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="address"
                    className="input"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="venue"
                    className="input"
                    placeholder="Event venue"
                    value={formData.venue}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    className="input"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    className="input"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="date"
                    name="date"
                    required
                    className="input pl-12"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="time"
                    name="time"
                    required
                    className="input pl-12"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Capacity & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="number"
                    name="capacity"
                    required
                    className="input pl-12"
                    placeholder="Guest capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="number"
                    name="price"
                    required
                    className="input pl-12"
                    placeholder="Ticket price"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Event Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="input"
              />
              {formData.image && (
                <span className="text-xs text-slate-400 truncate">{formData.image.name}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-sm uppercase tracking-[0.2em] shadow-xl"
            >
              {loading ? 'Initializing...' : (
                <span className="flex items-center justify-center gap-3">
                  <Save size={20} />
                  Publish Event
                </span>
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateEvents;
