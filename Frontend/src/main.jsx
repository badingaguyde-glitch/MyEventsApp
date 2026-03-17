import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import CreateEvent from './components/CreateEvents';
import MyEvents from './components/MyEvents';
import MyTickets from './components/MyTickets';
import AdminDashboard from './components/AdminDashboard';
import OrganizerDashboard from './components/Organizerdashboard';
import EventParticipants from './components/EventParticipants';
import Profile from './components/Profile';
import EventSearch from './components/EventSearch';
import EditEvent from './components/EditEvent';
import VerifyTicket from './components/VerifyTicket';
import PageError from './components/PageError';
import Template from './components/Template';
import ProtectedRoute from './components/ProtectedRoute';
import store from './redux/store';
import { Provider } from 'react-redux';
import "./App.css";
import ErrorBoundary from './components/ErrorBoundary';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Template/>}>
            <Route index element={<Home />} />
            <Route path="search" element={<EventSearch />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="edit-event/:id" element={<EditEvent />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="events/:id/participants" element={<EventParticipants />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="organizer-dashboard" element={<ProtectedRoute requireOwnership={true}><OrganizerDashboard /></ProtectedRoute>} />
            <Route path="verify-ticket" element={<ProtectedRoute><VerifyTicket /></ProtectedRoute>} />
            <Route path="*" element={<PageError />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </Provider>
)