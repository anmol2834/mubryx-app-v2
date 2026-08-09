import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from '@/screens/Auth/LoginScreen';
import { Redirect } from 'expo-router';

export default function LoginRoute() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

  if (!isLoading && user) {
    return <Redirect href="/" />;
  }

  return <LoginScreen />;
}

