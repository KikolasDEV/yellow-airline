import { LoginForm } from '@/components/auth/LoginForm';
import { AuthIntro } from '@/components/auth/AuthIntro';

export default function LoginPage() {
  return <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-2"><AuthIntro /><LoginForm /></div>;
}
