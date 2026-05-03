'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Search, Plus } from 'lucide-react';
import { getCommunityposts, addCommunityPost } from '@/lib/demoDB';

interface CommunityPost {
  id: string;
  studentId: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked: boolean;
}

interface CommunityTabProps {
  isDemoUser?: boolean;
}

export default function CommunityTab({ isDemoUser = true }: CommunityTabProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Study Tips',
    'Mental Wellness',
    'Life Balance',
    'Wellness',
    'Fitness',
    'General',
  ];

  // Load community posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      if (isDemoUser) {
        const fetchedPosts = await getCommunityposts();
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error('Error loading community posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const post = {
        studentId: 'demo-student-123',
        author: 'You',
        avatar: '👤',
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
      };

      await addCommunityPost(post);

      setNewPost({ title: '', content: '', category: 'General' });
      setShowNewPostModal(false);

      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post');
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Community</h2>
            <p className="text-sm text-gray-500">Connect with peers and share experiences</p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts, people, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center text-gray-500">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p>Loading community posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No posts found</p>
              <p className="text-sm">Be the first to share!</p>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                    {post.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Post Title & Content */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-gray-600">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    post.isLiked
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={post.isLiked ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Share size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create a New Post</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="What's your post about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.filter((cat) => cat !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Share your thoughts, tips, or experiences..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddPost}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Post
                </button>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
