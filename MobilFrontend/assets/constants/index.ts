


export const COLORS = {
    primary: "#111111",
    secondary: "#666666",
    background: "#FFFFFF",
    surface: "#F7F7F7",
    accent: "#FF4C3B",
    border: "#EEEEEE",
    error: "#FF4444",
    inactive: "cdcde0",
};
 



export const getStatusColor = (status: string) => {
    switch (status) {
        case "placed":
            return "bg-yellow-50 text-yellow-900";
        case "processing":
            return "bg-indigo-50 text-indigo-900";
        case "shipped":
            return "bg-purple-50 text-purple-900";
        case "delivered":
            return "bg-green-50 text-green-900";
        case "cancelled":
            return "bg-red-50 text-red-900";
        default:
            return "bg-gray-50 text-gray-900";
    }
};

export const BANNERS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
        title: "Your Local Event Hub",
        subtitle: "Discover concerts, festivals & sports near you. Join the community.",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
        title: "Host Your Own Event",
        subtitle: "Create, manage, and sell tickets effortlessly",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
        title: "Get Your Tickets",
        subtitle: "Secure your spot in seconds. Start exploring now.",
    },
];

export const CATEGORIES = [
  { id: 1, name: "Music", icon: "musical-note" },
  { id: 2, name: "Sports", icon: "football" },
  { id: 3, name: "Arts", icon: "color-palette" },
  { id: 4, name: "Tech", icon: "desktop" },
  { id: 5, name: "Education", icon: "school" },
    { id: 6, name: "Other", icon: "grid-outline" },
];

export const EVENT_CATEGORIES = [
    'Music', 'Sports', 'Arts', 'Tech', 'Education', 'Other'
];


export type CategoryItemProps = {
    item: { id: string | number; name: string; icon: string };
    isSelected?: boolean;
    onPress?: () => void;
};

// types/index.ts
export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string[];
  date: string | Date;
  time?: string;
  capacity: number;
  location: {
    venue: string;
    address: string;
    city: string;
  };
  coordinates?: number[];
  price: number;
  image: string;
  organizer: {
    _id: string;
    name: string;
    lastName: string;
    email: string;
  } | string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string | Date;
  availableSpots?: number;
  isSoldOut?: boolean;
}

export interface Ticket {
  _id: string;
  ticketCode: string;
  event: Event;
  user: string;
  status: 'active' | 'used' | 'cancelled';
  price: number;
  purchaseDate?: string;
  checkInTime?: string;
  eventStatus?: 'upcoming' | 'past' | 'attended';
}

export interface User {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  interests: string[];
  role: 'user' | 'admin' | 'event_organizer' | 'service_provider';
  token?: string;
}

 export interface MyEvent {
  _id: string
  title: string
  description: string
  category: string[]
  date: string
  capacity: number
  location: {
    venue: string
    address: string
    city: string
  }
  price: number
  image: string
  status: string
  createdAt: string
  organizer: string
  soldTickets?: number
  checkedIn?: number
  availableSpots?: number
  isSoldOut?: boolean
}

// Add to existing exports
export interface CreateEventData {
    title: string;
    description: string;
    category: string[];
    date: string;
    time: string;
    location: {
        venue: string;
        address: string;
        city: string;
    };
    capacity: number;
    price: number;
    coordinates?: number[];
    image?: any;
}

export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
}

export const CITIES = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'
];

// Add this to your existing constants file

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: 'km' | 'miles' = 'km'): number => {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

import { Platform } from 'react-native';

export const resolveEventImage = (imagePath: string): string => {
  if (!imagePath || imagePath === 'default-event.jpg') {
    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600";
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUploadsUrl = Platform.select({
    android: "http://10.0.2.2:5000/uploads",
    ios: "http://localhost:5000/uploads",
    default: "http://localhost:5000/uploads"
  });
  return `${baseUploadsUrl}/${imagePath}`;
};

