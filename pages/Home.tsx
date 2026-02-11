
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Match, MatchType, User } from '../types';
import { db } from '../services/db';

const MatchCard: React.FC<{ match: Match; user: User | null }> = ({ match, user }) => {
  const isFull = match.joinedSlots.length >= match.totalSlots;
  const defaultImg = `https://picsum.photos/seed/${match.id}/600/400`;
  const navigate = useNavigate();

  const handleJoinClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };
  
  return (
    <div className="bg-[#0F0F0F] border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-red-500/50 transition-all duration-500 group shadow-2xl">
      <div className="relative h-56">
        <img src={match.imageUrl || defaultImg} alt={match.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-700 group-hover:scale-105" />
        <div className="absolute top-5 left-5 flex space-x-3">
            <span className="px-4 py-1.5 bg-red-600 text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">{match.type}</span>
            <span className="px-4 py-1.5 bg-zinc-900/90 text-[9px] font-black rounded-full uppercase tracking-[0.2em] border border-zinc-700 shadow-lg">{match.map}</span>
        </div>
        {match.isPointSystem && (
          <div className="absolute top-5 right-5">
             <span className="px-3 py-1.5 bg-yellow-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">POINT MATCH</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent">
            <h3 className="text-2xl font-black font-gaming uppercase italic text-white tracking-tighter line-clamp-1">{match.title}</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1 italic">
              {match.version} • {match.type === MatchType.SQUAD ? 'FULL SQUAD' : match.type} BATTLE
            </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 shadow-inner">
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Win Pool</p>
                <p className="text-base font-black text-yellow-500 italic">৳{match.prizePool}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 shadow-inner">
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">
                  {match.isPointSystem ? 'Kill Pts' : 'Per Kill'}
                </p>
                <p className="text-base font-black text-red-500 italic">
                  {match.isPointSystem ? `${match.pointsPerKill} PTS` : `৳${match.prizePerKill}`}
                </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 shadow-inner">
                <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Entry</p>
                <p className="text-base font-black text-white italic">৳{match.entryFee}</p>
            </div>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                <span className="text-zinc-600 italic">Battle Capacity</span>
                <span className="text-zinc-300">{match.joinedSlots.length} / {match.totalSlots}</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 transition-all duration-1000 ease-out" style={{ width: `${(match.joinedSlots.length / match.totalSlots) * 100}%` }}></div>
            </div>
        </div>
        <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
                <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Deployment</span>
                <span className="text-xs font-bold text-zinc-400 italic">{new Date(match.startTime).toLocaleDateString()}</span>
            </div>
            <Link 
                to={`/match/${match.id}`} 
                onClick={handleJoinClick}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 ${isFull ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-red-600 hover:bg-red-500 text-white neon-red shadow-xl'}`}
            >
                {isFull ? 'FULL OPS' : 'JOIN OPS'}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home({ user }: { user: User | null }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<MatchType | 'ALL'>('ALL');
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [gateError, setGateError] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [settings, setSettings] = useState(db.getSettings());
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateData = () => {
      setMatches(db.getMatches().filter(m => !m.isCompleted));
      const s = db.getSettings();
      setSettings(s);
      
      if (s.isPopupActive && !sessionStorage.getItem('popup_shown')) {
        setTimeout(() => setShowPopup(true), 1000);
        sessionStorage.setItem('popup_shown', 'true');
      }
    };
    updateData();
    window.addEventListener('storage_update', updateData);
    return () => window.removeEventListener('storage_update', updateData);
  }, []);

  const handleSecretTrigger = () => {
    setClickCount(prev => {
      if (prev + 1 >= 5) {
        setShowAdminGate(true);
        return 0;
      }
      return prev + 1;
    });
    setTimeout(() => setClickCount(0), 3000);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'stbadmin786') {
      db.setSystemAdmin(true);
      setShowAdminGate(false);
      navigate('/admin');
    } else {
      setGateError(true);
      setAdminPass('');
      setTimeout(() => setGateError(false), 2000);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {settings.notice && (
        <div className="bg-red-600/5 border-y border-red-600/20 py-4 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block font-black text-red-600 text-[11px] uppercase tracking-[0.4em]">
                {settings.notice} • {settings.notice} • {settings.notice}
            </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[3rem] h-[22rem] bg-zinc-950 flex items-center p-12 border border-red-600/10 shadow-[0_0_80px_rgba(239,68,68,0.05)] group">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-[20s]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </div>
        <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-block px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 text-[9px] font-black uppercase tracking-[0.4em]">Combat Phase: Active</div>
            <h1 className="text-6xl font-gaming font-black italic text-white uppercase leading-none tracking-tighter">
                <span className="text-red-600">STB ELITE</span><br/>BATTLEGROUND
            </h1>
            <p className="text-zinc-500 font-bold max-w-lg leading-relaxed text-sm uppercase tracking-wider">Join Bangladesh's most exclusive Free Fire circuit. High stakes, real rewards, legendary status.</p>
        </div>
      </section>

      {/* TOURNAMENTS LIST */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div className="flex items-center space-x-5">
            <div className="w-2 h-10 bg-red-600 rounded-full animate-pulse"></div>
            <div>
                <h2 className="text-3xl font-black font-gaming italic uppercase text-white tracking-tighter">MISSION DIRECTORY</h2>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Available operations in the sector</p>
            </div>
        </div>
        <div className="flex bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800 shadow-xl overflow-x-auto w-full md:w-auto">
          {['ALL', MatchType.SOLO, MatchType.DUO, MatchType.SQUAD].map((t) => (
            <button key={t} onClick={() => setFilter(t as any)} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex-shrink-0 ${filter === t ? 'bg-red-600 text-white shadow-lg neon-red' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {(filter === 'ALL' ? matches : matches.filter(m => m.type === filter)).map(match => (
          <MatchCard key={match.id} match={match} user={user} />
        ))}
        {matches.length === 0 && (
          <div className="col-span-full py-32 text-center bg-zinc-950/20 rounded-[3rem] border border-zinc-900 border-dashed">
            <p className="text-zinc-700 font-black uppercase tracking-[0.5em] italic animate-pulse">Scanning for active signals... No ops found.</p>
          </div>
        )}
      </div>

      {/* POPUP NOTICE */}
      {showPopup && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#0A0A0A] border border-zinc-800 w-full max-w-lg rounded-[3rem] p-12 text-center space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600"></div>
            <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-600/30 group-hover:scale-110 transition-transform duration-500 shadow-xl">
              <span className="text-5xl">📡</span>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-gaming font-black italic uppercase text-red-600 tracking-tighter">SQUAD INTEL</h2>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]">High Priority Broadcast</p>
            </div>
            <div className="p-8 bg-zinc-950 rounded-[2rem] border border-zinc-900 shadow-inner">
                <p className="text-zinc-300 font-black italic uppercase leading-relaxed tracking-wider text-sm">{settings.popupNotice}</p>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl neon-red transform active:scale-95 transition-all"
            >
              ACKNOWLEDGE INTEL
            </button>
          </div>
        </div>
      )}

      {/* ADMIN GATE */}
      {showAdminGate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 p-8">
          <div className="w-full max-sm space-y-10 text-center">
            <div className="w-24 h-24 bg-red-600/10 border border-red-600/20 rounded-[2rem] flex items-center justify-center mx-auto transform rotate-12 shadow-2xl">
                <span className="text-red-600 text-5xl font-black -rotate-12 italic">STB</span>
            </div>
            <div className="space-y-2">
                <h2 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.8em]">Command Uplink</h2>
                <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest">Authorized Access Only</p>
            </div>
            <form onSubmit={handleAdminAuth} className="space-y-10">
              <input 
                type="password" autoFocus value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="••••••"
                className={`w-full bg-transparent border-b-2 ${gateError ? 'border-red-600 animate-shake' : 'border-zinc-900'} py-6 text-center text-5xl tracking-[0.8em] focus:outline-none focus:border-red-600 transition-all text-white font-mono placeholder:text-zinc-900`}
              />
              <div className="flex flex-col space-y-4">
                  <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.4em] neon-red shadow-2xl transform active:scale-95">ESTABLISH UPLINK</button>
                  <button type="button" onClick={() => setShowAdminGate(false)} className="text-[10px] text-zinc-700 font-black uppercase tracking-widest hover:text-zinc-500 transition-colors">TERMINATE SESSION</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-32 py-16 border-t border-zinc-950 text-center opacity-30">
        <p className="text-zinc-800 text-[10px] uppercase font-black tracking-[0.8em] select-none">
          © 2025 <span onClick={handleSecretTrigger} className="cursor-pointer hover:text-red-900 transition-colors">STB COMMAND</span> • BUILT FOR BATTLE
        </p>
      </footer>
    </div>
  );
}
