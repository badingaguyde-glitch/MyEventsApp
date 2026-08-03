import { Stack } from "expo-router";
import '@/global.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Inner layout — consumes AuthContext.
 * usePushNotifications is always called (respects Rules of Hooks),
 * but the hook internally skips registration when the user is not logged in.
 */
function AppContent() {
  const { user } = useAuth();
  usePushNotifications(!!user);   // passes isAuthenticated flag

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}