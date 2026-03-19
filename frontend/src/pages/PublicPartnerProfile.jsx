import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const CUISINE_EMOJI = {
  Indian:'🍛', Italian:'🍝', Chinese:'🥡', Japanese:'🍣',
  Mexican:'🌮', Continental:'🥗', 'Fast Food':'🍔',
  Desserts:'🍰', Beverages:'☕', Other:'🍽️'
};

export default function PublicPartnerProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    API.get(`/partners/${handle}`).then(({ data }) => {
      setPartner(data.partner);
      setPosts(data.posts || []);
      setFollowersCount(data.followersCount || 0);
      setFollowed(data.partner.followers?.includes(user?.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [handle]);

  const handleFollow = async () => {
    try {
      const { data } = await API.put(`/users/follow/${partner._id}`);
      setFollowed(data.following);
      setFollowersCount(prev => data.following ? prev + 1 : prev - 1);
    } catch {}
  };

  if (loading) return (
    <div className="pt-14 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-4xl animate-spin">🍽️</div>
    </div>
  );

  if (!partner) return (
    <div className="pt-14 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-gray-500">Partner not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-500 hover:underline text-sm">← Go back</button>
      </div>
    </div>
  );

  const emoji = CUISINE_EMOJI[partner.cuisine] || '🍽️';

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition mb-4">
          ← Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-orange-200 flex items-center justify-center text-4xl shadow-sm">
              {emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-gray-900">{partner.restaurantName}</h1>
                {partner.isVerified && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-sm text-gray-500 mb-2">@{partner.handle}</p>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{partner.cuisine}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-4 border-t border-gray-50 pt-4">
            <div className="text-center">
              <p className="font-bold text-lg text-gray-900">{posts.length}</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-gray-900">{followersCount}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
          </div>

          {partner.bio && <p className="text-sm text-gray-600 mb-2">{partner.bio}</p>}
          {partner.location && <p className="text-xs text-gray-400 mb-3">📍 {partner.location}</p>}

          <button
            onClick={handleFollow}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
              followed
                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {followed ? '✓ Following' : '+ Follow'}
          </button>
        </div>

        {/* Posts Grid */}
        <h2 className="font-semibold text-gray-900 mb-3">Posts ({posts.length})</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-orange-50">
            <div className="text-5xl mb-3">🎥</div>
            <p className="text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {posts.map(post => (
              <div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl border border-orange-50 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {post.videoUrl ? (
                  <div className="relative bg-black aspect-square">
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover opacity-80"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="text-white text-xs">❤️ {post.likes?.length || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                    <span className="text-5xl">{post.emoji || '🍽️'}</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.dishName}</p>
                  {post.price && <p className="text-xs text-green-600 font-medium">₹{post.price}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedPost.emoji}</span>
                <span className="font-semibold text-sm text-gray-900">{selectedPost.dishName}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {selectedPost.videoUrl && (
              <video src={selectedPost.videoUrl} controls autoPlay className="w-full max-h-64 object-contain bg-black" />
            )}
            <div className="p-4">
              {selectedPost.price && <p className="text-sm font-semibold text-green-600 mb-2">₹{selectedPost.price}</p>}
              <p className="text-sm text-gray-700">{selectedPost.description || selectedPost.caption}</p>
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPost.tags.map(tag => <span key={tag} className="text-xs text-orange-500">#{tag}</span>)}
                </div>
              )}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-sm text-gray-500">
                <span>❤️ {selectedPost.likes?.length || 0} likes</span>
                <span>💬 {selectedPost.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}