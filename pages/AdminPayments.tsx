
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Transaction, TransactionStatus } from '../types';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(db.getTransactions().reverse());
  }, []);

  const handleStatusUpdate = (txId: string, status: TransactionStatus) => {
    db.updateTransaction(txId, status);
    setTransactions(transactions.map(t => t.id === txId ? { ...t, status } : t));
  };

  const pending = transactions.filter(t => t.status === TransactionStatus.PENDING);
  const completed = transactions.filter(t => t.status !== TransactionStatus.PENDING);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-gaming font-black italic uppercase mb-2">Payment Verification</h1>
        <p className="text-zinc-500">Review and approve user deposit and withdrawal requests.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold flex items-center space-x-2 text-yellow-500">
            <span className="w-2 h-6 bg-yellow-500 rounded-full block"></span>
            <span>PENDING REQUESTS ({pending.length})</span>
        </h2>
        
        {pending.map(tx => (
          <div key={tx.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-wrap lg:flex-nowrap items-center gap-6 group hover:border-yellow-500/30 transition-all">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl ${tx.type === 'Deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {tx.type === 'Deposit' ? '↓' : '↑'}
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-lg">{tx.type} Request</h3>
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded uppercase font-mono text-zinc-400">ID: {tx.id}</span>
                </div>
                <p className="text-zinc-500 text-sm mt-1">
                    User UID: <span className="text-zinc-300">9872123</span> • 
                    Method: <span className="text-red-500 font-bold">{tx.method}</span> • 
                    TxID: <span className="text-yellow-500 font-mono font-bold uppercase">{tx.transactionId}</span>
                </p>
                <p className="text-[10px] text-zinc-600 mt-1 uppercase">{new Date(tx.timestamp).toLocaleString()}</p>
            </div>
            
            <div className="text-center px-8 border-x border-zinc-800 min-w-[120px]">
                <p className="text-[10px] text-zinc-500 uppercase">Amount</p>
                <p className="text-2xl font-black font-gaming italic">৳{tx.amount}</p>
            </div>

            <div className="flex space-x-2">
                <button 
                    onClick={() => handleStatusUpdate(tx.id, TransactionStatus.COMPLETED)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                >
                    APPROVE
                </button>
                <button 
                    onClick={() => handleStatusUpdate(tx.id, TransactionStatus.REJECTED)}
                    className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                    REJECT
                </button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <div className="text-center py-10 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed text-zinc-600 italic">No pending payment requests.</div>}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center space-x-2 text-zinc-500">
            <span className="w-2 h-6 bg-zinc-700 rounded-full block"></span>
            <span>PROCESSED HISTORY</span>
        </h2>
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-widest border-b border-zinc-800">
                    <tr>
                        <th className="p-4">Type</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">TxID</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {completed.map(tx => (
                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="p-4 font-bold text-sm">{tx.type}</td>
                            <td className="p-4 text-xs text-zinc-400">UID: 9872123</td>
                            <td className="p-4 text-xs font-bold text-red-500">{tx.method}</td>
                            <td className="p-4 text-xs font-mono text-zinc-500">{tx.transactionId}</td>
                            <td className="p-4 font-bold">৳{tx.amount}</td>
                            <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    tx.status === TransactionStatus.COMPLETED ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'
                                }`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {completed.length === 0 && <div className="p-10 text-center text-zinc-600 italic">History is empty.</div>}
        </div>
      </div>
    </div>
  );
}
