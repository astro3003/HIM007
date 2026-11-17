import React, { useState, useRef, useEffect } from 'react';
import { Shield, Lock, X, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { backendService } from '../services/api';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (unreadAlertsCount?: number) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [lockedUntil, setLockedUntil] = useState<number>(0);
  const [lockRemainingSec, setLockRemainingSec] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsSuccess(false);
      setIsVerifying(false);
      setIsShaking(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setLockRemainingSec(0);
      return;
    }

    const updateCountdown = () => {
      const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockRemainingSec(diff);
      if (diff === 0) {
        setLockedUntil(0);
        setErrorMsg('');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  if (!isOpen) return null;

  const isLocked = lockRemainingSec > 0;

  const handleDigitChange = (index: number, value: string) => {
    if (isVerifying || isSuccess || isLocked) return;
    setErrorMsg('');

    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const nextDigits = ['', '', '', '', '', ''];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = cleaned[i] || '';
        }
        setPinDigits(nextDigits);

        const filledCount = Math.min(cleaned.length, 6);
        if (filledCount === 6) {
          void verifyPin(nextDigits.join(''));
        } else {
          inputRefs.current[filledCount]?.focus();
        }
        return;
      }
    }

    const singleDigit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...pinDigits];
    nextDigits[index] = singleDigit;
    setPinDigits(nextDigits);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const currentFullPin = nextDigits.join('');
    if (currentFullPin.length === 6 && !nextDigits.includes('')) {
      void verifyPin(currentFullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    if (isVerifying || isSuccess || isLocked) return;
    setErrorMsg('');
    const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      handleDigitChange(firstEmptyIndex, val);
    }
  };

  const handleKeypadBackspace = () => {
    if (isVerifying || isSuccess || isLocked) return;
    setErrorMsg('');
    for (let i = 5; i >= 0; i--) {
      if (pinDigits[i] !== '') {
        const nextDigits = [...pinDigits];
        nextDigits[i] = '';
        setPinDigits(nextDigits);
        inputRefs.current[i]?.focus();
        return;
      }
    }
  };

  const handleKeypadClear = () => {
    if (isVerifying || isSuccess || isLocked) return;
    setPinDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    inputRefs.current[0]?.focus();
  };

  const verifyPin = async (enteredPin: string) => {
    setIsVerifying(true);
    const result = await backendService.loginAdmin(enteredPin);
    setIsVerifying(false);

    if (result.success) {
      setIsSuccess(true);
      setErrorMsg('');
      setTimeout(() => {
        onAuthenticated(result.unreadAlertsCount || 0);
      }, 450);
      return;
    }

    setIsShaking(true);
    if (result.lockedUntil) {
      setLockedUntil(result.lockedUntil);
    }
    setErrorMsg(result.error || 'Access denied: invalid authorization PIN');
    setTimeout(() => {
      setIsShaking(false);
      setPinDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 650);
  };

  const lockMinutes = Math.floor(lockRemainingSec / 60);
  const lockSeconds = lockRemainingSec % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-md bg-[#14171F] border rounded-2xl ${
          isSuccess
            ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.22)]'
            : isLocked || errorMsg
            ? 'border-[#FF4D00] shadow-[0_0_40px_rgba(255,77,0,0.22)]'
            : 'border-white/15 shadow-2xl'
        } p-6 sm:p-8 transition-all duration-200 text-[#F6F4F0] ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#C8C4BC] hover:text-white hover:bg-white/10 transition-colors rounded-full cursor-pointer"
          title="Abort Access Request"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="p-3.5 bg-[#0B0D12] border border-white/10 text-[#FF4D00] rounded-2xl">
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : isLocked ? (
              <ShieldAlert className="w-8 h-8 text-[#FF4D00] animate-pulse" />
            ) : errorMsg ? (
              <AlertTriangle className="w-8 h-8 text-[#FF4D00]" />
            ) : isVerifying ? (
              <Loader2 className="w-8 h-8 text-[#FF4D00] animate-spin" />
            ) : (
              <Lock className="w-8 h-8 text-[#FF4D00]" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center px-3 py-1 bg-[#0B0D12] border border-white/15 text-[#FF4D00] text-[10px] font-mono font-bold tracking-widest uppercase mb-2 rounded-sm">
              <Shield className="w-3 h-3 mr-1.5" />
              HIM HQ // Cryptographic Auth
            </div>
            <h3 className="text-xl font-editorial font-bold text-white">
              {isLocked ? 'Security Lockout Active' : 'Owner Verification'}
            </h3>
            <p className="text-xs text-[#C8C4BC] mt-1 max-w-xs leading-relaxed">
              {isLocked
                ? `Brute-force protection engaged. Retry in ${lockMinutes}:${String(lockSeconds).padStart(2, '0')}. Unauthorized attempts are logged.`
                : 'Enter your 6-digit HIM HQ security PIN. All authentication attempts are monitored.'}
            </p>
          </div>
        </div>

        {/* 6 Digit Input Cells */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-5">
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isSuccess || isVerifying || isLocked}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-[#0B0D12] rounded-xl border transition-all outline-none ${
                isSuccess
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                  : isLocked || errorMsg
                  ? 'border-[#FF4D00] text-[#FF4D00] bg-[#FF4D00]/10'
                  : digit
                  ? 'border-[#FF4D00] text-white bg-[#181C26]'
                  : 'border-white/15 text-white focus:border-[#FF4D00]'
              }`}
            />
          ))}
        </div>

        {/* Status Line */}
        <div className="min-h-[24px] mb-4 flex items-center justify-center text-xs font-medium text-center px-2">
          {isSuccess ? (
            <span className="text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Session token issued // Opening HIM HQ
            </span>
          ) : isVerifying ? (
            <span className="text-[#C8C4BC] flex items-center">
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#FF4D00]" />
              Verifying salted hash...
            </span>
          ) : errorMsg ? (
            <span className="text-[#FF4D00] flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>{errorMsg}</span>
            </span>
          ) : (
            <span className="text-[#C8C4BC]/70 text-[11px] font-mono">
              Brute-force guard & intrusion alerts active
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              disabled={isSuccess || isVerifying || isLocked}
              className="py-2.5 bg-[#0B0D12] hover:bg-[#FF4D00] active:bg-[#E03E1A] disabled:opacity-40 text-white border border-white/10 rounded-xl font-bold text-base transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleKeypadClear}
            disabled={isSuccess || isVerifying || isLocked}
            className="py-2.5 bg-[#0B0D12] hover:bg-white/10 disabled:opacity-40 border border-white/10 rounded-xl text-[10px] text-[#C8C4BC] hover:text-white uppercase font-mono font-bold transition-colors cursor-pointer"
          >
            CLR
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            disabled={isSuccess || isVerifying || isLocked}
            className="py-2.5 bg-[#0B0D12] hover:bg-[#FF4D00] active:bg-[#E03E1A] disabled:opacity-40 text-white border border-white/10 rounded-xl font-bold text-base transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleKeypadBackspace}
            disabled={isSuccess || isVerifying || isLocked}
            className="py-2.5 bg-[#0B0D12] hover:bg-white/10 disabled:opacity-40 border border-white/10 rounded-xl text-[10px] text-[#C8C4BC] hover:text-white uppercase font-mono font-bold transition-colors cursor-pointer"
          >
            DEL
          </button>
        </div>

        <div className="text-center pt-3 border-t border-white/10 text-[11px] font-mono text-[#C8C4BC]/70">
          Protected by HIM Security Shield (Scrypt + HMAC-SHA256)
        </div>
      </div>
    </div>
  );
};
