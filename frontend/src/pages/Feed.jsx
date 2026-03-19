import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

function ReelCard({ post, isActive }) {
  const videoRef = useRef();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [followed, setFollowed] = useState(false);

  const partner = post.partner;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      const timer = setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        setPaused(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      video.pause();
      video.currentTime = 0;
      setPaused(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {}
  };

  const handleFollow = async () => {
    try {
      const { data } = await API.put(`/users/follow/${partner?._id}`);
      setFollowed(data.following);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(prev => [...prev, data.comment]);
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  const handleOrder = () => {
    navigate('/order', { state: { post } });
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center snap-start snap-always overflow-hidden">

      {/* Video */}
      {post.videoUrl ? (
        <video
          ref={videoRef}
          src={post.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-900 to-amber-800 flex items-center justify-center">
          <span className="text-9xl">{post.emoji || '🍽️'}</span>
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

      {/* Pause indicator */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-4">
            <span className="text-white text-4xl">▶</span>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-4 bottom-36 flex flex-col items-center gap-6 z-10">

        {/* Partner avatar - click to follow */}
        <div className="relative cursor-pointer" onClick={handleFollow}>
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl shadow-lg transition-transform active:scale-110 ${followed ? 'border-orange-500 bg-orange-200' : 'border-white bg-orange-400'}`}>
            {post.emoji || '🍽️'}
          </div>
          {!followed ? (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-black">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          ) : (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-black">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className="text-3xl transition-transform active:scale-125">
            {liked ? '❤️' : '🤍'}
          </div>
          <span className="text-white text-xs font-semibold">{likesCount}</span>
        </button>

        {/* Comment */}
        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1">
          <span className="text-3xl">💬</span>
          <span className="text-white text-xs font-semibold">{comments.length}</span>
        </button>

        {/* Mute */}
        <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1">
          <span className="text-2xl">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-20 z-10">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-white font-bold text-sm cursor-pointer hover:underline"
            onClick={() => navigate(`/p/${partner?.handle}`)}
          >
            @{partner?.handle}
          </span>
          {partner?.isVerified && <span className="text-blue-400 text-xs">✓</span>}
          <span className="text-gray-400 text-xs">· {timeAgo(post.createdAt)}</span>
        </div>
        <h3 className="text-white font-bold text-base mb-1">{post.dishName}</h3>
        <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">{post.description || post.caption}</p>

        <div className="flex items-center gap-3 mt-2">
          {post.price && (
            <span className="text-orange-400 font-bold text-sm">₹{post.price}</span>
          )}
          {post.tags?.length > 0 && post.tags.map(tag => (
            <span key={tag} className="text-orange-300 text-xs">#{tag}</span>
          ))}
        </div>

        {/* Order Now button */}
        {post.price && (
          <button
            onClick={handleOrder}
            className="mt-3 px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition shadow-lg active:scale-95"
          >
            🛒 Order Now
          </button>
        )}
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm rounded-t-3xl z-20 p-5 max-h-[60vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-base">Comments ({comments.length})</h3>
            <button onClick={() => setShowComments(false)} className="text-gray-400 text-xl hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be first! 💬</p>
            )}
            {comments.map((c, i) => (
              <div key={c._id || i} className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                  {c.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <span className="text-orange-400 text-xs font-semibold">{c.username} </span>
                  <span className="text-gray-200 text-sm">{c.text}</span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <button type="submit" disabled={submitting || !commentText.trim()}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold disabled:opacity-50 hover:bg-orange-600 transition">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef();
  const cardRefs = useRef([]);

  useEffect(() => {
    API.get('/posts/feed?page=1&limit=20').then(({ data }) => {
      setPosts(data.posts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            const index = cardRefs.current.indexOf(entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { threshold: 0.7 }
    );
    cardRefs.current.forEach(card => { if (card) observer.observe(card); });
    return () => observer.disconnect();
  }, [posts]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin">🍽️</div>
        <p className="text-gray-400">Loading your feed...</p>
      </div>
    </div>
  );

  if (posts.length === 0) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-white text-xl font-bold mb-2">Nothing here yet</h3>
        <p className="text-gray-400 text-sm">Go to Discover and follow some food partners!</p>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      {posts.map((post, index) => (
        <div
          key={post._id}
          ref={el => cardRefs.current[index] = el}
          className="w-full h-screen snap-start snap-always"
        >
          <ReelCard post={post} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
}