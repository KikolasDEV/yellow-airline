'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function PaymentStatus({ sessionId, cancel = false }: { sessionId?: string; cancel?: boolean }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const check = useCallback(() => fetch(`/api/payments/session?session_id=${encodeURIComponent(sessionId ?? '')}`, { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      setError(false);
      setStatus(data.status);
    }).catch(() => setError(true)).finally(() => setBusy(false)), [sessionId]);
  useEffect(() => { void check(); }, [check]);
  useEffect(() => {
    if (cancel || !['OPEN', 'CREATING'].includes(status)) return;
    const timer = window.setInterval(() => void check(), 5000);
    return () => window.clearInterval(timer);
  }, [cancel, status, check]);
  const close = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/payments/cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) throw new Error();
      await check();
    } catch { setError(true); }
    finally { setBusy(false); }
  };
  return <section className="section-frame mx-auto max-w-3xl space-y-6 p-8 text-center">
    <p className="eyebrow">Yellow Airline / Checkout</p>
    <h1 className="section-title text-4xl">{t(status === 'PAID' ? 'payment_verified' : cancel ? 'cancel_title' : 'checking_payment')}</h1>
    <p role="status" className="section-copy">{error || !sessionId ? t('payment_unavailable') : status === 'EXPIRED' ? t('cancelled') : status === 'REVIEW' ? t('REVIEW') : status === 'PAID' ? t('bookings_copy') : t(cancel ? 'cancel_copy' : 'payment_pending')}</p>
    <div className="flex flex-wrap justify-center gap-3">
      {cancel && ['OPEN', 'CREATING'].includes(status) && <button className="cta-secondary" disabled={busy} onClick={() => void close()}>{t('cancel_confirm')}</button>}
      <button className="cta-secondary" disabled={busy || !sessionId} onClick={() => void check()}>{t('refresh_payment')}</button>
      <Link className="cta-primary" href="/my-bookings">{t('my_bookings')}</Link>
      <Link className="cta-secondary" href="/">{t('go_home')}</Link>
    </div>
  </section>;
}
