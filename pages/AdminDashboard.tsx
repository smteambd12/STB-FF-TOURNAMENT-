
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { User, Match, Transaction, TransactionStatus, SiteSettings } from '../types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());
  const [saveStatus, setSaveStatus] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => {
      setUsers(db.getUsers());
      setMatches(db.getMatches());
      setTransactions(db.getTransactions());
      setSettings(db.getSettings());
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, []);

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(settings);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const pendingPayments = transactions.filter(t => t.status === TransactionStatus.PENDING).length;
  const activeMatches = matches.filter(m => !m.isCompleted);
  const fullMatches = activeMatches.filter(m => m.joinedSlots.length >= m.totalSlots);
  const totalUsersCount = users.length;
  const totalRevenue = transactions
    .filter(t => t.status === TransactionStatus.COMPLETED && (t.type === 'Deposit' || t.type === 'Match_Join_Payment'))
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.numericId.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {fullMatches.length > 0 && (
        <div className="flex flex-col space-y-3">
          {fullMatches.map(m => (
            <div key={m.id} className="bg-red-600 text-white p-6 rounded-2xl flex items-center justify-between shadow-2xl animate-pulse">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-widest italic">MISSION CAPACITY REACHED</h4>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{m.title} is now full ({m.joinedSlots.length}/{m.totalSlots})</p>
                  </div>
                </div>
                <Link to="/admin/matches" className="px-5 py-2 bg-white text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">MANAGE OPS</Link>
            </div>
          ))}
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-8 border-b border-zinc-900 pb-10">
        <div className="space-y-1">
          <h1 className="text-5xl font-gaming font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-red-600">
              COMMAND CENTER
          </h1>
          <div className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em]">Strategic Control: Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={() => setShowUsers(true)} className="bg-zinc-900/50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800 text-zinc-400">User Intelligence</button>
            <Link to="/" className="bg-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl neon-red">Live Site</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl">
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">TOTAL USERS</p>
                  <h3 className="text-4xl font-black font-gaming italic text-white">{totalUsersCount}</h3>
               </div>
               <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl">
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">TOTAL FUND</p>
                  <h3 className="text-4xl font-black font-gaming italic text-green-500">৳{totalRevenue.toLocaleString()}</h3>
               </div>
            </div>

            <div className="bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
                <h3 className="text-[11px] font-black mb-10 uppercase flex items-center italic tracking-[0.3em] text-zinc-500">
                    <span className="w-1.5 h-6 bg-blue-600 mr-4 rounded-full"></span>
                    Strategic Portals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/admin/matches" className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center hover:border-red-600/50 transition-all group shadow-lg">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">⚔️</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Mission Manager</span>
                    </Link>
                    <Link to="/admin/payments" className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center hover:border-yellow-500/50 transition-all group shadow-lg">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">💳</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Finance Unit</span>
                    </Link>
                    <button onClick={() => setShowUsers(true)} className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center hover:border-green-600/50 transition-all group shadow-lg">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">👤</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Citizen Registry</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
            <h3 className="text-[11px] font-black mb-8 uppercase flex items-center italic tracking-[0.3em] text-zinc-500">
                <span className="w-1.5 h-6 bg-yellow-500 mr-4 rounded-full"></span>
                System Override
            </h3>
            <form onSubmit={handleUpdateSettings} className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[9px] text-zinc-600 uppercase font-black px-2 tracking-widest italic">Global Notice Board</label>
                    <textarea value={settings.notice} onChange={e => setSettings({...settings, notice: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-[10px] focus:border-red-600 focus:outline-none transition-all h-24 font-bold text-zinc-400 leading-relaxed uppercase" />
                </div>

                <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-4">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest italic">Gateway Protocols</p>
                  <div className="space-y-3">
                    <input type="text" value={settings.bkashNumber} onChange={e => setSettings({...settings, bkashNumber: e.target.value})} placeholder="bKash Number" className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-mono tracking-widest text-red-500" />
                    <input type="text" value={settings.nagadNumber} onChange={e => setSettings({...settings, nagadNumber: e.target.value})} placeholder="Nagad Number" className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-mono tracking-widest text-orange-500" />
                    <input type="text" value={settings.rocketNumber} onChange={e => setSettings({...settings, rocketNumber: e.target.value})} placeholder="Rocket Number" className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-mono tracking-widest text-blue-500" />
                  </div>
                  <div className="pt-4 border-t border-zinc-900">
                      <label className="text-[8px] text-zinc-600 font-black uppercase mb-1 block">Payment Instructions</label>
                      <textarea value={settings.paymentInstructions} onChange={e => setSettings({...settings, paymentInstructions: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-[9px] font-bold text-zinc-500 italic h-20" />
                  </div>
                </div>

                <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-white italic tracking-widest">Extraction Port</span>
                      <button type="button" onClick={() => setSettings({...settings, isWithdrawEnabled: !settings.isWithdrawEnabled})} className={`w-14 h-7 rounded-full transition-all relative ${settings.isWithdrawEnabled ? 'bg-green-600' : 'bg-zinc-800'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.isWithdrawEnabled ? 'right-1' : 'left-1'}`}></div>
                      </button>
                  </div>
                  <input type="number" value={settings.minWithdrawAmount} onChange={e => setSettings({...settings, minWithdrawAmount: Number(e.target.value)})} className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-sm font-black italic text-yellow-500" />
                </div>

                <button type="submit" className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 transform">
                    {saveStatus ? 'UPLINK SYNCED ✓' : 'SYNC CONFIGURATION'}
                </button>
            </form>
        </div>
      </div>

      {/* CITIZEN REGISTRY MODAL */}
      {showUsers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-[#0A0A0A] border border-zinc-800 w-full max-w-5xl rounded-[2.5rem] p-12 space-y-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-8">
              <div>
                  <h2 className="text-3xl font-gaming font-black italic uppercase text-blue-500 tracking-tighter">Citizen Intelligence Agency</h2>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Classified Combatants Database</p>
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH BY NAME OR #ID..." className="w-64 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 text-white" />
                  <button onClick={() => setShowUsers(false)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-full text-zinc-500 text-3xl hover:text-white transition-all">&times;</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-zinc-600 border-b border-zinc-900">
                    <th className="p-6 tracking-widest">Callsign & ID</th>
                    <th className="p-6 tracking-widest">Winners Port</th>
                    <th className="p-6 tracking-widest">Resource Port</th>
                    <th className="p-6 tracking-widest">War Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="group hover:bg-zinc-800/10 transition-all">
                      <td className="p-6">
                          <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black italic text-blue-500 text-lg shadow-inner">{u.name[0].toUpperCase()}</div>
                              <div>
                                <p className="font-black text-sm uppercase italic text-white tracking-wide">{u.name}</p>
                                <p className="text-[9px] text-zinc-600 font-mono">#{u.numericId}</p>
                              </div>
                          </div>
                      </td>
                      <td className="p-6 font-black text-xl italic text-green-500">৳{u.winningBalance || 0}</td>
                      <td className="p-6 font-black text-xl italic text-white">৳{u.depositBalance || 0}</td>
                      <td className="p-6">
                          <div className="flex items-center space-x-8">
                              <div>
                                  <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Kills</p>
                                  <p className="font-black text-red-500 italic text-lg">{u.totalKills || 0}</p>
                              </div>
                              <div>
                                  <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Matched</p>
                                  <p className="font-black text-white italic text-lg">{u.totalMatchesJoined || 0}</p>
                              </div>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
