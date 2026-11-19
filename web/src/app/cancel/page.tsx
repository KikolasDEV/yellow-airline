import { PaymentStatus } from '@/components/bookings/PaymentStatus';

export default async function CancelPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return <PaymentStatus sessionId={session_id} cancel />;
}
