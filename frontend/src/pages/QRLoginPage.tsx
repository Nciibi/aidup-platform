// ─── QRLoginPage ────────────────────────────────────────────────────────────
// Replaces: QRLoginScreen.kt
// Uses html5-qrcode for web camera scanning + Socket.IO for PC-side login

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { tokenManager } from '../utils/token';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, QrCode, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

type QrState = 'idle' | 'scanning' | 'validating' | 'awaiting' | 'approved' | 'error';

export default function QRLoginPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<QrState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const html5QrRef = useRef<any>(null);

  // If the user IS already logged in, this acts as a scanner to approve a PC session
  // If NOT logged in, show a QR code that another device can scan
  const isLoggedIn = tokenManager.isLoggedIn();

  useEffect(() => {
    return () => {
      html5QrRef.current?.stop?.().catch(() => {});
      socketRef.current?.disconnect();
    };
  }, []);

  // ── PC FLOW: Generate QR and listen via WebSocket ─────────────────────
  const startPcFlow = async () => {
    setState('validating');
    try {
      const session = await authApi.createQrSession();
      if (session.sessionId) {
        setSessionId(session.sessionId);
        setState('awaiting');

        // Connect WebSocket
        const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const socket = io(BASE);
        socketRef.current = socket;

        socket.emit('qr:join-session', session.sessionId);
        socket.on('qr:authenticated', (data: any) => {
          if (data.accessToken) {
            tokenManager.saveToken(data.accessToken);
            if (data.refreshToken) tokenManager.saveRefreshToken(data.refreshToken);
            setState('approved');
            toast.success('Login approved!');
            // We may not have userinfo via socket, so redirect to home and let hydrate handle it
            setTimeout(() => { window.location.href = '/home'; }, 1500);
          }
        });
      }
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Failed to create QR session');
    }
  };

  // ── PHONE FLOW: Scan QR and approve ───────────────────────────────────
  const startScanning = async () => {
    setState('scanning');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await scanner.stop();
          handleScannedCode(decodedText);
        },
        () => {} // ignore errors during scanning
      );
    } catch {
      setState('error');
      setErrorMsg('Could not access camera. Please allow camera permissions.');
    }
  };

  const handleScannedCode = async (rawValue: string) => {
    setState('validating');
    let sid = rawValue;
    if (rawValue.includes('/auth/qr/scan/')) {
      try {
        const url = new URL(rawValue);
        sid = url.pathname.split('/').pop() || rawValue;
      } catch {
        sid = rawValue.split('/').pop() || rawValue;
      }
    }

    if (!sid) { setState('error'); setErrorMsg('Invalid QR code'); return; }

    try {
      await authApi.scanQrSession(sid);
      setSessionId(sid);
      setState('awaiting');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Failed to validate QR code');
    }
  };

  const handleApprove = async () => {
    if (!sessionId) return;
    setState('validating');
    try {
      await authApi.approveQrSession(sessionId);
      setState('approved');
      toast.success('Login approved on the other device!');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Failed to approve');
    }
  };

  const reset = () => { setState('idle'); setSessionId(null); setErrorMsg(''); };

  return (
    <div className="max-w-md mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">QR Login</h1>
      </div>

      <div className="flex flex-col items-center text-center space-y-6">
        {state === 'idle' && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            {isLoggedIn ? (
              <>
                <p className="text-gray-500">Scan a QR code from another device to approve their login.</p>
                <button onClick={startScanning} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all">
                  Scan QR Code
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500">Generate a QR code and scan it with a logged-in device.</p>
                <button onClick={startPcFlow} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all">
                  Generate QR Code
                </button>
              </>
            )}
          </>
        )}

        {state === 'scanning' && (
          <div className="w-full">
            <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden" />
            <button onClick={() => { html5QrRef.current?.stop?.(); reset(); }} className="mt-4 text-sm text-orange-500 font-bold">Cancel</button>
          </div>
        )}

        {state === 'validating' && <Spinner className="py-12" />}

        {state === 'awaiting' && (
          <>
            {isLoggedIn ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-bold">Approve login on the other device?</p>
                <button onClick={handleApprove} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-xl">Approve Login</button>
                <button onClick={reset} className="text-sm text-gray-500">Cancel</button>
              </>
            ) : (
              <>
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-orange-200 dark:border-orange-800">
                  {/* Simple QR display: show the session URL as text since we can't generate QR image client-side without a library */}
                  <div className="text-center space-y-2">
                    <QrCode className="w-24 h-24 text-orange-500 mx-auto" />
                    <p className="text-xs text-gray-400 break-all">Session: {sessionId}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Waiting for approval from your mobile device...</p>
                <Spinner className="py-4" />
              </>
            )}
          </>
        )}

        {state === 'approved' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Login Approved!</p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 font-medium">{errorMsg}</p>
            <button onClick={reset} className="text-orange-500 font-bold">Try Again</button>
          </>
        )}
      </div>
    </div>
  );
}
