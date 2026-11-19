import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthIntro } from '@/components/auth/AuthIntro';

export default function VipPage() {
  return <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-2"><AuthIntro register /><RegisterForm /></div>;
}
