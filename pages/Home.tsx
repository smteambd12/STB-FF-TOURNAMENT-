
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
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-red-500/30 transition-all duration-500 group shadow-2xl premium-card">
      <div className="relative h-48 md:h-56">
        <img src={match.imageUrl || defaultImg} alt={match.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700" />
        <div className="absolute top-4 left-4 flex space-x-2">
            <span className="px-3 py-1 bg-red-600 text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">{match.type}</span>
            <span className="px-3 py-1 bg-zinc-900/90 text-[8px] font-black rounded-full uppercase tracking-widest border border-zinc-800 shadow-lg">{match.map}</span>
        </div>
        {match.isPointSystem && (
          <div className="absolute top-4 right-4">
             <span className="px-3 py-1 bg-yellow-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg neon-yellow">POINTS</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent">
            <h3 className="text-xl md:text-2xl font-black font-gaming uppercase italic text-white tracking-tighter line-clamp-1">{match.title}</h3>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 italic">
              {match.version} • {match.type} BATTLE
            </p>
        </div>
      </div>
      <div className="p-5 md:p-6 space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <p className="text-[7px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">Win Pool</p>
                <p className="text-sm font-black text-yellow-500 italic">৳{match.prizePool}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <p className="text-[7px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">
                  {match.isPointSystem ? 'Bounty' : 'Per Kill'}
                </p>
                <p className="text-sm font-black text-red-500 italic">
                  {match.isPointSystem ? `${match.pointsPerKill}P` : `৳${match.prizePerKill}`}
                </p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <p className="text-[7px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">Entry</p>
                <p className="text-sm font-black text-white italic">৳{match.entryFee}</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase">
                <span className="text-zinc-600 italic tracking-widest">DEPLOYMENT STATUS</span>
                <span className="text-zinc-400">{match.joinedSlots.length} / {match.totalSlots}</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${(match.joinedSlots.length / match.totalSlots) * 100}%` }}></div>
            </div>
        </div>

        <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Starts</span>
                <span className="text-[10px] font-bold text-zinc-400 italic">{new Date(match.startTime).toLocaleDateString()}</span>
            </div>
            <Link 
                to={`/match/${match.id}`} 
                onClick={handleJoinClick}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 ${isFull ? 'bg-zinc-800 text-zinc-600' : 'bg-red-600 text-white neon-red shadow-lg hover:bg-red-500'}`}
            >
                {isFull ? 'SECTOR FULL' : 'JOIN OPS'}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home({ user }: { user: User | null }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<MatchType | 'ALL'>('ALL');
  const [settings, setSettings] = useState(db.getSettings());
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateData = () => {
      setMatches(db.getMatches().filter(m => !m.isCompleted));
      const s = db.getSettings();
      setSettings(s);
      
      if (s.isPopupActive && !sessionStorage.getItem('popup_shown')) {
        setTimeout(() => setShowPopup(true), 1200);
        sessionStorage.setItem('popup_shown', 'true');
      }
    };
    updateData();
    window.addEventListener('storage_update', updateData);
    return () => window.removeEventListener('storage_update', updateData);
  }, []);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
      {settings.notice && (
        <div className="bg-red-600/5 border-y border-red-600/10 py-3 md:py-4 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block font-black text-red-600 text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em]">
                {settings.notice} • {settings.notice} • {settings.notice}
            </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] h-[18rem] md:h-[22rem] bg-zinc-950 flex items-center p-8 md:p-12 border border-zinc-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-[#050505]"></div>
        </div>
        <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6">
            <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">SECTOR ALPHA: ACTIVE</div>
            <h1 className="text-4xl md:text-6xl font-gaming font-black italic text-white uppercase leading-none tracking-tighter">
                <span className="text-red-600">STB ELITE</span><br/>TOURNAMENT
            </h1>
            <p className="text-zinc-500 font-bold max-w-md leading-relaxed text-[10px] md:text-xs uppercase tracking-wider">Join Bangladesh's most exclusive Free Fire circuit. High stakes, real rewards, legendary status.</p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div className="flex items-center space-x-4">
            <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-lg"></div>
            <div>
                <h2 className="text-2xl font-black font-gaming italic uppercase text-white tracking-tight">MISSION HQ</h2>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Active operations in sector</p>
            </div>
        </div>
        <div className="flex bg-zinc-900/40 p-1 rounded-xl border border-zinc-800 shadow-xl overflow-x-auto w-full md:w-auto scrollbar-hide">
          {['ALL', MatchType.SOLO, MatchType.DUO, MatchType.SQUAD].map((t) => (
            <button key={t} onClick={() => setFilter(t as any)} className={`px-5 py-2.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest flex-shrink-0 ${filter === t ? 'bg-red-600 text-white shadow-lg neon-red' : 'text-zinc-600 hover:text-zinc-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
        {(filter === 'ALL' ? matches : matches.filter(m => m.type === filter)).map(match => (
          <MatchCard key={match.id} match={match} user={user} />
        ))}
        {matches.length === 0 && (
          <div className="col-span-full py-24 text-center bg-zinc-950/20 rounded-[2.5rem] border border-zinc-900 border-dashed">
            <p className="text-zinc-700 font-black uppercase tracking-[0.4em] italic text-[10px] animate-pulse">Scanning frequencies... No active ops found.</p>
          </div>
        )}
      </div>

      {/* POPUP NOTICE */}
      {showPopup && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto border border-red-600/20 shadow-inner">
              <span className="text-4xl">📡</span>
            </div>
            <div className="space-y-1">
                <h2 className="text-2xl font-gaming font-black italic uppercase text-red-600 tracking-tight">SQUAD INTEL</h2>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">High Priority Message</p>
            </div>
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900">
                <p className="text-zinc-300 font-bold italic uppercase leading-relaxed tracking-wider text-[11px]">{settings.popupNotice}</p>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl neon-red transform active:scale-95 transition-all"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      <footer className="mt-20 py-16 border-t border-zinc-900 text-center bg-zinc-950/20">
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex justify-center items-center space-x-2">
                <div className="w-10 h-1 bg-red-600/30 rounded-full"></div>
                <h3 className="text-sm font-black font-gaming italic uppercase text-zinc-500">STB LEGACY SYSTEMS</h3>
                <div className="w-10 h-1 bg-red-600/30 rounded-full"></div>
            </div>
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] px-8 leading-relaxed">The ultimate platform for strategic Free Fire combatants in Bangladesh.</p>
            <div className="flex justify-center space-x-6">
                <Link to="/admin-login" className="text-zinc-800 hover:text-red-600 transition-colors text-[9px] font-black uppercase tracking-widest border border-zinc-900 px-4 py-2 rounded-lg hover:border-red-600/30">ADMIN PORTAL</Link>
                <Link to="/leaderboard" className="text-zinc-800 hover:text-yellow-600 transition-colors text-[9px] font-black uppercase tracking-widest border border-zinc-900 px-4 py-2 rounded-lg hover:border-yellow-600/30">HALL OF FAME</Link>
            </div>
            <p className="text-zinc-900 text-[8px] uppercase font-black tracking-[0.5em] pt-10">
              © 2025 STB SYSTEM • EXCELLENCE IN COMBAT
            </p>
        </div>
      </footer>
    </div>
  );
}
