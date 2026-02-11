
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { User, Match } from './types';
import { db } from './services/db';
import { NAVIGATION, ADMIN_NAVIGATION, COLORS } from './constants';
import Home from './pages/Home';
import MatchDetails from './pages/MatchDetails';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/AdminDashboard';
import AdminMatches from './pages/AdminMatches';
import AdminPayments from './pages/AdminPayments';
import Leaderboard from './pages/Leaderboard';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import MyMatches from './pages/MyMatches';

const Sidebar: React.FC<{ user: User | null; isSystemAdmin: boolean }> = ({ user, isSystemAdmin }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isAdmin = isSystemAdmin || (user?.isAdmin ?? false);

  if (!user && !isSystemAdmin) return null;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 glass-dark border-r border-red-900/30 hidden lg:flex flex-col z-50">
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-[#0a0a0a] rounded-3xl border border-red-900/30 overflow-hidden shadow-2xl relative group">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-red-600/5"></div>
        </div>
        <h1 className="text-xl font-black font-gaming text-white italic tracking-tighter uppercase leading-none">
          STB <span className="text-red-600">SM TEAM BD</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 py-4">
        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 px-4">Tactical Units</div>
        {NAVIGATION.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all group ${
              isActive(item.path) 
                ? 'bg-red-600 text-white shadow-xl neon-red' 
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-black uppercase text-[10px] tracking-widest">{item.name}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-10 mb-4 px-4">Admin Command</div>
            {ADMIN_NAVIGATION.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all group ${
                  isActive(item.path) 
                    ? 'bg-yellow-500 text-black shadow-xl neon-yellow' 
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-black uppercase text-[10px] tracking-widest">{item.name}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-zinc-900">
        <Link to="/profile" className="flex items-center space-x-4 bg-zinc-950 p-4 rounded-2xl mb-4 border border-zinc-900 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black italic shadow-lg text-blue-500 uppercase">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase text-white truncate italic">{user?.name || 'Commander'}</p>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">ID: #{user?.numericId || '000000'}</p>
          </div>
        </Link>
        <button 
          onClick={() => {
            db.setSystemAdmin(false);
            signOut(auth);
          }}
          className="w-full py-3 text-zinc-600 hover:text-red-600 text-[9px] font-black uppercase tracking-[0.4em] transition-colors"
        >
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{ user: User | null }> = ({ user }) => {
  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0);
  
  if (!user) return null;

  return (
    <header className="lg:ml-64 h-24 glass-dark border-b border-zinc-900 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <div className="lg:hidden w-12 h-12 bg-[#0a0a0a] rounded-xl border border-red-900/30 p-1">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
        </div>
        <div className="hidden md:block">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic mb-0.5">Operational Core</p>
            <h2 className="text-base font-black uppercase italic text-white tracking-tight">{user?.name || 'System Guest'}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="bg-black px-6 py-3 rounded-2xl border border-zinc-900 flex items-center space-x-6 shadow-inner group">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">WAR CREDITS</span>
                <span className="text-yellow-500 font-black text-xl italic leading-none">৳{totalBalance.toLocaleString()}</span>
            </div>
            <Link to="/wallet" className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-xl neon-red">
                RECHARGE
            </Link>
        </div>
      </div>
    </header>
  );
};

const GuestAuthBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent animate-in slide-in-from-bottom duration-700">
      <div className="max-w-4xl mx-auto glass-dark border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-zinc-950 border border-red-900/30 rounded-2xl p-2 hidden sm:block">
              <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
           </div>
           <div>
              <h3 className="text-xl font-black font-gaming italic uppercase text-white tracking-tighter">JOIN THE BATTLE</h3>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Login or Register to access all combat zones</p>
           </div>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Link to="/login" className="flex-1 md:px-10 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-800 transition-all">SIGN IN</Link>
          <Link to="/login" className="flex-1 md:px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl neon-red hover:bg-red-500 transition-all">REGISTER NOW</Link>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSystemAdmin, setIsSystemAdmin] = useState(db.isSystemAdmin());
  const [notifications, setNotifications] = useState<Match[]>([]);

  useEffect(() => {
    const handleAdminStatus = () => setIsSystemAdmin(db.isSystemAdmin());
    window.addEventListener('adminStatusChanged', handleAdminStatus);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const existingUsers = db.getUsers();
        let userProfile = existingUsers.find(u => u.id === firebaseUser.uid);
        if (!userProfile) {
          userProfile = {
            id: firebaseUser.uid,
            numericId: db.generateNumericId(),
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.phoneNumber || 'Soldier',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            depositBalance: 0,
            winningBalance: 0,
            totalKills: 0,
            totalEarnings: 0,
            totalMatchesJoined: 0,
            isAdmin: false
          };
          db.saveCurrentUser(userProfile);
        }
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleStorageUpdate = () => {
        const current = db.getCurrentUser();
        if (current) setUser(current);
        
        if (current) {
          const matches = db.getMatches();
          const userMatches = matches.filter(m => m.joinedSlots.includes(current.id));
          const newNotifs = userMatches.filter(m => m.roomId && m.roomPass && !sessionStorage.getItem(`notif_seen_${m.id}`));
          setNotifications(newNotifs);
        }
    };
    window.addEventListener('storage_update', handleStorageUpdate);
    handleStorageUpdate();

    return () => {
      unsubscribe();
      window.removeEventListener('adminStatusChanged', handleAdminStatus);
      window.removeEventListener('storage_update', handleStorageUpdate);
    };
  }, []);

  const acknowledgeNotification = (matchId: string) => {
    sessionStorage.setItem(`notif_seen_${matchId}`, 'true');
    setNotifications(prev => prev.filter(n => n.id !== matchId));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center space-y-8 animate-pulse">
        <div className="w-32 h-32 bg-[#0a0a0a] rounded-[2.5rem] border border-red-900/30 p-4 mx-auto mb-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
        </div>
        <p className="font-gaming font-black text-red-600 uppercase tracking-[0.6em] text-[10px]">INITIALIZING STB TERMINAL...</p>
      </div>
    </div>
  );

  const canAccessAdmin = isSystemAdmin || (user?.isAdmin ?? false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 selection:text-white relative">
        <div className="fixed top-28 right-8 z-[1000] flex flex-col space-y-4 max-w-sm pointer-events-none">
          {notifications.map(match => (
            <div key={match.id} className="pointer-events-auto bg-[#0A0A0A] border-l-4 border-l-yellow-500 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right duration-500 relative group overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start mb-4 relative">
                  <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em] italic">Room Credentials Ready</h4>
                  <button onClick={() => acknowledgeNotification(match.id)} className="text-zinc-700 hover:text-white transition-colors text-2xl leading-none pointer-events-auto">&times;</button>
               </div>
               <p className="text-xs font-black text-white mb-6 uppercase italic tracking-wider">{match.title}</p>
               <Link 
                to={`/match/${match.id}`} 
                onClick={() => acknowledgeNotification(match.id)} 
                className="w-full block py-4 bg-yellow-500 text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-all pointer-events-auto"
               >
                  AUTHORIZE ACCESS
               </Link>
            </div>
          ))}
        </div>

        <Sidebar user={user} isSystemAdmin={isSystemAdmin} />
        <Header user={user} />
        <main className={`${(user || isSystemAdmin) ? 'lg:ml-64' : 'max-w-6xl mx-auto pt-10'} p-10 pb-48 lg:pb-12`}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route path="/match/:id" element={<MatchDetails user={user as any} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Authenticated Routes */}
            <Route path="/my-matches" element={user ? <MyMatches user={user} /> : <Navigate to="/login" />} />
            <Route path="/wallet" element={user ? <Wallet user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            
            {/* Admin Routes */}
            {canAccessAdmin && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/matches" element={<AdminMatches />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {!user && !isSystemAdmin && <GuestAuthBar />}
        {(user || isSystemAdmin) && <MobileNav />}
      </div>
    </HashRouter>
  );
}

const MobileNav: React.FC = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-zinc-900 flex justify-around p-6 z-50 rounded-t-3xl">
      {NAVIGATION.map((item) => (
        <Link key={item.path} to={item.path} className="flex flex-col items-center space-y-1">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};
