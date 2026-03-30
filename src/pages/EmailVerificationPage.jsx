import { useEffect, useState } from 'react';
import { notificationsAPI } from '../api/client';
import './EmailVerificationPage.css';

export default function EmailVerificationPage({ showToast }) {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const data = await notificationsAPI.verifyEmail(token);
        setStatus('success');
        setMessage(`Email verified successfully for ${data?.email || 'your account'}.`);
        showToast('Email verification completed.', 'success');
      } catch {
        setStatus('error');
        setMessage('Verification failed or link is expired.');
      }
    };

    verify();
  }, [showToast]);

  return (
    <div className="email-verification-page">
      <div className={`verification-card ${status}`}>
        <h2>Email Verification</h2>
        <p>{message}</p>
        {status !== 'verifying' && (
          <button
            type="button"
            onClick={() => {
              window.history.replaceState({}, '', '/');
              window.location.reload();
            }}
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  );
}
