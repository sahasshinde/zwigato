import { useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h`;
  return `${Math.floor(seconds/86400)}d`;
};

export default function PostCard({ post, onDelete }) {
  const { user, isUser } = useAuth();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const partner = post.partner;
  const emoji = post.emoji || '🍽️';

  const handleLike = async () => {
    if (!isUser) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isUser) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(prev => [...prev, data.comment]);
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-50 shadow-sm overflow-hidden mb-4">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl border-2 border-orange-200">
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-gray-900">{partner?.restaurantName || 'Restaurant'}</span>
              {partner?.isVerified && <span className="text-blue-500 text-xs">✓</span>}
            </div>
            <span className="text-xs text-gray-400">@{partner?.handle} · {timeAgo(post.createdAt)}</span>
          </div>
        </div>
        {user?.role === 'partner' && user?.id === (post.partner?._id || post.partner) && (
          <button onClick={() => onDelete?.(post._id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">
            Delete
          </button>
        )}
      </div>

      {/* Video Player */}
      {post.videoUrl && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden bg-black">
          <video
            src={post.videoUrl}
            controls
            className="w-full max-h-72 object-contain"
            preload="metadata"
          />
        </div>
      )}

      {/* Dish Info Card */}
      <div className="mx-4 mb-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base text-gray-900 mb-1">{post.dishName}</h3>
            {post.cuisine && (
              <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mb-2">{post.cuisine}</span>
            )}
            {post.price && <p className="text-sm font-semibold text-green-600 mb-1">₹{post.price}</p>}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => <span key={tag} className="text-xs text-orange-500">#{tag}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">{partner?.handle} </span>
          {post.description || post.caption}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-4 border-t border-gray-50 pt-3">
        <button
          onClick={handleLike}
          disabled={!isUser}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'} ${!isUser ? 'cursor-default' : ''}`}
        >
          <span className={likeAnim ? 'like-pop inline-block' : 'inline-block'}>{liked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
        >
          <span>💬</span>
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-50 px-4 py-3">
          {comments.length === 0 && <p className="text-xs text-gray-400 mb-3">No comments yet. Be the first!</p>}
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {comments.map((c, i) => (
              <div key={c._id || i} className="flex gap-2">
                <span className="text-xs font-semibold text-gray-800">{c.username}</span>
                <span className="text-xs text-gray-600">{c.text}</span>
              </div>
            ))}
          </div>
          {isUser && (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:border-orange-300"
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="text-xs px-3 py-2 bg-orange-500 text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition">
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}