"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Reply as ReplyIcon,
  Plus,
  Search,
  Clock,
  ThumbsUp,
  Tag,
  Shield,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: string;
  timestamp: Date;
  category: string;
  likes: number;
  replies: number;
  isAnonymous: boolean;
}

interface Reply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  author: string;
  timestamp: Date;
  likes: number;
  isAnonymous: boolean;
}

// API response DTOs (shape from backend)
interface CommunityPostDTO {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: string;
  timestamp?: string;
  createdAt?: string;
  category?: string;
  likes?: number;
  repliesCount?: number;
  isAnonymous?: boolean;
}

interface CommunityReplyDTO {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  author: string;
  timestamp?: string;
  createdAt?: string;
  likes?: number;
  isAnonymous?: boolean;
}

interface CommunityDataResponse {
  posts?: CommunityPostDTO[];
  replies?: CommunityReplyDTO[];
}

const PeerForum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState({ title: "", content: "", category: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'reply' | null, id: string | null, postId?: string }>({ type: null, id: null });

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
    isAnonymous: true,
  });

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(true);

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "General",
    "Anxiety",
    "Depression",
    "Study Tips",
    "Social Connection",
    "Academic Stress",
    "Sleep Issues",
    "Relationships",
  ];

  // ─────────────────────────────────────────
  // Create Post  →  /api/community-memory (type: "post")
  // ─────────────────────────────────────────

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both title and content are required to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.instituteId) {
      toast({
        title: "Error",
        description: "Unable to determine your institute. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const postAuthorId = user.id;
    const postAuthorName = newPost.isAnonymous
      ? "Anonymous Student"
      : user.name;

    // Debug: Check each field
    console.log("User data:", {
      userId: user.id,
      name: user.name,
      instituteId: user.instituteId,
    });
    console.log("New post data:", newPost);

    const postData = {
      type: "post" as const,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category || "General",
      isAnonymous: newPost.isAnonymous || false,
      authorId: postAuthorId,
      author: postAuthorName,
      instituteId: user.instituteId,
    };

    console.log("Creating post with data:", postData);
    console.log("Validation check:", {
      hasTitle: !!postData.title?.trim(),
      hasContent: !!postData.content?.trim(),
      hasAuthorId: !!postData.authorId,
      hasAuthor: !!postData.author,
      hasInstituteId: !!postData.instituteId,
    });

    try {
      const res = await fetch("/api/community-memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to save post");
      }

      const data = await res.json();
      const saved = (data.post || {}) as CommunityPostDTO;

      const post: ForumPost = {
        id: saved.id || Date.now().toString(),
        title: saved.title || newPost.title,
        content: saved.content || newPost.content,
        authorId: saved.authorId || postAuthorId,
        author: saved.author || postAuthorName,
        timestamp: new Date(saved.timestamp || saved.createdAt || Date.now()),
        category: saved.category || newPost.category,
        likes: saved.likes ?? 0,
        replies: saved.repliesCount ?? 0,
        isAnonymous: saved.isAnonymous ?? newPost.isAnonymous,
      };

      setPosts((prev) => [post, ...prev]);
      setNewPost({
        title: "",
        content: "",
        category: "General",
        isAnonymous: true,
      });
      setShowNewPostForm(false);

      toast({
        title: "Post created successfully! 🎉",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "We couldn't save your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Reply open/close
  // ─────────────────────────────────────────

  const handleOpenReply = (postId: string) => {
    if (!user?.id) {
      toast({
        title: "Please login to reply",
        variant: "destructive",
      });
      return;
    }
    setActiveReplyPostId((prev) => (prev === postId ? null : postId));
    setReplyContent("");
    setReplyIsAnonymous(true);
  };

  // ─────────────────────────────────────────
  // Create Reply  →  /api/community-memory (type: "reply")
  // ─────────────────────────────────────────

  const handleCreateReply = async (postId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Reply can't be empty",
        variant: "destructive",
      });
      return;
    }

    if (!user?.instituteId) {
      toast({
        title: "Error",
        description: "Unable to determine your institute. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const replyAuthorId = user.id;
    const replyAuthorName = replyIsAnonymous
      ? "Anonymous Student"
      : user.name;

    try {
      const res = await fetch("/api/community-memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reply",
          postId,
          content: replyContent,
          isAnonymous: replyIsAnonymous,
          authorId: replyAuthorId,
          author: replyAuthorName,
          instituteId: user.instituteId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save reply");
      }

      const data = await res.json();
      const saved = (data.reply || {}) as CommunityReplyDTO;

      const newReply: Reply = {
        id: saved.id || Date.now().toString(),
        postId: saved.postId || postId,
        content: saved.content || replyContent,
        authorId: saved.authorId || replyAuthorId,
        author: saved.author || replyAuthorName,
        timestamp: new Date(saved.timestamp || saved.createdAt || Date.now()),
        likes: saved.likes ?? 0,
        isAnonymous: saved.isAnonymous ?? replyIsAnonymous,
      };

      setReplies((prev) => [newReply, ...prev]);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, replies: post.replies + 1 } : post
        )
      );

      setReplyContent("");
      setActiveReplyPostId(null);

      toast({
        title: "Reply posted ✅",
        description: "Your reply has been added to the discussion.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "We couldn't save your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Edit Post Handler
  // ─────────────────────────────────────────

  const handleEditPost = async (postId: string) => {
    if (!editContent.title.trim() || !editContent.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/community-memory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "post",
          id: postId,
          authorId: user?.id,
          title: editContent.title,
          content: editContent.content,
          category: editContent.category,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update post");
      }

      const data = await res.json();
      const updated = data.post;

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, title: updated.title, content: updated.content, category: updated.category }
            : post
        )
      );

      setEditingPost(null);
      setEditContent({ title: "", content: "", category: "" });

      toast({
        title: "Post updated ✅",
        description: "Your post has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: "We couldn't update your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Edit Reply Handler
  // ─────────────────────────────────────────

  const handleEditReply = async (replyId: string) => {
    if (!editContent.content.trim()) {
      toast({
        title: "Reply can't be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/community-memory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reply",
          id: replyId,
          authorId: user?.id,
          content: editContent.content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update reply");
      }

      const data = await res.json();
      const updated = data.reply;

      setReplies((prev) =>
        prev.map((reply) =>
          reply.id === replyId ? { ...reply, content: updated.content } : reply
        )
      );

      setEditingReply(null);
      setEditContent({ title: "", content: "", category: "" });

      toast({
        title: "Reply updated ✅",
        description: "Your reply has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: "We couldn't update your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Delete Post Handler
  // ─────────────────────────────────────────

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(
        `/api/community-memory?type=post&id=${postId}&authorId=${user?.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setReplies((prev) => prev.filter((reply) => reply.postId !== postId));
      setDeleteConfirm({ type: null, id: null });

      toast({
        title: "Post deleted ✅",
        description: "Your post has been removed from the community.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Delete Reply Handler
  // ─────────────────────────────────────────

  const handleDeleteReply = async (replyId: string, postId: string) => {
    try {
      const res = await fetch(
        `/api/community-memory?type=reply&id=${replyId}&authorId=${user?.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete reply");
      }

      setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, replies: Math.max(0, post.replies - 1) } : post
        )
      );
      setDeleteConfirm({ type: null, id: null });

      toast({
        title: "Reply deleted ✅",
        description: "Your reply has been removed from the discussion.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─────────────────────────────────────────
  // Likes handlers
  // ─────────────────────────────────────────

  const handleLikeReply = (replyId: string) => {
    setReplies((prev) =>
      prev.map((reply) =>
        reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
      )
    );
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // ─────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Anxiety: "bg-red-100 text-red-800",
      Depression: "bg-purple-100 text-purple-800",
      "Study Tips": "bg-blue-100 text-blue-800",
      "Social Connection": "bg-green-100 text-green-800",
      "Academic Stress": "bg-orange-100 text-orange-800",
      "Sleep Issues": "bg-indigo-100 text-indigo-800",
      Relationships: "bg-pink-100 text-pink-800",
      General: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors["General"];
  };

  const getAuthorInitials = (authorName: string) => {
    if (authorName === "Anonymous Student") return "?";
    return authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // ─────────────────────────────────────────
  // Initial load from backend
  // ─────────────────────────────────────────

  useEffect(() => {
    const loadCommunityData = async () => {
      if (!user?.instituteId) return; // Wait for user data
      
      try {
        const res = await fetch(`/api/community-memory?instituteId=${user.instituteId}&limit=50`);

        if (!res.ok) {
          // Optional: inspect status
          const text = await res.text().catch(() => "");
          console.warn(
            "Failed to load community data. Status:",
            res.status,
            text || "<no body>"
          );
          // User-facing message
          // toast({ title: "Unable to load community posts", variant: "destructive" });
          return;
        }

        const data = (await res.json()) as CommunityDataResponse;

        setPosts(
          (data.posts || []).map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            authorId: p.authorId,
            author: p.author,
            timestamp: new Date(p.timestamp || p.createdAt || Date.now()),
            category: p.category || "General",
            likes: p.likes ?? 0,
            replies: p.repliesCount ?? 0,
            isAnonymous: p.isAnonymous ?? false,
          }))
        );

        setReplies(
          (data.replies || []).map((r) => ({
            id: r.id,
            postId: r.postId,
            content: r.content,
            authorId: r.authorId,
            author: r.author,
            timestamp: new Date(r.timestamp || r.createdAt || Date.now()),
            likes: r.likes ?? 0,
            isAnonymous: r.isAnonymous ?? false,
          }))
        );
      } catch (err) {
        // Network level error only
        console.warn("Error loading community data", err);
        // toast({ title: "Network error", description: "Unable to load community data.", variant: "destructive" });
      }
    };

    loadCommunityData();
  }, [user?.instituteId]);

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary/10 to-wellness/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-wellness to-purple-600 bg-clip-text text-transparent">
                  Community
                </h1>
                <p className="text-sm text-muted-foreground">Connect, share, and support</p>
              </div>
            </div>
            <Button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              size="lg"
              className="bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search discussions by title, content, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Community Guidelines Banner */}
        <Card className="bg-gradient-to-br from-wellness/5 via-blue-50/30 to-purple-50/20 dark:from-wellness/10 dark:via-blue-900/20 dark:to-purple-900/10 border-wellness/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-wellness/10 rounded-xl">
                <Shield className="w-6 h-6 text-wellness" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-wellness mb-3 flex items-center">
                  Community Guidelines
                  <span className="ml-2 text-xs bg-wellness/10 text-wellness px-2 py-1 rounded-full">Safe Space</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wellness"></div>
                    <span>Be kind, respectful, and supportive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wellness"></div>
                    <span>Maintain confidentiality and privacy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wellness"></div>
                    <span>No personal attacks or discrimination</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wellness"></div>
                    <span>Share resources and encouragement</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Post Form */}
        {showNewPostForm && (
          <Card className="border-2 border-primary/20 shadow-xl animate-in slide-in-from-top duration-300">
            <CardHeader className="bg-gradient-to-br from-primary/5 to-wellness/5">
              <CardTitle className="text-xl flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                Start a New Discussion
              </CardTitle>
              <CardDescription className="text-base">
                Share your thoughts or ask for support from the community
              </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      placeholder="What's on your mind?"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Share your thoughts, experiences, or questions..."
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                      className="min-h-[140px] resize-none rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={newPost.category}
                        onChange={(e) =>
                          setNewPost({ ...newPost, category: e.target.value })
                        }
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={newPost.isAnonymous}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              isAnonymous: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-sm font-medium">Post anonymously</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleCreatePost}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Post
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowNewPostForm(false)}
                    className="h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-16">
                  <div className="text-center">
                    <div className="inline-flex p-4 bg-gradient-to-br from-primary/10 to-wellness/10 rounded-2xl mb-4">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No discussions yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to start a meaningful conversation!
                    </p>
                    <Button 
                      onClick={() => setShowNewPostForm(true)}
                      className="bg-gradient-to-r from-primary to-wellness"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const postReplies = replies.filter(
                  (r) => r.postId === post.id
                );

                return (
                  <Card
                    key={post.id}
                    className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-wellness/20 text-primary font-semibold text-lg">
                            {post.isAnonymous
                              ? "?"
                              : getAuthorInitials(post.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {editingPost === post.id ? (
                            /* EDIT MODE: Show edit form */
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                              <Input
                                placeholder="Post title..."
                                value={editContent.title}
                                onChange={(e) =>
                                  setEditContent((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="font-semibold"
                              />
                              <Textarea
                                placeholder="What's on your mind?"
                                value={editContent.content}
                                onChange={(e) =>
                                  setEditContent((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                  }))
                                }
                                className="min-h-[120px] resize-none"
                              />
                              <Select
                                value={editContent.category}
                                onValueChange={(value) =>
                                  setEditContent((prev) => ({
                                    ...prev,
                                    category: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="General">
                                    General Discussion
                                  </SelectItem>
                                  <SelectItem value="Mental Health">
                                    Mental Health
                                  </SelectItem>
                                  <SelectItem value="Relationships">
                                    Relationships
                                  </SelectItem>
                                  <SelectItem value="Academics">
                                    Academics
                                  </SelectItem>
                                  <SelectItem value="Career">
                                    Career
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditPost(post.id)}
                                >
                                  Save Changes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingPost(null);
                                    setEditContent({
                                      title: "",
                                      content: "",
                                      category: "",
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* VIEW MODE: Show post content */
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center flex-wrap gap-2">
                                  <Badge
                                    className={`${getCategoryColor(
                                      post.category
                                    )} text-xs font-medium px-3 py-1 rounded-full`}
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {post.category}
                                  </Badge>
                                  <span className="text-sm font-medium text-foreground">
                                    {post.author}
                                  </span>
                                  <span className="text-gray-300 dark:text-gray-600">•</span>
                                  <span className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {getTimeAgo(post.timestamp)}
                                  </span>
                                </div>

                                {/* Dropdown menu for post author */}
                                {post.authorId === user?.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingPost(post.id);
                                          setEditContent({
                                            title: post.title,
                                            content: post.content,
                                            category: post.category,
                                          });
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive cursor-pointer focus:text-destructive"
                                        onClick={() =>
                                          setDeleteConfirm({
                                            type: "post",
                                            id: post.id,
                                          })
                                        }
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className="text-muted-foreground hover:text-wellness hover:bg-wellness/10 rounded-xl transition-all"
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              <span className="font-medium">{post.likes}</span>
                              <span className="hidden sm:inline ml-1">likes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReply(post.id)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            >
                              <ReplyIcon className="w-4 h-4 mr-2" />
                              <span className="font-medium">{postReplies.length}</span>
                              <span className="hidden sm:inline ml-1">replies</span>
                            </Button>
                          </div>
                          </>
                          )}

                          {/* Reply form (sirf active post ke niche) */}
                          {activeReplyPostId === post.id && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
                              <Textarea
                                placeholder="Share your thoughts..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                className="min-h-[100px] resize-none rounded-xl border-gray-200 dark:border-gray-700"
                              />
                              <div className="flex items-center justify-between gap-3 pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    id={`reply-anon-${post.id}`}
                                    checked={replyIsAnonymous}
                                    onChange={(e) =>
                                      setReplyIsAnonymous(e.target.checked)
                                    }
                                    className="w-4 h-4 rounded accent-primary"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    Reply anonymously
                                  </span>
                                </label>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateReply(post.id)}
                                    className="bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 rounded-lg"
                                  >
                                    Post Reply
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setActiveReplyPostId(null)}
                                    className="rounded-lg"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Replies List */}
                          {postReplies.length > 0 && (
                            <div className="mt-6 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                              {postReplies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                  <Avatar className="w-9 h-9 ring-2 ring-wellness/10">
                                    <AvatarFallback className="bg-gradient-to-br from-wellness/20 to-primary/20 text-primary text-xs font-semibold">
                                      {reply.isAnonymous
                                        ? "?"
                                        : getAuthorInitials(reply.author)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    {editingReply === reply.id ? (
                                      /* EDIT MODE for reply */
                                      <div className="space-y-2">
                                        <Textarea
                                          placeholder="Edit your reply..."
                                          value={editContent.content}
                                          onChange={(e) =>
                                            setEditContent((prev) => ({
                                              ...prev,
                                              content: e.target.value,
                                            }))
                                          }
                                          className="min-h-[80px] resize-none text-sm"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleEditReply(reply.id)
                                            }
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setEditingReply(null);
                                              setEditContent({
                                                title: "",
                                                content: "",
                                                category: "",
                                              });
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* VIEW MODE for reply */
                                      <>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                              {reply.isAnonymous
                                                ? "Anonymous Student"
                                                : reply.author}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              {getTimeAgo(reply.timestamp)}
                                            </span>
                                          </div>

                                          {/* Dropdown for reply author */}
                                          {reply.authorId === user?.id && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <MoreVertical className="h-3 w-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                  onClick={() => {
                                                    setEditingReply(reply.id);
                                                    setEditContent({
                                                      title: "",
                                                      content: reply.content,
                                                      category: "",
                                                    });
                                                  }}
                                                >
                                                  <Edit2 className="mr-2 h-4 w-4" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  className="text-destructive"
                                                  onClick={() =>
                                                    setDeleteConfirm({
                                                      type: "reply",
                                                      id: reply.id,
                                                      postId: post.id,
                                                    })
                                                  }
                                                >
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                    <p className="mb-2 text-foreground text-sm leading-relaxed">
                                      {reply.content}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleLikeReply(reply.id)
                                      }
                                      className="text-muted-foreground hover:text-wellness hover:bg-wellness/10 rounded-lg h-7 px-2"
                                    >
                                      <ThumbsUp className="w-3 h-3 mr-1.5" />
                                      <span className="text-xs font-medium">{reply.likes}</span>
                                    </Button>
                                    </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.type !== null}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ type: null, id: null })
        }
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete this{" "}
              {deleteConfirm.type === "post" ? "post" : "reply"}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
              onClick={() => {
                if (deleteConfirm.type === "post" && deleteConfirm.id) {
                  handleDeletePost(deleteConfirm.id);
                } else if (
                  deleteConfirm.type === "reply" &&
                  deleteConfirm.id &&
                  deleteConfirm.postId
                ) {
                  handleDeleteReply(deleteConfirm.id, deleteConfirm.postId);
                }
              }}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PeerForum;
