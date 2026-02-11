
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'stbadmin786') {
      db.setSystemAdmin(true);
      navigate('/admin');
    } else {
      setError(true);
      setPass('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center mx-auto transform rotate-12 shadow-2xl">
              <span className="text-red-600 text-4xl font-black -rotate-12 italic font-gaming">STB</span>
          </div>
          <div>
            <h1 className="text-2xl font-gaming font-black italic text-white uppercase tracking-tighter">COMMAND UPLINK</h1>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Authorized Personnel Only</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-2">
             <label className="text-[10px] text-zinc-700 font-black uppercase tracking-widest px-2">Access Key</label>
             <input 
                type="password" autoFocus value={pass} onChange={e => setPass(e.target.value)} placeholder="••••"
                className={`w-full bg-black border-b-2 ${error ? 'border-red-600' : 'border-zinc-800'} py-4 text-center text-4xl tracking-[0.5em] focus:outline-none focus:border-red-600 transition-all text-white font-mono placeholder:text-zinc-900`}
              />
          </div>
          
          <div className="flex flex-col space-y-4">
              <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] neon-red shadow-2xl transition-all active:scale-95">ESTABLISH UPLINK</button>
              <button type="button" onClick={() => navigate('/')} className="text-[10px] text-zinc-700 font-black uppercase tracking-widest hover:text-zinc-500 transition-colors">ABORT MISSION</button>
          </div>
        </form>

        {error && (
            <div className="absolute bottom-4 left-0 w-full text-center">
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest animate-bounce">ACCESS DENIED • RETRY</span>
            </div>
        )}
      </div>
    </div>
  );
}
