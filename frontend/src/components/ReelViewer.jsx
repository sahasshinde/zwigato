import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReelViewer({ posts, startIndex, onClose, partner }) {
  const [current, setCurrent] = useState(startIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setPaused(false);
    }
  }, [current]);

  const goNext = () => { if (current < posts.length - 1) setCurrent(c => c + 1); };
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1); };

  const handleTouchStart = e => setTouchStart(e.touches[0].clientY);
  const handleTouchEnd = e => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
    setTouchStart(null);
  };

  const handleWheel = e => { e.deltaY > 0 ? goNext() : goPrev(); };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPaused(false); }
    else { videoRef.current.pause(); setPaused(true); }
  };

  const post = posts[current];

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      style={{ width: '100vw', height: '100vh' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Video — full screen */}
      <div className="absolute inset-0" onClick={togglePlay}>
        {post.videoUrl ? (
          <video
            ref={videoRef}
            src={post.videoUrl}
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
            loop
            playsInline
            autoPlay
            muted={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-900 to-amber-900 flex items-center justify-center">
            <span className="text-8xl">{post.emoji || '🍽️'}</span>
          </div>
        )}
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl ml-1">▶</span>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 pb-8"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <button onClick={onClose}
          className="w-9 h-9 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-lg">
          ✕
        </button>
        <span className="text-white text-sm bg-black bg-opacity-40 px-3 py-1 rounded-full">
          {current + 1} / {posts.length}
        </span>
      </div>

      {/* Bottom info + order */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8 pt-16"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
        <h3 className="text-white font-bold text-xl mb-1">{post.dishName}</h3>
        {post.description && <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.description}</p>}
        {post.price && <p className="text-green-400 font-bold text-lg mb-3">₹{post.price}</p>}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map(tag => <span key={tag} className="text-orange-300 text-xs">#{tag}</span>)}
          </div>
        )}
        <button
          onClick={() => navigate(`/order/${post._id}`, { state: { post, partner } })}
          className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full text-base hover:bg-orange-600 transition shadow-lg">
          Order Now 🛒
        </button>
      </div>

      {/* Swipe arrows for desktop */}
      {current > 0 && (
        <button onClick={goPrev}
          className="absolute top-1/2 right-4 -translate-y-16 z-10 w-10 h-10 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white">
          ↑
        </button>
      )}
      {current < posts.length - 1 && (
        <button onClick={goNext}
          className="absolute top-1/2 right-4 translate-y-4 z-10 w-10 h-10 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white">
          ↓
        </button>
      )}
    </div>
  );
}