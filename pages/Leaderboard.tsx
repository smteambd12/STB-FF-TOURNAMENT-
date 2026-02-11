
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User } from '../types';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [settings, setSettings] = useState(db.getSettings());

  useEffect(() => {
    const update = () => {
      const users = db.getUsers();
      // Sort by total earnings, then total kills
      const sorted = [...users].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0) || (b.totalKills || 0) - (a.totalKills || 0));
      setLeaders(sorted);
      setSettings(db.getSettings());
    };
    update();
    window.addEventListener('storage_update', update);
    return () => window.removeEventListener('storage_update', update);
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
        <div className="text-center space-y-3">
            <h1 className="text-5xl font-gaming font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 tracking-tighter">
                {settings.leaderboardTitle || 'HALL OF FAME'}
            </h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.6em] italic">{settings.leaderboardSubtitle || 'The elite legends of STB battlefield.'}</p>
        </div>

        {leaders.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10 px-4">
                {/* 2nd Place */}
                {top3[1] && (
                    <div className="order-2 md:order-1 bg-[#0A0A0A] border border-zinc-900 border-t-4 border-t-zinc-400 p-8 rounded-[2.5rem] text-center transform hover:-translate-y-2 transition-all relative shadow-2xl">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-zinc-400 rounded-2xl flex items-center justify-center font-black text-white shadow-xl border-4 border-zinc-600 italic text-xl">2</div>
                        <div className="w-24 h-24 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-4 border-[#0A0A0A] shadow-inner font-black italic text-white">
                            {top3[1].name[0].toUpperCase()}
                        </div>
                        <h3 className="text-xl font-black font-gaming uppercase italic text-white mb-1 truncate">{top3[1].name}</h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6">{top3[1].totalKills || 0} COMBAT KILLS</p>
                        <div className="bg-zinc-950/50 py-3 rounded-2xl font-black text-zinc-400 border border-zinc-900">৳{top3[1].totalEarnings || 0}</div>
                    </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                    <div className="order-1 md:order-2 bg-[#0A0A0A] border border-zinc-900 border-t-4 border-t-yellow-500 p-10 rounded-[3rem] text-center shadow-[0_0_100px_rgba(234,179,8,0.05)] transform hover:-translate-y-4 transition-all relative scale-105 border-x border-b">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-18 h-18 bg-yellow-500 rounded-2xl flex items-center justify-center font-black text-black shadow-2xl border-4 border-yellow-600 text-2xl italic">1</div>
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl border-8 border-[#0A0A0A] shadow-2xl font-black italic text-white animate-pulse">
                            {top3[0].name[0].toUpperCase()}
                        </div>
                        <h3 className="text-3xl font-black font-gaming italic mb-1 uppercase tracking-tighter text-white">{top3[0].name}</h3>
                        <p className="text-yellow-500 text-[11px] font-black uppercase tracking-[0.3em] mb-8">{top3[0].totalKills || 0} ELITE KILLS</p>
                        <div className="bg-yellow-500 py-4 rounded-2xl font-black text-black text-2xl italic shadow-2xl neon-yellow">৳{top3[0].totalEarnings || 0}</div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="order-3 bg-[#0A0A0A] border border-zinc-900 border-t-4 border-t-orange-700 p-8 rounded-[2.5rem] text-center transform hover:-translate-y-2 transition-all relative shadow-2xl">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-orange-700 rounded-2xl flex items-center justify-center font-black text-white shadow-xl border-4 border-orange-900 italic text-xl">3</div>
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-800 to-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-4 border-[#0A0A0A] shadow-inner font-black italic text-white">
                            {top3[2].name[0].toUpperCase()}
                        </div>
                        <h3 className="text-xl font-black font-gaming uppercase italic text-white mb-1 truncate">{top3[2].name}</h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6">{top3[2].totalKills || 0} COMBAT KILLS</p>
                        <div className="bg-zinc-950/50 py-3 rounded-2xl font-black text-zinc-400 border border-zinc-900">৳{top3[2].totalEarnings || 0}</div>
                    </div>
                )}
            </div>

            <div className="bg-[#0A0A0A] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-6 p-6 text-[9px] uppercase font-black text-zinc-600 bg-zinc-950/50 border-b border-zinc-900 tracking-[0.2em]">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-3">War Designation</div>
                    <div className="col-span-1 text-center">Kills</div>
                    <div className="col-span-1 text-center">Earnings</div>
                </div>
                <div className="divide-y divide-zinc-900">
                    {rest.map((leader, i) => (
                        <div key={leader.id} className="grid grid-cols-6 p-6 items-center hover:bg-zinc-800/10 transition-colors group">
                            <div className="col-span-1 text-center font-gaming font-black text-xl italic text-zinc-500 group-hover:text-white transition-colors">#{i + 4}</div>
                            <div className="col-span-3 flex items-center space-x-5">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black italic text-xs text-white uppercase">{leader.name[0]}</div>
                                <span className="font-black text-sm uppercase italic text-white tracking-wide">{leader.name}</span>
                            </div>
                            <div className="col-span-1 text-center text-zinc-500 font-black italic">{leader.totalKills || 0}</div>
                            <div className="col-span-1 text-center font-black text-yellow-500 italic text-lg">৳{leader.totalEarnings || 0}</div>
                        </div>
                    ))}
                    {rest.length === 0 && leaders.length <= 3 && (
                        <div className="text-center py-10 text-zinc-800 font-black uppercase text-[10px] tracking-widest italic">No more citizens ranked.</div>
                    )}
                </div>
            </div>
          </>
        ) : (
          <div className="py-40 text-center bg-[#0A0A0A] rounded-[3rem] border border-zinc-900 border-dashed">
              <p className="text-zinc-700 font-black uppercase tracking-[0.6em] animate-pulse">Scanning for legends... No combat data found.</p>
          </div>
        )}
    </div>
  );
}
