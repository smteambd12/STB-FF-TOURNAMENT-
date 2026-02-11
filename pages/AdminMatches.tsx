
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Match, MatchType, MatchMap, MatchVersion, User } from '../types';

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  const [selectedMatchForRoom, setSelectedMatchForRoom] = useState<Match | null>(null);
  const [selectedMatchForResults, setSelectedMatchForResults] = useState<Match | null>(null);
  const [selectedMatchForPlayers, setSelectedMatchForPlayers] = useState<Match | null>(null);
  
  const [roomId, setRoomId] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [resultsData, setResultsData] = useState<{ [userId: string]: { kills: number, earnings: number } }>({});

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MatchType>(MatchType.SOLO);
  const [map, setMap] = useState<MatchMap>(MatchMap.BERMUDA);
  const [version, setVersion] = useState<MatchVersion>(MatchVersion.MOBILE);
  const [entryFee, setEntryFee] = useState('50');
  const [prizePool, setPrizePool] = useState('1000'); 
  const [prizePerKill, setPrizePerKill] = useState('10');
  const [totalSlots, setTotalSlots] = useState('48');
  const [startTime, setStartTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPointSystem, setIsPointSystem] = useState(false);
  const [pointsPerKill, setPointsPerKill] = useState('1');
  const [totalMatchesCount, setTotalMatchesCount] = useState('1');
  const [matchRules, setMatchRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [posPoints, setPosPoints] = useState<{ [rank: number]: number }>({ 
    1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 
  });

  useEffect(() => {
    const load = () => {
      setMatches(db.getMatches().reverse());
      setUsers(db.getUsers());
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, []);

  const handleOpenEdit = (match: Match) => {
    setEditingMatch(match);
    setTitle(match.title);
    setType(match.type);
    setMap(match.map);
    setVersion(match.version);
    setEntryFee(match.entryFee.toString());
    setPrizePool(match.prizePool.toString());
    setPrizePerKill(match.prizePerKill.toString());
    setTotalSlots(match.totalSlots.toString());
    setStartTime(match.startTime.substring(0, 16));
    setImageUrl(match.imageUrl || '');
    setIsPointSystem(match.isPointSystem || false);
    setPointsPerKill(match.pointsPerKill?.toString() || '1');
    setTotalMatchesCount(match.totalMatchesCount?.toString() || '1');
    setMatchRules(match.rules || []);
    setPosPoints(match.positionPoints || { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 });
    setShowModal(true);
  };

  const handleUpdateRoom = (match: Match) => {
    const updatedMatch = { ...match, roomId, roomPass };
    db.updateMatch(updatedMatch);
    setSelectedMatchForRoom(null);
    setRoomId('');
    setRoomPass('');
    alert('Room credentials published successfully!');
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('Are you absolutely sure you want to delete this mission? Data cannot be recovered.')) {
      db.deleteMatch(matchId);
    }
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const matchData: Match = {
      id: editingMatch ? editingMatch.id : 'm' + Date.now(),
      title,
      type,
      map,
      version,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      prizePerKill: Number(prizePerKill),
      totalSlots: Number(totalSlots),
      startTime: new Date(startTime).toISOString(),
      joinedSlots: editingMatch ? editingMatch.joinedSlots : [],
      rules: matchRules.length > 0 ? matchRules : ['No Emulators', 'No Teaming'],
      isCompleted: editingMatch ? editingMatch.isCompleted : false,
      imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/800/400`,
      isPointSystem,
      pointsPerKill: Number(pointsPerKill),
      totalMatchesCount: Number(totalMatchesCount),
      positionPoints: posPoints
    };
    db.updateMatch(matchData);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingMatch(null);
    setTitle(''); setStartTime(''); setImageUrl('');
    setIsPointSystem(false); setPointsPerKill('1'); setTotalMatchesCount('1');
    setEntryFee('50'); setPrizePool('1000'); setPrizePerKill('10'); setTotalSlots('48');
    setMatchRules([]);
    setPosPoints({ 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setMatchRules([...matchRules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (idx: number) => {
    setMatchRules(matchRules.filter((_, i) => i !== idx));
  };

  const updatePosPoint = (rank: number, val: string) => {
    setPosPoints({ ...posPoints, [rank]: Number(val) });
  };

  const handleCompleteMatch = (matchId: string) => {
    const formattedResults = Object.entries(resultsData).map(([userId, data]) => ({
        userId,
        kills: Number((data as any).kills) || 0,
        earnings: Number((data as any).earnings) || 0
    }));
    db.completeMatch(matchId, formattedResults);
    setSelectedMatchForResults(null);
    setResultsData({});
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-zinc-900 gap-6 shadow-2xl">
        <div>
           <h1 className="text-4xl font-gaming font-black italic uppercase tracking-tighter text-red-600">Command Console</h1>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Deploy and Manage Combat Missions</p>
        </div>
        <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="w-full md:w-auto px-12 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[11px] tracking-[0.3em] transition-all neon-red shadow-2xl transform active:scale-95"
        >
            + INITIALIZE NEW DEPLOYMENT
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {matches.map(m => (
          <div key={m.id} className={`bg-[#0A0A0A] border ${m.isCompleted ? 'border-zinc-950 opacity-40' : 'border-zinc-900'} p-8 rounded-[2.5rem] flex flex-wrap lg:flex-nowrap items-center gap-10 group hover:border-zinc-700 transition-all shadow-xl`}>
            <div className="w-28 h-28 rounded-3xl overflow-hidden border border-zinc-800 shrink-0 shadow-inner bg-black">
                <img src={m.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-4 mb-3">
                   <h3 className="font-black text-2xl uppercase font-gaming italic line-clamp-1 text-white">{m.title}</h3>
                   <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${m.isPointSystem ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>
                     {m.isPointSystem ? 'POINTS MODE' : 'CASH MODE'}
                   </span>
                </div>
                <div className="flex flex-wrap gap-3">
                    <span className="text-[10px] bg-zinc-950 text-zinc-500 px-4 py-2 rounded-xl font-black uppercase border border-zinc-900 tracking-widest">{m.type}</span>
                    <span className="text-[10px] bg-zinc-950 text-zinc-500 px-4 py-2 rounded-xl font-black uppercase border border-zinc-900 tracking-widest">{m.map}</span>
                    <span className="text-[10px] bg-zinc-950 text-zinc-500 px-4 py-2 rounded-xl font-black uppercase border border-zinc-900 tracking-widest">{new Date(m.startTime).toLocaleString()}</span>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">JOINED: {m.joinedSlots.length} / {m.totalSlots}</span>
                  </div>
                  <button onClick={() => setSelectedMatchForPlayers(m)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition-colors">VIEW WARRIORS &gt;</button>
                </div>
            </div>
            
            <div className="flex items-center space-x-12 px-10 border-x border-zinc-900 hidden xl:flex">
                <div className="text-center">
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1">REWARDS</p>
                    <p className="font-black text-xl text-yellow-500 italic">৳{m.prizePool}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {!m.isCompleted ? (
                    <>
                        <button onClick={() => { setSelectedMatchForRoom(m); setRoomId(m.roomId || ''); setRoomPass(m.roomPass || ''); }} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${m.roomId ? 'bg-yellow-500 text-black' : 'bg-zinc-950 text-white border-zinc-800'}`}>ROOM ID</button>
                        <button onClick={() => handleOpenEdit(m)} className="px-6 py-4 bg-zinc-950 hover:bg-zinc-900 text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-800">EDIT</button>
                        <button onClick={() => setSelectedMatchForResults(m)} className="px-6 py-4 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20">FINISH</button>
                        <button onClick={() => handleDeleteMatch(m.id)} className="px-6 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20">DELETE</button>
                    </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em] px-6">Archive Record</span>
                    <button onClick={() => handleDeleteMatch(m.id)} className="text-red-900 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* VIEW PLAYERS MODAL */}
      {selectedMatchForPlayers && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-lg rounded-[3rem] p-12 space-y-8 relative max-h-[80vh] overflow-y-auto shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-2xl font-black font-gaming italic uppercase text-white tracking-tighter">JOINED CITIZENS</h2>
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-1">{selectedMatchForPlayers.joinedSlots.length} Players Confirmed</p>
                </div>
                <button onClick={() => setSelectedMatchForPlayers(null)} className="text-zinc-500 text-4xl leading-none">&times;</button>
             </div>
             <div className="space-y-4">
                {selectedMatchForPlayers.joinedSlots.map((uid, i) => {
                  const player = users.find(u => u.id === uid);
                  return (
                    <div key={uid} className="flex items-center justify-between p-5 bg-zinc-950 rounded-[1.5rem] border border-zinc-900 group hover:border-red-600/30 transition-all">
                       <div className="flex items-center space-x-4">
                          <span className="text-[10px] text-zinc-700 font-black w-4">{i + 1}.</span>
                          <div>
                            <span className="text-sm font-black uppercase italic text-zinc-100 block">{player?.name || 'Unknown Participant'}</span>
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">#{player?.numericId || '000000'}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-[8px] font-mono text-zinc-800 uppercase block">CREDITS: ৳{player?.depositBalance || 0}</span>
                          <span className="text-[8px] font-mono text-zinc-800 uppercase block">UID: {uid.substring(0, 10)}</span>
                       </div>
                    </div>
                  );
                })}
                {selectedMatchForPlayers.joinedSlots.length === 0 && (
                  <div className="text-center py-20 border border-zinc-900 border-dashed rounded-3xl">
                    <p className="text-zinc-800 font-black uppercase text-[10px] italic tracking-[0.4em]">No citizens deployed yet.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* DEPLOY MISSION MODAL */}
      {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-5xl rounded-[3rem] p-12 space-y-10 my-10 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-8">
                    <div>
                        <h2 className="text-4xl font-black font-gaming italic uppercase text-white tracking-tighter">
                          {editingMatch ? 'Optimize Mission' : 'Deploy New Mission'}
                        </h2>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Configure Strategic Battle Parameters</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-14 h-14 flex items-center justify-center bg-zinc-900 rounded-full text-zinc-500 text-4xl hover:text-white transition-all">&times;</button>
                </div>

                <form onSubmit={handleSaveMatch} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* LEFT COLUMN: BASIC INFO */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Designation (Title)</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="STB ELITE BATTLE #150" className="w-full bg-black border border-zinc-900 p-6 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-sm font-bold text-white uppercase italic tracking-wider" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Battlefield (Map)</label>
                                    <select value={map} onChange={e => setMap(e.target.value as any)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs font-bold text-zinc-300 appearance-none focus:border-red-600">
                                        {Object.values(MatchMap).map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Deployment (Type)</label>
                                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs font-bold text-zinc-300 appearance-none focus:border-red-600">
                                        {Object.values(MatchType).map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Capacity (Slots)</label>
                                    <input type="number" value={totalSlots} onChange={e => setTotalSlots(e.target.value)} required className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs text-white font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Schedule</label>
                                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-xs text-zinc-400 font-bold" />
                                </div>
                            </div>

                            <div className="p-8 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 italic tracking-widest">Rules Protocol</h4>
                                    <span className="text-[8px] text-zinc-700 font-bold uppercase">Define tactical limits</span>
                                </div>
                                <div className="flex gap-4">
                                    <input value={newRule} onChange={e => setNewRule(e.target.value)} placeholder="Add specific rule..." className="flex-1 bg-black border border-zinc-900 rounded-2xl px-6 py-4 text-xs text-zinc-300" />
                                    <button type="button" onClick={addRule} className="w-14 h-14 bg-red-600 text-white rounded-2xl text-xl font-black shadow-lg">+</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {matchRules.map((rule, i) => (
                                        <div key={i} className="flex items-center bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800 group hover:border-red-600 transition-colors">
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase mr-3">{rule}</span>
                                            <button type="button" onClick={() => removeRule(i)} className="text-red-600 font-black hover:scale-125 transition-transform">×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FINANCIAL & POINT CONFIG */}
                        <div className="space-y-8">
                           <div className="p-8 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-yellow-500 italic tracking-widest">Financial Protocol</h4>
                                    <div className="flex items-center bg-black p-1.5 rounded-full border border-zinc-900">
                                        <button type="button" onClick={() => setIsPointSystem(false)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!isPointSystem ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-600'}`}>CASH</button>
                                        <button type="button" onClick={() => setIsPointSystem(true)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isPointSystem ? 'bg-yellow-500 text-black shadow-lg' : 'text-zinc-600'}`}>POINTS</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Entry Fee (৳)</label>
                                        <input type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-lg font-black text-white italic" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Win Prize (৳)</label>
                                        <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-lg font-black text-yellow-500 italic" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">{isPointSystem ? 'Points Per Kill' : 'Per Kill (৳)'}</label>
                                        <input type="number" value={isPointSystem ? pointsPerKill : prizePerKill} onChange={e => isPointSystem ? setPointsPerKill(e.target.value) : setPrizePerKill(e.target.value)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-lg font-black text-red-600 italic" />
                                    </div>
                                    {isPointSystem && (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Total Match Ops</label>
                                            <input type="number" value={totalMatchesCount} onChange={e => setTotalMatchesCount(e.target.value)} className="w-full bg-black border border-zinc-900 p-5 rounded-2xl text-lg font-black text-white italic" />
                                        </div>
                                    )}
                                </div>

                                {isPointSystem && (
                                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 italic tracking-[0.2em]">Position Points Table Matrix</label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                                                <div key={rank} className="space-y-2 text-center">
                                                    <p className="text-[9px] text-zinc-700 font-black">R{rank}</p>
                                                    <input type="number" value={posPoints[rank] || 0} onChange={e => updatePosPoint(rank, e.target.value)} className="w-full bg-black border border-zinc-900 text-[11px] p-3 rounded-xl text-center text-white font-black hover:border-yellow-500/50 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                           </div>
                           
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Cover Imagery Uplink (URL)</label>
                                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-black border border-zinc-900 p-6 rounded-2xl focus:border-red-600 focus:outline-none transition-all text-xs font-mono text-zinc-500" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-7 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.5em] neon-red shadow-[0_0_50px_rgba(239,68,68,0.2)] active:scale-95 transition-all transform">
                        {editingMatch ? 'INITIALIZE SYSTEM RE-UPLINK' : 'AUTHORIZE MISSION DEPLOYMENT'}
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* ROOM CREDENTIALS MODAL */}
      {selectedMatchForRoom && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-sm rounded-[3rem] p-10 space-y-8 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                    <h2 className="text-2xl font-black font-gaming italic uppercase text-red-600 tracking-tighter">Room Credentials</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-600 uppercase font-mono tracking-widest">Room ID</label>
                            <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="000000" className="w-full bg-black border border-zinc-900 p-6 rounded-2xl text-2xl font-mono tracking-[0.4em] text-red-500 focus:outline-none focus:border-red-600 text-center" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-600 uppercase font-mono tracking-widest">Access Key (Pass)</label>
                            <input value={roomPass} onChange={e => setRoomPass(e.target.value)} placeholder="PAS123" className="w-full bg-black border border-zinc-900 p-6 rounded-2xl text-2xl font-mono tracking-[0.4em] text-yellow-500 focus:outline-none focus:border-yellow-500 text-center" />
                        </div>
                    </div>
                    <div className="flex space-x-4 pt-4">
                        <button onClick={() => setSelectedMatchForRoom(null)} className="flex-1 py-5 bg-zinc-900 text-zinc-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">ABORT</button>
                        <button onClick={() => handleUpdateRoom(selectedMatchForRoom)} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest neon-red shadow-xl">PUBLISH</button>
                    </div>
                </div>
           </div>
      )}

      {/* FINALIZE RESULTS MODAL */}
      {selectedMatchForResults && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-2xl rounded-[2rem] p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
                    <h2 className="text-2xl font-black font-gaming italic uppercase text-red-600 tracking-tighter">MISSION DEBRIEF</h2>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Finalize combat stats for all participants</p>
                    
                    <div className="space-y-4">
                        {selectedMatchForResults.joinedSlots.map(uid => (
                            <div key={uid} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                                <span className="font-black text-white text-xs uppercase truncate italic">{users.find(u => u.id === uid)?.name || 'Unknown'}</span>
                                <div className="space-y-1">
                                    <label className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Kill Count</label>
                                    <input 
                                        type="number" placeholder="Kills"
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs focus:border-red-500 text-white font-bold"
                                        onChange={e => setResultsData({ ...resultsData, [uid]: { ...resultsData[uid], kills: Number(e.target.value) } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Earnings (৳)</label>
                                    <input 
                                        type="number" placeholder="Prize"
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs focus:border-red-500 text-yellow-500 font-black"
                                        onChange={e => setResultsData({ ...resultsData, [uid]: { ...resultsData[uid], earnings: Number(e.target.value) } })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-3 pt-6 border-t border-zinc-900">
                        <button onClick={() => setSelectedMatchForResults(null)} className="flex-1 py-4 bg-zinc-900 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest">CANCEL</button>
                        <button 
                            disabled={selectedMatchForResults.joinedSlots.length === 0}
                            onClick={() => handleCompleteMatch(selectedMatchForResults.id)} 
                            className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg neon-green disabled:opacity-30"
                        >
                            CLOSE ARCHIVE
                        </button>
                    </div>
                </div>
           </div>
      )}
    </div>
  );
}
