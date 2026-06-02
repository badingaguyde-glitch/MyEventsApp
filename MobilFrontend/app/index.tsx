import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/login" />;
}
