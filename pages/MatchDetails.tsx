
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

  if (loading || !match) return <div className="p-20 text-center text-zinc-500 italic font-gaming animate-pulse">Establishing Comms...</div>;

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
    
    setMessage({ type: 'success', text: 'Tactical Uplink Successful!' });
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
      targetAccount: 'STB-HQ',
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
    setMessage({ type: 'info', text: 'Uplink Received. Waiting for HQ Verification.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32 px-4 md:px-0 animate-in fade-in duration-700">
      {message && (
        <div className={`p-5 rounded-2xl border ${message.type === 'success' ? 'bg-green-600/10 border-green-600/20 text-green-500' : 'bg-blue-600/10 border-blue-600/20 text-blue-400'} text-[10px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center justify-between`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xl px-2">&times;</button>
        </div>
      )}

      {/* HEADER HERO */}
      <div className="relative h-64 md:h-96 rounded-[2.5rem] overflow-hidden border border-zinc-900 shadow-2xl">
        <img src={match.imageUrl || `https://picsum.photos/seed/${match.id}/1200/800`} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8">
            <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-red-600 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg neon-red">{match.type}</span>
                <span className="px-3 py-1 bg-zinc-800/90 backdrop-blur rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">{match.version}</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-gaming font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{match.title}</h1>
        </div>
      </div>

      {/* TACTICAL ROOM ACCESS */}
      {isJoined && match.roomId && (
        <div className="bg-gradient-to-br from-yellow-600/10 via-black to-black border border-yellow-500/30 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
                <div className="text-center md:text-left">
                   <h2 className="text-yellow-500 font-gaming font-black text-xl md:text-2xl uppercase italic tracking-widest">TACTICAL ACCESS GRANTED</h2>
                   <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">Authorized Room Credentials</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 text-center hover:border-yellow-500/40 transition-all">
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">ROOM ID</p>
                      <p className="text-3xl font-black font-mono text-white tracking-widest">{match.roomId}</p>
                   </div>
                   <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 text-center hover:border-yellow-500/40 transition-all">
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">PASSWORD</p>
                      <p className="text-3xl font-black font-mono text-yellow-500 tracking-widest">{match.roomPass}</p>
                   </div>
                </div>
                <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-center">
                   <p className="text-[8px] text-yellow-700 font-black uppercase tracking-widest">⚠️ LEAKING CREDENTIALS WILL RESULT IN INSTANT BAN</p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-[2rem] border border-zinc-900 shadow-xl premium-card">
                <h3 className="text-lg font-black mb-6 flex items-center font-gaming italic uppercase tracking-widest text-white">
                    <span className="w-1.5 h-5 bg-red-600 mr-3 rounded-full"></span>
                    Operational Brief
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Map', value: match.map },
                        { label: 'Date', value: new Date(match.startTime).toLocaleDateString() },
                        { label: 'Time', value: new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                        { label: 'Slots', value: match.totalSlots }
                    ].map((item, i) => (
                        <div key={i} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-900 text-center">
                            <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">{item.label}</p>
                            <p className="font-black text-[10px] md:text-xs uppercase italic text-zinc-200">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center py-4 border-b border-zinc-900/50">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Win Pool</span>
                      <span className="text-2xl font-black font-gaming italic text-yellow-500">৳{match.prizePool}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-zinc-900/50">
                      <div>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">
                            {match.isPointSystem ? 'Kill Bounty' : 'Per Kill'}
                        </span>
                      </div>
                      <span className="text-2xl font-black font-gaming italic text-red-600">
                        {match.isPointSystem ? `${match.pointsPerKill} PTS` : `৳${match.prizePerKill}`}
                      </span>
                   </div>
                </div>

                {match.isPointSystem && match.positionPoints && (
                  <div className="mt-8 p-6 bg-zinc-950/30 rounded-2xl border border-zinc-900">
                    <h4 className="text-[9px] font-black text-yellow-500 uppercase mb-4 tracking-[0.3em] italic">Placement Points</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[10px]">
                        {Object.entries(match.positionPoints).sort(([a], [b]) => Number(a) - Number(b)).slice(0, 10).map(([rank, pts]) => (
                          <div key={rank} className="flex justify-between border-b border-zinc-900/40 pb-1.5">
                             <span className="text-zinc-600 font-bold uppercase">{rank}# PLACE</span>
                             <span className="text-white font-black">{pts} PTS</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-[2rem] border border-zinc-900 shadow-xl premium-card">
                <h3 className="text-lg font-black mb-6 flex items-center font-gaming italic uppercase tracking-widest text-white">
                   <span className="w-1.5 h-5 bg-yellow-500 mr-3 rounded-full"></span>
                   Rules of Engagement
                </h3>
                <ul className="space-y-3">
                    {(match.rules && match.rules.length > 0 ? match.rules : settings.globalRules).map((rule, i) => (
                        <li key={i} className="flex items-start space-x-3 p-3 bg-zinc-950/30 rounded-xl border border-zinc-900/50">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 shadow-lg"></span>
                            <span className="text-zinc-400 text-[10px] font-bold leading-relaxed uppercase tracking-wide">{rule}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-[2rem] border border-zinc-900 lg:sticky lg:top-28 shadow-2xl premium-card">
                <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest italic text-zinc-500">Battle Authorization</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-zinc-900/50">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Entry Credits</span>
                        <span className="font-black text-lg text-white italic">৳{match.entryFee}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-zinc-900/50">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Slots Filled</span>
                        <span className="font-black text-zinc-300 italic">{match.joinedSlots.length} / {match.totalSlots}</span>
                    </div>
                    {user && (
                      <div className="flex justify-between items-center py-3">
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Wallet Assets</span>
                          <span className={`font-black text-lg italic ${hasBalance ? 'text-green-500' : 'text-red-500'}`}>৳{totalBalance}</span>
                      </div>
                    )}
                </div>

                {!isJoined && !isFull && (
                  <div className="space-y-3">
                    <button
                        disabled={joining || (user ? !hasBalance : false)}
                        onClick={handleJoinWithBalance}
                        className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all ${
                          (user && hasBalance) || !user 
                          ? 'bg-red-600 hover:bg-red-500 text-white neon-red transform active:scale-95' 
                          : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                        }`}
                    >
                        {!user ? 'SIGN IN TO JOIN' : (joining ? 'UPLINKING...' : `JOIN WITH WALLET`)}
                    </button>
                    
                    {user && !hasBalance && (
                      <button
                          onClick={() => setShowPayModal(true)}
                          className="w-full py-4 bg-yellow-500 text-black rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-yellow-400 transition-all"
                      >
                          DIRECT UPLINK (PAY)
                      </button>
                    )}
                  </div>
                )}

                {isFull && !isJoined && (
                  <div className="text-center py-4 bg-zinc-900/50 rounded-xl text-zinc-700 text-[10px] font-black uppercase tracking-widest italic border border-zinc-900/50">SECTOR FULL</div>
                )}

                {isJoined && (
                  <div className="text-center py-4 bg-green-600/5 border border-green-600/20 rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest italic animate-pulse">CITIZEN AUTHORIZED ✓</div>
                )}
            </div>
        </div>
      </div>

      {showPayModal && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black font-gaming italic text-red-600 uppercase">DIRECT UPLINK</h2>
                <button onClick={() => setShowPayModal(false)} className="text-zinc-600 text-3xl">&times;</button>
            </div>
            <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 text-center">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">{paymentMethod} Number</p>
                <p className="text-xl font-black font-mono text-yellow-500 tracking-widest">{getPaymentNumber()}</p>
            </div>

            <form onSubmit={handleDirectPayment} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                  <button 
                    key={m} type="button" onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-lg text-[8px] font-black border transition-all uppercase ${paymentMethod === m ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-black border-zinc-800 text-zinc-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input 
                type="text" required value={paymentTxId} onChange={e => setPaymentTxId(e.target.value)} placeholder="TRANSACTION ID"
                className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-red-600 focus:outline-none font-mono text-xs tracking-widest uppercase text-white"
              />
              <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl neon-red transition-all">SUBMIT REQUEST</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
