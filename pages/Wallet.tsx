
import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionStatus } from '../types';
import { db } from '../services/db';

export default function Wallet({ user }: { user: User }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [txId, setTxId] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [settings, setSettings] = useState(db.getSettings());

  useEffect(() => {
    const updateData = () => {
        setTransactions(db.getTransactions().filter(t => t.userId === user.id).reverse());
        setSettings(db.getSettings());
    };
    updateData();
    window.addEventListener('storage_update', updateData);
    return () => window.removeEventListener('storage_update', updateData);
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!amount || val <= 0) return;
    
    if (activeTab === 'deposit' && !txId) {
        alert('Please enter a Transaction ID.');
        return;
    }

    if (activeTab === 'withdraw' && !personalNumber) {
        alert('Please enter your personal account number.');
        return;
    }
    
    if (activeTab === 'withdraw') {
        if (!settings.isWithdrawEnabled) {
            alert('Withdrawal is currently offline for system maintenance.');
            return;
        }
        if (val < settings.minWithdrawAmount) {
            alert(`Minimum extraction amount is ৳${settings.minWithdrawAmount}`);
            return;
        }
        if (user.winningBalance < val) {
            alert('Insufficient Winning Balance. You can only withdraw prize money.');
            return;
        }
    }

    setLoading(true);
    const newTx: Transaction = {
      id: 'tx' + Date.now(),
      userId: user.id,
      userNumericId: user.numericId,
      amount: val,
      method,
      targetAccount: activeTab === 'withdraw' ? personalNumber : 'STB-UPLINK',
      transactionId: activeTab === 'deposit' ? txId : 'EXTRACT-' + Date.now(),
      type: activeTab === 'deposit' ? 'Deposit' : 'Withdraw',
      status: TransactionStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    
    setTimeout(() => {
        if (activeTab === 'withdraw') {
            const updatedUser = { ...user, winningBalance: user.winningBalance - val };
            db.saveCurrentUser(updatedUser);
        }
        db.addTransaction(newTx);
        setAmount('');
        setTxId('');
        setPersonalNumber('');
        setLoading(false);
        alert(activeTab === 'deposit' ? 'Deposit Uplinked! Admin will verify soon.' : 'Withdrawal Request Logged!');
    }, 1000);
  };

  const getMethodNumber = () => {
    if (method === 'bKash') return settings.bkashNumber;
    if (method === 'Nagad') return settings.nagadNumber;
    return settings.rocketNumber;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-red-600 via-red-950 to-black p-10 rounded-[3rem] shadow-2xl border border-red-500/20 relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                    <div>
                        <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.4em] mb-2 italic">WINNING ASSETS</p>
                        <h2 className="text-5xl font-black font-gaming italic text-white">৳{(user.winningBalance || 0).toLocaleString()}</h2>
                    </div>
                    <div className="pt-6 border-t border-red-500/20">
                        <p className="text-red-400 text-[8px] font-black uppercase tracking-[0.4em] mb-1 italic">DEPOSIT CREDITS</p>
                        <h3 className="text-2xl font-black italic text-zinc-300">৳{(user.depositBalance || 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 text-9xl opacity-5 transform rotate-12">💰</div>
            </div>

            <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl">
                <h3 className="text-[10px] font-black mb-6 uppercase italic flex items-center text-zinc-500 tracking-[0.4em]">
                    <span className="w-1.5 h-6 bg-yellow-500 mr-4 rounded-full"></span>
                    TACTICAL PROTOCOL
                </h3>
                <div className="text-zinc-500 text-[10px] space-y-5 font-bold leading-relaxed uppercase tracking-wider">
                    <p className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">{settings.paymentInstructions}</p>
                    <p className="flex items-start"><span className="text-yellow-500 mr-3">01.</span> Send to the number matching your method choice.</p>
                    <p className="flex items-start"><span className="text-yellow-500 mr-3">02.</span> Your Numeric ID: <span className="text-white font-mono bg-zinc-900 px-2 rounded">#{user.numericId}</span></p>
                    <p className="flex items-start"><span className="text-yellow-500 mr-3">03.</span> Min extraction: ৳{settings.minWithdrawAmount}</p>
                </div>
            </div>
        </div>

        <div className="md:col-span-2 space-y-10">
            <div className="bg-[#0A0A0A] rounded-[3rem] border border-zinc-900 overflow-hidden shadow-2xl">
                <div className="flex bg-zinc-950/50 border-b border-zinc-900">
                    {['deposit', 'withdraw', 'history'].map((tab) => (
                        <button 
                            key={tab} onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-7 font-black text-[10px] uppercase transition-all tracking-[0.4em] ${activeTab === tab ? 'text-red-500 border-b-2 border-red-500 bg-red-600/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                {activeTab === 'history' ? (
                    <div className="p-8 max-h-[500px] overflow-y-auto space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex justify-between items-center group hover:border-zinc-700 transition-all">
                                <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${tx.type === 'Deposit' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{tx.type}</span>
                                        <span className="text-[10px] font-black uppercase text-zinc-300 italic">{tx.method}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</p>
                                    <p className="text-[8px] text-zinc-800 font-mono mt-1 uppercase">Tx: {tx.transactionId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black italic text-white">৳{tx.amount}</p>
                                    <span className={`text-[8px] font-black uppercase italic ${tx.status === TransactionStatus.COMPLETED ? 'text-green-500' : tx.status === TransactionStatus.PENDING ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <p className="text-center py-20 text-zinc-800 font-black uppercase text-xs italic tracking-[0.5em]">No transaction records found.</p>}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-12 space-y-10">
                        <div className="grid grid-cols-3 gap-4">
                            {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                                <button
                                    key={m} type="button" onClick={() => setMethod(m)}
                                    className={`py-5 rounded-2xl border font-black text-[10px] uppercase transition-all tracking-widest ${method === m ? 'bg-red-600/10 border-red-500 text-red-500 shadow-xl' : 'bg-black border-zinc-900 text-zinc-700 hover:border-zinc-700'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'deposit' && (
                            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 border-dashed animate-pulse">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Send Money to ({method} Personal)</p>
                                <p className="text-3xl font-black font-mono text-yellow-500 tracking-wider">{getMethodNumber()}</p>
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] text-zinc-600 uppercase font-black px-2 tracking-[0.2em]">Transaction Volume (৳)</label>
                                <input
                                    type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                                    className="w-full bg-black border border-zinc-900 rounded-2xl px-8 py-6 focus:outline-none focus:border-red-600 transition-all font-black text-4xl italic tracking-tighter text-white"
                                />
                            </div>

                            {activeTab === 'deposit' ? (
                                <div className="space-y-3">
                                    <label className="text-[10px] text-zinc-600 uppercase font-black px-2 tracking-[0.2em]">Transaction ID (TxID)</label>
                                    <input
                                        type="text" required value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="8X2Y9Z..."
                                        className="w-full bg-black border border-zinc-900 rounded-2xl px-8 py-6 focus:outline-none focus:border-red-600 transition-all font-mono tracking-[0.5em] uppercase text-zinc-300 text-xl"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-[10px] text-zinc-600 uppercase font-black px-2 tracking-[0.2em]">Your Personal {method} Number</label>
                                    <input
                                        type="tel" required value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} placeholder="01XXXXXXXXX"
                                        className="w-full bg-black border border-zinc-900 rounded-2xl px-8 py-6 focus:outline-none focus:border-red-600 transition-all font-mono tracking-[0.2em] text-white text-xl"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className={`w-full py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.5em] transition-all shadow-2xl active:scale-95 transform ${activeTab === 'deposit' ? 'bg-red-600 text-white neon-red' : 'bg-yellow-500 text-black shadow-lg'}`}
                        >
                            {loading ? 'AUTHENTICATING...' : `CONFIRM ${activeTab === 'deposit' ? 'DEPOSIT' : 'EXTRACTION'}`}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
