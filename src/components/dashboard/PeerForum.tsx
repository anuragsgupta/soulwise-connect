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
  Users,
  Reply as ReplyIcon, // icon ko alias kiya (Reply interface se clash na ho)
  Plus,
  Search,
  Clock,
  ThumbsUp,
  Tag,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CURRENT_USER_ID = "user_456_student"; // yahi se pata chalega kaun login hai
const CURRENT_USERNAME = "Jane Doe";

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
  // Ab dummy data nahi, backend se load hoga
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
    isAnonymous: true,
  });

  // 🔹 Reply form ke liye state
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(
    null
  );
  const [replyContent, setReplyContent] = useState("");
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(true);

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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

    const postAuthorId = CURRENT_USER_ID;
    const postAuthorName = newPost.isAnonymous
      ? "Anonymous Student"
      : CURRENT_USERNAME;

    try {
      const res = await fetch("/api/community-memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "post",
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          isAnonymous: newPost.isAnonymous,
          authorId: postAuthorId,
          author: postAuthorName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save post");
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
    if (!CURRENT_USER_ID) {
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
        title: "Reply can’t be empty",
        variant: "destructive",
      });
      return;
    }

    const replyAuthorId = CURRENT_USER_ID;
    const replyAuthorName = replyIsAnonymous
      ? "Anonymous Student"
      : CURRENT_USERNAME;

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
      try {
        const res = await fetch("/api/community-memory?limit=50");

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
  }, []);

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Users className="w-6 h-6 mr-3 text-primary animate-pulse-soft" />
            Peer Support Community
          </CardTitle>
          <CardDescription>
            Connect with fellow students in a safe, anonymous space. Share
            experiences, offer support, and learn from each other.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Community Guidelines */}
          <Card className="bg-wellness-light/20 border-wellness/20 mb-6">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-wellness mt-0.5" />
                <div>
                  <h3 className="font-semibold text-wellness mb-2">
                    Community Guidelines
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be kind, respectful, and supportive</li>
                    <li>• Maintain confidentiality and respect privacy</li>
                    <li>• No personal attacks or discrimination</li>
                    <li>• Share resources and encouragement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Create Post */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPostForm && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  Start a New Discussion
                </CardTitle>
                <CardDescription>
                  Share your thoughts or ask for support from the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Discussion title..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="min-h-[120px] resize-none"
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
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
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm text-muted-foreground"
                    >
                      Post anonymously
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreatePost}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Post
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPostForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No discussions found
                </h3>
                <p className="text-muted-foreground">
                  Be the first to start a conversation!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postReplies = replies.filter(
                  (r) => r.postId === post.id
                );

                return (
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.isAnonymous
                              ? "?"
                              : getAuthorInitials(post.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              className={`${getCategoryColor(
                                post.category
                              )} text-xs`}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {post.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by {post.author}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeAgo(post.timestamp)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className="text-muted-foreground hover:text-wellness"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReply(post.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ReplyIcon className="w-4 h-4 mr-1" />
                              {postReplies.length} replies
                            </Button>
                          </div>

                          {/* Reply form (sirf active post ke niche) */}
                          {activeReplyPostId === post.id && (
                            <div className="mt-4 space-y-2">
                              <Textarea
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                className="min-h-[80px] resize-none"
                              />
                              <div className="flex items-center gap-3">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`reply-anon-${post.id}`}
                                    checked={replyIsAnonymous}
                                    onChange={(e) =>
                                      setReplyIsAnonymous(e.target.checked)
                                    }
                                    className="w-4 h-4"
                                  />
                                  <label
                                    htmlFor={`reply-anon-${post.id}`}
                                    className="text-xs text-muted-foreground"
                                  >
                                    Reply anonymously
                                  </label>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleCreateReply(post.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Post reply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActiveReplyPostId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Replies List */}
                          {postReplies.length > 0 && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              {postReplies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start space-x-3 text-sm"
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                      {reply.isAnonymous
                                        ? "?"
                                        : getAuthorInitials(reply.author)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                      <span>
                                        {reply.isAnonymous
                                          ? "Anonymous Student"
                                          : reply.author}
                                      </span>
                                      <span>•</span>
                                      <span>{getTimeAgo(reply.timestamp)}</span>
                                    </div>
                                    <p className="mb-1 text-foreground">
                                      {reply.content}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleLikeReply(reply.id)
                                      }
                                      className="text-muted-foreground hover:text-wellness"
                                    >
                                      <ThumbsUp className="w-3 h-3 mr-1" />
                                      {reply.likes}
                                    </Button>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerForum;
