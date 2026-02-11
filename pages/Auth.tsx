
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { db } from '../services/db';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatFirebaseError = (errorMsg: string) => {
    if (errorMsg.includes('auth/configuration-not-found')) {
      return "Error: Firebase Console-এ Email/Password অথেন্টিকেশন চালু করা নেই।";
    }
    if (errorMsg.includes('auth/invalid-credential')) {
      return "ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে।";
    }
    if (errorMsg.includes('auth/email-already-in-use')) {
      return "এই ইমেইলটি অলরেডি ব্যবহার করা হয়েছে।";
    }
    if (errorMsg.includes('auth/weak-password')) {
      return "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।";
    }
    return errorMsg;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Added numericId to match User interface requirements
        db.saveCurrentUser({
          id: userCredential.user.uid,
          numericId: db.generateNumericId(),
          name: email.split('@')[0],
          email: email,
          phone: '',
          depositBalance: 0,
          winningBalance: 0,
          totalKills: 0,
          totalEarnings: 0,
          totalMatchesJoined: 0,
          isAdmin: false
        });
      }
    } catch (err: any) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setVerificationId(result);
    } catch (err: any) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !verificationId) return;
    setLoading(true);
    setError('');
    try {
      const result = await verificationId.confirm(otp);
      if (!isLogin) {
        // Added numericId to match User interface requirements
        db.saveCurrentUser({
          id: result.user.uid,
          numericId: db.generateNumericId(),
          name: 'Player_' + Math.floor(Math.random() * 1000),
          email: '',
          phone: phone,
          depositBalance: 0,
          winningBalance: 0,
          totalKills: 0,
          totalEarnings: 0,
          totalMatchesJoined: 0,
          isAdmin: false
        });
      }
    } catch (err: any) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-gaming font-black italic text-red-600 uppercase tracking-widest leading-none">
              {isLogin ? 'LOG IN' : 'SIGN UP'}
            </h1>
            <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-[0.4em]">STB Tournament Uplink</p>
          </div>

          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button 
              onClick={() => { setAuthMethod('email'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${authMethod === 'email' ? 'bg-red-600 text-white shadow-lg neon-red' : 'text-zinc-500'}`}
            >
              EMAIL
            </button>
            <button 
              onClick={() => { setAuthMethod('phone'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${authMethod === 'phone' ? 'bg-red-600 text-white shadow-lg neon-red' : 'text-zinc-500'}`}
            >
              PHONE
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-600/10 border border-red-600/50 text-red-500 text-[11px] rounded-xl text-center font-bold">
              {error}
            </div>
          )}

          {authMethod === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm font-bold placeholder:text-zinc-700" 
                required 
              />
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="PASSWORD"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm font-bold placeholder:text-zinc-700" 
                required 
              />
              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl neon-red transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : isLogin ? 'ESTABLISH UPLINK' : 'CREATE CITIZEN ID'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {!verificationId ? (
                <>
                  <input 
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+88017XXXXXXXX"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-red-500 transition-all text-sm font-bold placeholder:text-zinc-700" 
                  />
                  <div id="recaptcha-container"></div>
                  <button 
                    onClick={handleSendOtp} disabled={loading || !phone}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl neon-red transition-all"
                  >
                    SEND ACCESS CODE
                  </button>
                </>
              ) : (
                <>
                  <input 
                    type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="ENTER OTP"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-red-500 text-center text-3xl tracking-[0.8em] font-mono text-white" 
                  />
                  <button 
                    onClick={handleVerifyOtp} disabled={loading || !otp}
                    className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl neon-yellow transition-all"
                  >
                    VERIFY & ACCESS
                  </button>
                  <button onClick={() => setVerificationId(null)} className="w-full text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">BACK TO COMMS</button>
                </>
              )}
            </div>
          )}

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY REGISTERED? LOG IN"}
          </button>
        </div>
      </div>
    </div>
  );
}
