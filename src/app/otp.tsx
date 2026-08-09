import { useAuthStore } from '@/store/authStore';
import { OtpScreen } from '@/screens/Auth/OtpScreen';
import { Redirect } from 'expo-router';

export default function OtpRoute() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  // If a new user just verified OTP, they need to enter their name first.
  // Keep OtpScreen mounted so the NameToaster modal can slide in.
  const needsNameCompletion = useAuthStore(s => s.needsNameCompletion);

  if (isLoading) return null;
  // Only redirect home if user is logged in AND does NOT need name completion
  if (user && !needsNameCompletion) return <Redirect href="/" />;

  return <OtpScreen />;
}
