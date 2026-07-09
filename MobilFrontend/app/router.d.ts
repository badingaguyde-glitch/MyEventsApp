// app/router.d.ts
import 'expo-router';

declare module 'expo-router' {
  export interface Href {
    pathname: 
      | '/'
      | '/events'
      | '/search'
      | '/mytickets'
      | '/profile'
      | '/login'
      | '/register'
      | '/forgot-password'
      | '/reset-password'
      | '/new-password'
      | `/event/${string}`
      | `/ticket/${string}`
      | '/modal/event';
    
    params?: Record<string, string | number | string[] | undefined>;
  }
}