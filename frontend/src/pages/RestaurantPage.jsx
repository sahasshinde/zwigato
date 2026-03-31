import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ReelViewer from '../components/ReelViewer';

export default function RestaurantPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reelIndex, setReelIndex] = useState(null);

  useEffect(() => {
    API.get(`/partners/${handle}`).then(({ data }) => {
      setPartner(data.partner);
      setPosts(data.posts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [handle]);

  if (loading) return (
    <div className="pt-20 flex justify-center min-h-screen">
      <div className="text-4xl animate-spin">🍽️</div>
    </div>
  );

  if (!partner) return (
    <div className="pt-20 flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500">Restaurant not found.</p>
    </div>
  );

  const EMOJIS = { Indian: '🍛', Italian: '🍝', Chinese: '🥡', Japanese: '🍣', Mexican: '🌮', Continental: '🥗', 'Fast Food': '🍔', Desserts: '🍰', Beverages: '☕', Other: '🍽️' };

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      {/* Reel Viewer */}
      {reelIndex !== null && (
        <ReelViewer
          posts={posts}
          startIndex={reelIndex}
          onClose={() => setReelIndex(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-orange-500 mb-4 flex items-center gap-1">
          ← Back
        </button>

        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl border-2 border-orange-200">
              {EMOJIS[partner.cuisine] || '🍽️'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-display text-xl font-bold text-gray-900">{partner.restaurantName}</h1>
                {partner.isVerified && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-sm text-gray-500">@{partner.handle}</p>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{partner.cuisine}</span>
            </div>
          </div>
          {partner.bio && <p className="text-sm text-gray-600 mb-3">{partner.bio}</p>}
          {partner.area && (
            <p className="text-xs text-gray-400">
              📍 {partner.shopNo && `${partner.shopNo}, `}{partner.buildingName && `${partner.buildingName}, `}{partner.area}
            </p>
          )}
        </div>

        {/* Menu Grid */}
        <h2 className="font-display text-lg font-bold text-gray-900 mb-3">Menu 🍽️</h2>
        <p className="text-xs text-gray-400 mb-4">Tap any item to watch the video</p>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 text-sm">No menu items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {posts.map((post, index) => (
              <div key={post._id}
                onClick={() => setReelIndex(index)}
                className="bg-white rounded-xl border border-orange-50 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition active:scale-95">
                 {/* Video Thumbnail */}
<div className="aspect-square bg-black relative overflow-hidden">
  {post.videoUrl ? (
    <video
      src={post.videoUrl}
      className="w-full h-full object-cover"
      muted
      playsInline
      preload="metadata"
      onMouseEnter={e => e.target.play()}
      onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
      <span className="text-3xl">{EMOJIS[post.cuisine] || '🍽️'}</span>
    </div>
  )}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="w-8 h-8 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
      <span className="text-white text-xs ml-0.5">▶</span>
    </div>
  </div>
</div>
                {/* Dish Info */}
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{post.dishName}</p>
                  {post.price && <p className="text-xs text-green-600 font-medium">₹{post.price}</p>}
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/order/${post._id}`, { state: { post, partner } }); }}
                    className="mt-1.5 w-full py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition">
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}