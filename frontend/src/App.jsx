import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Flame, Heart, X, Check, RotateCcw, MessageCircle, Sparkles } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [subView, setSubView] = useState('swipe');
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Drag gesture states
  const [dragStartX, setDragStartX] = useState(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/feed`),
        fetch(`${API_URL}/matches`)
      ]);
      setProfiles(await feedRes.json());
      setMatches(await matchesRes.json());
    } catch (err) {
      console.error("Failed to connect to backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (profiles.length === 0 || swipeDirection) return;
    const currentProfile = profiles[0];
    
    setSwipeDirection(action === 'like' ? 'right' : 'left');
    setDragOffsetX(0);
    setDragStartX(null);

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/swipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: currentProfile.id, action })
        });
        const data = await res.json();

        setProfiles(prev => prev.slice(1));
        setSwipeDirection(null);

        if (data.isMatch) {
          setMatchModal(data.matchedProfile);
          setMatches(prev => [...prev, data.matchedProfile]);
        }
      } catch (err) {
        console.error("Swipe error:", err);
        setSwipeDirection(null);
      }
    }, 250);
  };

  const handlePointerDown = (e) => {
    setDragStartX(e.clientX ?? e.touches?.[0]?.clientX);
  };

  const handlePointerMove = (e) => {
    if (dragStartX === null) return;
    const currentX = e.clientX ?? e.touches?.[0]?.clientX;
    if (currentX !== undefined) {
      setDragOffsetX(currentX - dragStartX);
    }
  };

  const handlePointerUp = () => {
    if (dragStartX === null) return;
    if (dragOffsetX > 90) {
      handleSwipe('like');
    } else if (dragOffsetX < -90) {
      handleSwipe('pass');
    } else {
      setDragOffsetX(0);
    }
    setDragStartX(null);
  };

  const handleReset = async () => {
    await fetch(`${API_URL}/reset`, { method: 'POST' });
    fetchData();
    setMatchModal(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 font-sans text-slate-900 select-none">
      {/* Mobile-first Premium White Container Frame */}
      <div className="w-full max-w-md h-[100vh] sm:h-[850px] bg-white sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              COY
            </span>
          </div>

          {activeTab === 'discover' && (
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button 
                onClick={() => setSubView('swipe')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${subView === 'swipe' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Discover
              </button>
              <button 
                onClick={() => setSubView('matches')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative ${subView === 'matches' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Matches ({matches.length})
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50">
          {activeTab === 'home' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <HomeIcon size={48} className="mb-4 stroke-1 opacity-40 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-700">Home Tab</h2>
              <p className="text-sm mt-1 max-w-xs text-slate-500">Coy's existing experience placeholder.</p>
            </div>
          ) : subView === 'matches' ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                <Heart className="text-rose-600 fill-rose-600" size={22} /> Mutual Matches
              </h2>
              {matches.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-sm">No mutual matches yet. Keep swiping!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {matches.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
                      <img src={m.photo} alt={m.name} className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-rose-500/30 shadow-sm" />
                      <h3 className="font-bold text-sm text-slate-900">{m.name}, {m.age}</h3>
                      <p className="text-xs text-slate-500 mb-3">{m.city}</p>
                      <button className="w-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <MessageCircle size={14} /> Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 relative">
              {loading ? (
                <div className="text-slate-500 animate-pulse font-medium">Loading profiles...</div>
              ) : profiles.length === 0 ? (
                <div className="text-center p-6 flex flex-col items-center justify-center flex-1">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 text-rose-600 shadow-sm">
                    <Flame size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No more profiles!</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6">You've swiped through everyone in your area.</p>
                  <button 
                    onClick={handleReset}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-slate-200 shadow-sm transition"
                  >
                    <RotateCcw size={16} /> Reset Demo Profiles
                  </button>
                </div>
              ) : (
                <div className="w-full h-full max-w-sm max-h-[500px] relative flex items-center justify-center">
                  <div 
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    style={{
                      transform: swipeDirection === 'left'
                        ? 'translateX(-150%) rotate(-15deg)'
                        : swipeDirection === 'right'
                        ? 'translateX(150%) rotate(15deg)'
                        : `translateX(${dragOffsetX}px) rotate(${dragOffsetX * 0.05}deg)`,
                      transition: dragStartX !== null ? 'none' : 'all 0.25s ease-out'
                    }}
                    className={`w-full h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 absolute flex flex-col cursor-grab active:cursor-grabbing ${
                      swipeDirection ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    {/* Visual Swipe Feedback Stamps */}
                    {(dragOffsetX > 40 || swipeDirection === 'right') && (
                      <div className="absolute top-6 left-6 z-30 border-4 border-emerald-500 text-emerald-500 font-black text-2xl px-3 py-1 rounded-xl -rotate-12 tracking-widest bg-white/80 shadow-lg">
                        LIKE
                      </div>
                    )}
                    {(dragOffsetX < -40 || swipeDirection === 'left') && (
                      <div className="absolute top-6 right-6 z-30 border-4 border-rose-500 text-rose-500 font-black text-2xl px-3 py-1 rounded-xl rotate-12 tracking-widest bg-white/80 shadow-lg">
                        NOPE
                      </div>
                    )}

                    <div className="relative w-full h-[68%] pointer-events-none">
                      <img src={profiles[0].photo} alt={profiles[0].name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/10 to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-2xl font-black flex items-baseline gap-2 drop-shadow-md">
                          {profiles[0].name} 
                          <span className="text-xl font-normal text-slate-200">{profiles[0].age}</span>
                        </h2>
                        <p className="text-xs text-slate-300 font-medium drop-shadow">{profiles[0].city}</p>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between bg-white pointer-events-none">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{profiles[0].bio}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {profiles[0].interests.map((interest, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-700">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute -bottom-16 flex gap-8 z-20">
                    <button 
                      onClick={() => handleSwipe('pass')}
                      className="w-14 h-14 bg-white hover:bg-rose-50 border border-slate-200 rounded-full flex items-center justify-center text-rose-600 shadow-lg transition transform active:scale-95"
                      title="Pass"
                    >
                      <X size={26} />
                    </button>
                    <button 
                      onClick={() => handleSwipe('like')}
                      className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-amber-500 hover:opacity-90 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-600/30 transition transform active:scale-95"
                      title="Like"
                    >
                      <Check size={26} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="h-16 border-t border-slate-100 bg-white flex justify-around items-center px-6 z-20 shadow-sm">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <HomeIcon size={22} />
            <span className="text-[10px]">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'discover' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Flame size={22} />
            <span className="text-[10px]">Discover</span>
          </button>
        </nav>

        {/* Match Modal Popup */}
        {matchModal && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-xs uppercase tracking-widest text-rose-600 font-bold mb-2">Mutual Connection</span>
            <h2 className="text-4xl font-black italic bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-4">
              It's a Match!
            </h2>
            <p className="text-sm text-slate-600 mb-8">You and {matchModal.name} both liked each other.</p>
            
            <div className="flex justify-center items-center -space-x-4 mb-8">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" alt="You" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl" />
              <img src={matchModal.photo} alt={matchModal.name} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl" />
            </div>

            <div className="w-full max-w-xs flex flex-col gap-3">
              <button 
                onClick={() => { setMatchModal(null); setSubView('matches'); }}
                className="w-full bg-gradient-to-r from-rose-600 to-amber-500 text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-rose-600/20"
              >
                View Matches
              </button>
              <button 
                onClick={() => setMatchModal(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-3 rounded-full font-bold text-sm transition"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}