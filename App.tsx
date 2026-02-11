
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { User, Match } from './types';
import { db } from './services/db';
import { NAVIGATION, ADMIN_NAVIGATION } from './constants';
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
    <div className="fixed left-0 top-0 bottom-0 w-64 glass-dark border-r border-zinc-900 hidden lg:flex flex-col z-50">
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl relative group p-1">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-red-600/5"></div>
        </div>
        <h1 className="text-xl font-black font-gaming text-white italic tracking-tighter uppercase leading-none">
          STB <span className="text-red-600">TOURNAMENT</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 py-4">
        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 px-4">TACTICAL OPS</div>
        {NAVIGATION.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-xl transition-all group ${
              isActive(item.path) 
                ? 'bg-red-600 text-white shadow-xl neon-red' 
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-black uppercase text-[10px] tracking-widest">{item.name}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-10 mb-4 px-4">COMMANDER ONLY</div>
            {ADMIN_NAVIGATION.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-5 py-3.5 rounded-xl transition-all group ${
                  isActive(item.path) 
                    ? 'bg-yellow-500 text-black shadow-xl neon-yellow' 
                    : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
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
        <Link to="/profile" className="flex items-center space-x-4 bg-zinc-950 p-4 rounded-xl mb-4 border border-zinc-900 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black italic shadow-lg text-red-500 uppercase text-lg">
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
          className="w-full py-2 text-zinc-700 hover:text-red-600 text-[8px] font-black uppercase tracking-[0.3em] transition-colors"
        >
          LOGOUT SESSION
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{ user: User | null }> = ({ user }) => {
  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0);
  
  if (!user) return null;

  return (
    <header className="lg:ml-64 h-20 md:h-24 glass-dark border-b border-zinc-900 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <div className="lg:hidden w-10 h-10 bg-zinc-950 rounded-lg border border-zinc-800 p-1">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
        </div>
        <div className="hidden sm:block">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em] italic mb-0.5">Tactical Core</p>
            <h2 className="text-sm font-black uppercase italic text-white tracking-tight">{user?.name || 'System Guest'}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="bg-black/40 px-4 md:px-6 py-2.5 rounded-xl border border-zinc-900 flex items-center space-x-4 md:space-x-6 shadow-inner">
            <div className="flex flex-col text-right">
                <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">ASSETS</span>
                <span className="text-yellow-500 font-black text-base md:text-xl italic leading-none tracking-tighter">৳{totalBalance.toLocaleString()}</span>
            </div>
            <Link to="/wallet" className="bg-red-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg neon-red">
                +
            </Link>
        </div>
      </div>
    </header>
  );
};

const GuestAuthBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent animate-in slide-in-from-bottom duration-700">
      <div className="max-w-4xl mx-auto glass-dark border border-zinc-800 p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center space-x-5 text-center sm:text-left">
           <div className="w-14 h-14 bg-zinc-950 border border-zinc-900 rounded-xl p-2 hidden sm:block">
              <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
           </div>
           <div>
              <h3 className="text-lg font-black font-gaming italic uppercase text-white tracking-tighter leading-none">READY FOR BATTLE?</h3>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Uplink now to access all tournaments</p>
           </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link to="/login" className="flex-1 sm:px-8 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-zinc-800 transition-all">SIGN IN</Link>
          <Link to="/login" className="flex-1 sm:px-8 py-3.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-xl neon-red hover:bg-red-500 transition-all">JOIN NOW</Link>
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
      <div className="text-center space-y-6 animate-pulse">
        <div className="w-24 h-24 bg-zinc-950 rounded-[2rem] border border-zinc-900 p-3 mx-auto mb-6 shadow-2xl">
            <img src="https://i.ibb.co/LhyM66Q/logo.png" className="w-full h-full object-contain" />
        </div>
        <p className="font-gaming font-black text-red-600 uppercase tracking-[0.5em] text-[10px]">SYNCING STB TERMINAL...</p>
      </div>
    </div>
  );

  const canAccessAdmin = isSystemAdmin || (user?.isAdmin ?? false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 selection:text-white relative font-inter">
        {/* NOTIFICATIONS BOX */}
        <div className="fixed top-24 md:top-28 right-4 md:right-8 z-[1000] flex flex-col space-y-3 max-w-[calc(100vw-2rem)] md:max-w-sm pointer-events-none">
          {notifications.map(match => (
            <div key={match.id} className="pointer-events-auto bg-[#0a0a0a] border-l-4 border-l-yellow-500 border border-zinc-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right duration-500 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest italic leading-none">ROOM ACCESS LIVE</h4>
                  <button onClick={() => acknowledgeNotification(match.id)} className="text-zinc-700 hover:text-white transition-colors text-2xl leading-none">&times;</button>
               </div>
               <p className="text-xs font-black text-white mb-6 uppercase italic tracking-wider line-clamp-1">{match.title}</p>
               <Link 
                to={`/match/${match.id}`} 
                onClick={() => acknowledgeNotification(match.id)} 
                className="w-full block py-3.5 bg-yellow-500 text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-yellow-400"
               >
                  AUTHORIZE ACCESS
               </Link>
            </div>
          ))}
        </div>

        <Sidebar user={user} isSystemAdmin={isSystemAdmin} />
        <Header user={user} />
        <main className={`${(user || isSystemAdmin) ? 'lg:ml-64' : 'max-w-6xl mx-auto pt-4 md:pt-10'} p-4 md:p-10 pb-32 lg:pb-12`}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route path="/match/:id" element={<MatchDetails user={user as any} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/my-matches" element={user ? <MyMatches user={user} /> : <Navigate to="/login" />} />
            <Route path="/wallet" element={user ? <Wallet user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
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
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 glass-dark border border-zinc-800 flex justify-around p-4 z-50 rounded-[1.5rem] shadow-2xl">
      {NAVIGATION.slice(0, 4).map((item) => (
        <Link key={item.path} to={item.path} className="flex flex-col items-center space-y-1">
          <span className={`text-xl transition-transform ${isActive(item.path) ? 'scale-125' : 'opacity-40'}`}>{item.icon}</span>
          <span className={`text-[7px] font-black uppercase tracking-widest ${isActive(item.path) ? 'text-red-500' : 'text-zinc-600'}`}>{item.name}</span>
        </Link>
      ))}
      <Link to="/wallet" className="flex flex-col items-center space-y-1">
          <span className={`text-xl transition-transform ${isActive('/wallet') ? 'scale-125' : 'opacity-40'}`}>💰</span>
          <span className={`text-[7px] font-black uppercase tracking-widest ${isActive('/wallet') ? 'text-yellow-500' : 'text-zinc-600'}`}>Wallet</span>
      </Link>
    </div>
  );
};
