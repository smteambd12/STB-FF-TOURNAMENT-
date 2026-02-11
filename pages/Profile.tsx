
import React from 'react';
import { User } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function Profile({ user }: { user: User }) {
  const totalBalance = (user.depositBalance || 0) + (user.winningBalance || 0);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-[#0F0F0F] border border-zinc-800 rounded-[3rem] overflow-hidden relative shadow-2xl">
        <div className="h-48 bg-gradient-to-r from-red-600 via-red-900 to-zinc-950 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute -bottom-1 left-0 w-full h-24 bg-gradient-to-t from-[#0F0F0F] to-transparent"></div>
        </div>
        
        <div className="p-10 pt-0 -mt-20 relative flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-950 border-4 border-[#0F0F0F] flex items-center justify-center text-6xl shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-700 to-yellow-600 animate-pulse opacity-50"></div>
                <div className="relative z-10 font-black italic text-white drop-shadow-2xl">
                    {user.name[0].toUpperCase()}
                </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border-2 border-[#0F0F0F]">
                {user.totalEarnings > 5000 ? 'LEGEND' : 'ELITE'}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black font-gaming italic uppercase tracking-tighter text-white">{user.name}</h1>
            <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
                <span className="text-zinc-500 font-bold text-xs font-mono">UID: {user.id.substring(0, 12)}</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            </div>
          </div>
          
          <button 
            onClick={() => signOut(auth)}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl neon-red transition-all active:scale-95"
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <span className="text-8xl text-green-500">💰</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">Liquidity Profile</p>
              <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900">
                      <span className="text-zinc-400 text-xs font-bold uppercase">Winning Balance</span>
                      <span className="text-green-500 font-black text-xl italic">৳{user.winningBalance || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900">
                      <span className="text-zinc-400 text-xs font-bold uppercase">Deposit Assets</span>
                      <span className="text-white font-black text-xl italic">৳{user.depositBalance || 0}</span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Kills', value: user.totalKills, icon: '🎯', color: 'text-red-500' },
                { label: 'Matches', value: user.totalMatchesJoined, icon: '🎮', color: 'text-blue-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#0A0A0A] p-6 rounded-[2rem] border border-zinc-900 flex flex-col items-center justify-center text-center group hover:border-zinc-700 transition-all">
                   <span className="text-4xl mb-3 group-hover:rotate-12 transition-transform">{stat.icon}</span>
                   <p className="text-zinc-600 text-[9px] font-black uppercase mb-1 tracking-widest">{stat.label}</p>
                   <h3 className={`text-2xl font-black font-gaming italic ${stat.color}`}>{stat.value}</h3>
                </div>
              ))}
          </div>
      </div>

      <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800 space-y-8">
        <div className="flex items-center space-x-4">
            <div className="w-1 h-8 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-black font-gaming italic uppercase tracking-widest">Citizen Credentials</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 uppercase font-black px-2 tracking-widest">Email Uplink</label>
                <div className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs font-bold text-zinc-400 italic">
                    {user.email || 'N/A'}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 uppercase font-black px-2 tracking-widest">Comms Number</label>
                <div className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs font-bold text-zinc-400 italic">
                    {user.phone || 'NOT LINKED'}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
