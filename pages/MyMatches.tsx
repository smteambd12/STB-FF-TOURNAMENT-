
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match, User, MatchType } from '../types';
import { db } from '../services/db';

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const defaultImg = `https://picsum.photos/seed/${match.id}/600/400`;
  const hasCredentials = match.roomId && match.roomPass;
  
  return (
    <div className="bg-[#0F0F0F] border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-red-500/50 transition-all duration-500 group shadow-2xl">
      <div className="relative h-48">
        <img src={match.imageUrl || defaultImg} alt={match.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-700" />
        <div className="absolute top-4 left-4 flex space-x-2">
            <span className="px-3 py-1 bg-red-600 text-[8px] font-black rounded-full uppercase tracking-widest">{match.type}</span>
            {hasCredentials && (
              <span className="px-3 py-1 bg-yellow-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">CREDENTIALS LIVE</span>
            )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0F0F0F] to-transparent">
            <h3 className="text-xl font-black font-gaming uppercase italic text-white line-clamp-1">{match.title}</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{match.version}</p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 uppercase font-black">Deployment</span>
                <span className="text-xs font-bold text-zinc-400 italic">{new Date(match.startTime).toLocaleDateString()}</span>
            </div>
            <div className="text-right">
                <span className="text-[8px] text-zinc-600 uppercase font-black">Status</span>
                <span className={`text-xs block font-black uppercase italic ${match.isCompleted ? 'text-zinc-600' : 'text-green-500'}`}>
                   {match.isCompleted ? 'Finished' : 'Upcoming'}
                </span>
            </div>
        </div>
        <Link to={`/match/${match.id}`} className="w-full block py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-800">
            {hasCredentials ? 'VIEW ROOM ID & PASS' : 'VIEW MATCH INTEL'}
        </Link>
      </div>
    </div>
  );
};

export default function MyMatches({ user }: { user: User }) {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const update = () => {
      const allMatches = db.getMatches();
      const joined = allMatches.filter(m => m.joinedSlots.includes(user.id)).reverse();
      setMatches(joined);
    };
    update();
    window.addEventListener('storage_update', update);
    return () => window.removeEventListener('storage_update', update);
  }, [user.id]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center space-x-5 px-4">
        <div className="w-2 h-10 bg-yellow-500 rounded-full"></div>
        <div>
            <h2 className="text-3xl font-black font-gaming italic uppercase text-white tracking-tighter">MY MISSIONS</h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Operations your unit is deployed to</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {matches.map(m => (
          <MatchCard key={m.id} match={m} />
        ))}
        {matches.length === 0 && (
          <div className="col-span-full py-32 text-center bg-zinc-950/20 rounded-[3rem] border border-zinc-900 border-dashed">
            <p className="text-zinc-700 font-black uppercase tracking-[0.5em] italic">No active deployments. Ready up in the tournament HQ.</p>
            <Link to="/" className="inline-block mt-6 px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl neon-red">BROWSE TOURNAMENTS</Link>
          </div>
        )}
      </div>
    </div>
  );
}
