import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Discover() {
  const { user, updateUser } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(new Set(user?.following?.map(f => f._id || f) || []));

  useEffect(() => {
    API.get('/partners').then(({ data }) => {
      setPartners(data.partners);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFollow = async (partnerId) => {
    try {
      const { data } = await API.put(`/users/follow/${partnerId}`);
      setFollowing(prev => {
        const next = new Set(prev);
        if (data.following) next.add(partnerId);
        else next.delete(partnerId);
        return next;
      });
      setPartners(prev => prev.map(p => p._id === partnerId
        ? { ...p, followers: data.following ? [...(p.followers||[]), user.id] : (p.followers||[]).filter(f => f !== user.id) }
        : p
      ));
    } catch {}
  };

  const filtered = partners.filter(p =>
    p.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
    p.handle?.toLowerCase().includes(search.toLowerCase()) ||
    p.cuisine?.toLowerCase().includes(search.toLowerCase())
  );

  const EMOJIS = { Indian:'🍛', Italian:'🍝', Chinese:'🥡', Japanese:'🍣', Mexican:'🌮', Continental:'🥗', 'Fast Food':'🍔', Desserts:'🍰', Beverages:'☕', Other:'🍽️' };

  if (loading) return <div className="pt-20 flex justify-center"><div className="text-4xl animate-spin">🍽️</div></div>;

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Discover 🔍</h1>
        <p className="text-sm text-gray-500 mb-5">Find and follow your favourite food partners</p>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-orange-300 shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">No partners found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(partner => {
              const isFollowing = following.has(partner._id);
              return (
                <div key={partner._id} className="bg-white rounded-2xl p-5 border border-orange-50 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl border-2 border-orange-200">
                        {EMOJIS[partner.cuisine] || '🍽️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm text-gray-900">{partner.restaurantName}</span>
                          {partner.isVerified && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                        <span className="text-xs text-gray-400">@{partner.handle}</span>
                      </div>
                    </div>
                  </div>
                  {partner.bio && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{partner.bio}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>🍽️ {partner.cuisine}</span>
                      <span>👥 {partner.followers?.length || 0}</span>
                    </div>
                    <button
                      onClick={() => handleFollow(partner._id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  {partner.location && <p className="text-xs text-gray-400 mt-2">📍 {partner.location}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
