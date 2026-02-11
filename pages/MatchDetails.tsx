
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, User, TransactionStatus, Transaction } from '../types';
import { db } from '../services/db';

export default function MatchDetails({ user }: { user: User | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentTxId, setPaymentTxId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const settings = db.getSettings();

  useEffect(() => {
    const updateMatch = () => {
      const data = db.getMatches().find(m => m.id === id);
      if (data) setMatch(data);
      setLoading(false);
    };
    updateMatch();
    window.addEventListener('storage_update', updateMatch);
    return () => window.removeEventListener('storage_update', updateMatch);
  }, [id]);

  if (loading || !match) return <div className="p-20 text-center text-zinc-500 italic">Loading tactical data...</div>;

  const isJoined = user ? match.joinedSlots.includes(user.id) : false;
  const isFull = match.joinedSlots.length >= match.totalSlots;
  const totalBalance = user ? (user.depositBalance || 0) + (user.winningBalance || 0) : 0;
  const hasBalance = user ? totalBalance >= match.entryFee : false;

  const getPaymentNumber = () => {
    if (paymentMethod === 'bKash') return settings.bkashNumber;
    if (paymentMethod === 'Nagad') return settings.nagadNumber;
    return settings.rocketNumber;
  };

  const handleJoinWithBalance = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isJoined || !hasBalance) return;
    setJoining(true);
    await new Promise(r => setTimeout(r, 800));
    
    const updatedMatch = { ...match };
    updatedMatch.joinedSlots.push(user.id);
    db.updateMatch(updatedMatch);
    
    const updatedUser = { ...user };
    if (updatedUser.depositBalance >= match.entryFee) {
      updatedUser.depositBalance -= match.entryFee;
    } else {
      const remaining = match.entryFee - updatedUser.depositBalance;
      updatedUser.depositBalance = 0;
      updatedUser.winningBalance -= remaining;
    }
    db.saveCurrentUser(updatedUser);
    
    setMessage({ type: 'success', text: 'Match Registration Successful!' });
    setJoining(false);
  };

  const handleDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!paymentTxId) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userNumericId: user.numericId,
      amount: match.entryFee,
      method: paymentMethod,
      targetAccount: 'STB-UPLINK',
      transactionId: paymentTxId,
      type: 'Match_Join_Payment',
      matchId: match.id,
      matchTitle: match.title,
      status: TransactionStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    
    db.addTransaction(newTx);
    setShowPayModal(false);
    setPaymentTxId('');
    setMessage({ type: 'info', text: 'Payment submitted! You will be joined once verified.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4 md:px-0 animate-in fade-in duration-700">
      {/* SUCCESS/ERROR MESSAGE */}
      {message && (
        <div className={`p-6 rounded-3xl border ${message.type === 'success' ? 'bg-green-600/10 border-green-600/30 text-green-500' : 'bg-blue-600/10 border-blue-600/30 text-blue-400'} text-xs font-black uppercase tracking-[0.2em] animate-pulse flex items-center justify-between`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xl">&times;</button>
        </div>
      )}

      {/* HEADER IMAGE */}
      <div className="relative h-72 md:h-96 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
        <img src={match.imageUrl || `https://picsum.photos/seed/${match.id}/1200/800`} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 right-10">
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-4 py-1.5 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg neon-red">{match.type}</span>
                <span className="px-4 py-1.5 bg-zinc-800/80 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest">{match.version}</span>
                {match.isPointSystem && <span className="px-4 py-1.5 bg-yellow-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">POINT SYSTEM</span>}
            </div>
            <h1 className="text-4xl md:text-6xl font-gaming font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{match.title}</h1>
        </div>
      </div>

      {/* ROOM CREDENTIALS (ONLY FOR JOINED USERS) */}
      {isJoined && match.roomId && (
        <div className="bg-gradient-to-br from-yellow-600/20 via-black to-black border-2 border-yellow-500/50 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden animate-in slide-in-from-top duration-700">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <span className="text-9xl">🔑</span>
            </div>
            <div className="relative z-10 space-y-6">
                <div>
                   <h2 className="text-yellow-500 font-gaming font-black text-2xl uppercase italic tracking-widest mb-1">Tactical Room Access</h2>
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Authorized deployment credentials active</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 text-center group hover:border-yellow-500/50 transition-all">
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">ROOM ID</p>
                      <p className="text-4xl font-black font-mono text-white tracking-[0.2em] group-active:scale-95 transition-transform select-all">{match.roomId}</p>
                   </div>
                   <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 text-center group hover:border-yellow-500/50 transition-all">
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">ROOM PASSWORD</p>
                      <p className="text-4xl font-black font-mono text-yellow-500 tracking-[0.2em] group-active:scale-95 transition-transform select-all">{match.roomPass}</p>
                   </div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-center">
                   <p className="text-[9px] text-yellow-600 font-black uppercase tracking-[0.2em]">⚠️ Do not share these credentials. Violation results in a permanent ban.</p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-10">
            <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl">
                <h3 className="text-xl font-black mb-8 flex items-center font-gaming italic uppercase tracking-widest text-white">
                    <span className="w-1.5 h-6 bg-red-600 mr-4 rounded-full"></span>
                    Match Briefing
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Map', value: match.map },
                        { label: 'Date', value: new Date(match.startTime).toLocaleDateString() },
                        { label: 'Time', value: new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                        { label: 'Slots', value: match.totalSlots }
                    ].map((item, i) => (
                        <div key={i} className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-900 text-center hover:border-zinc-700 transition-colors">
                            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-2">{item.label}</p>
                            <p className="font-black text-sm uppercase italic text-zinc-100">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center py-6 border-b border-zinc-900">
                      <span className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.3em]">Win Prize</span>
                      <span className="text-4xl font-black font-gaming italic text-yellow-500">৳{match.prizePool}</span>
                   </div>
                   <div className="flex justify-between items-center py-6 border-b border-zinc-900">
                      <div>
                        <span className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.3em] block">
                            {match.isPointSystem ? 'Kill Points' : 'Per Kill'}
                        </span>
                        {match.isPointSystem && (
                            <span className="text-red-600/80 font-black italic text-lg uppercase mt-2 block">
                                Total Matches: {match.totalMatchesCount || 1}
                            </span>
                        )}
                      </div>
                      <span className="text-4xl font-black font-gaming italic text-red-600">
                        {match.isPointSystem ? `${match.pointsPerKill} PTS` : `৳${match.prizePerKill}`}
                      </span>
                   </div>
                </div>

                {match.isPointSystem && match.positionPoints && (
                  <div className="mt-10 p-8 bg-zinc-950/30 rounded-3xl border border-zinc-900">
                    <h4 className="text-[10px] font-black text-yellow-500 uppercase mb-6 tracking-[0.4em] italic">Position Points (PMPL Standard)</h4>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs">
                        {Object.entries(match.positionPoints).sort(([a], [b]) => Number(a) - Number(b)).map(([rank, pts]) => (
                          <div key={rank} className="flex justify-between border-b border-zinc-900/50 pb-2">
                             <span className="text-zinc-500 font-bold uppercase">{rank}{Number(rank) === 1 ? 'st' : Number(rank) === 2 ? 'nd' : Number(rank) === 3 ? 'rd' : 'th'} Place</span>
                             <span className="text-white font-black">{pts} PTS</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl">
                <h3 className="text-xl font-black mb-8 flex items-center font-gaming italic uppercase tracking-widest text-white">
                   <span className="w-1.5 h-6 bg-yellow-500 mr-4 rounded-full"></span>
                   Battle Rules
                </h3>
                <ul className="grid grid-cols-1 gap-4">
                    {(match.rules && match.rules.length > 0 ? match.rules : settings.globalRules).map((rule, i) => (
                        <li key={i} className="flex items-start space-x-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all group">
                            <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 group-hover:scale-125 transition-transform shadow-[0_0_100px_rgba(239,68,68,0.5)]"></span>
                            <span className="text-zinc-400 text-xs font-bold leading-relaxed uppercase tracking-wide">{rule}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-zinc-900 sticky top-28 shadow-2xl">
                <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.4em] italic text-zinc-500">Combat Registration</h3>
                <div className="space-y-5 mb-10">
                    <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Entry Fee</span>
                        <span className="font-black text-xl text-white italic">৳{match.entryFee}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Availability</span>
                        <span className="font-black text-zinc-300 italic">{match.joinedSlots.length} / {match.totalSlots}</span>
                    </div>
                    {user && (
                      <div className="flex justify-between items-center py-3">
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Your Assets</span>
                          <span className={`font-black text-xl italic ${hasBalance ? 'text-green-500' : 'text-red-500'}`}>৳{totalBalance}</span>
                      </div>
                    )}
                </div>

                {!isJoined && !isFull && (
                  <div className="space-y-4">
                    <button
                        disabled={joining || (user ? !hasBalance : false)}
                        onClick={handleJoinWithBalance}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all ${
                          (user && hasBalance) || !user 
                          ? 'bg-red-600 hover:bg-red-500 text-white neon-red transform active:scale-95' 
                          : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                        }`}
                    >
                        {!user ? 'LOGIN TO JOIN' : (joining ? 'UPLINKING...' : `JOIN WITH WALLET`)}
                    </button>
                    
                    {user && !hasBalance && (
                      <button
                          onClick={() => setShowPayModal(true)}
                          className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-yellow-400 transition-all active:scale-95"
                      >
                          DIRECT PAYMENT JOIN
                      </button>
                    )}
                  </div>
                )}

                {isFull && !isJoined && (
                  <div className="text-center py-6 bg-zinc-900/50 rounded-2xl text-zinc-700 text-[10px] font-black uppercase tracking-widest italic border border-zinc-900">Mission Max Capacity</div>
                )}

                {isJoined && (
                  <div className="text-center py-6 bg-green-600/10 border border-green-600/30 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-[0.3em] italic animate-pulse">Citizen Authorized ✓</div>
                )}
            </div>
        </div>
      </div>

      {showPayModal && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
          <div className="w-full max-sm bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <h2 className="text-2xl font-black font-gaming italic text-red-600 uppercase tracking-tighter">Direct Uplink</h2>
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-3">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Operational Number</p>
                <p className="text-2xl font-black font-mono text-yellow-500 tracking-[0.2em]">{getPaymentNumber()}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pt-2">Required: ৳{match.entryFee}</p>
            </div>

            <form onSubmit={handleDirectPayment} className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                  <button 
                    key={m} type="button" onClick={() => setPaymentMethod(m)}
                    className={`py-3 rounded-xl text-[9px] font-black border transition-all tracking-widest uppercase ${paymentMethod === m ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-black border-zinc-800 text-zinc-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input 
                type="text" required value={paymentTxId} onChange={e => setPaymentTxId(e.target.value)} placeholder="TRANSACTION TXID"
                className="w-full bg-black border border-zinc-800 p-5 rounded-2xl focus:border-red-600 focus:outline-none font-mono text-xs tracking-[0.4em] uppercase text-white"
              />
              <div className="flex flex-col space-y-4 pt-4">
                <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] neon-red shadow-2xl transition-all">SUBMIT CREDENTIALS</button>
                <button type="button" onClick={() => setShowPayModal(false)} className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em] hover:text-white transition-colors">TERMINATE UPLINK</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
