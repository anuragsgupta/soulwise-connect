"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Reply, 
  Plus, 
  Search,
  Clock,
  ThumbsUp,
  Tag,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
  id: string;
  title: string;
  content: string;
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
  author: string;
  timestamp: Date;
  likes: number;
  isAnonymous: boolean;
}

const PeerForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Dealing with exam anxiety - anyone else feeling this?',
      content: 'Hi everyone, I\'ve been struggling with severe anxiety before exams. My heart races and I can\'t think clearly. Has anyone found techniques that actually work?',
      author: 'Anonymous Student',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'Anxiety',
      likes: 12,
      replies: 8,
      isAnonymous: true
    },
    {
      id: '2',
      title: 'Study group for mental health support?',
      content: 'Would anyone be interested in forming a study group that also focuses on supporting each other\'s mental health? I think studying together while checking in on each other could be really beneficial.',
      author: 'Sarah M.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      category: 'Study Tips',
      likes: 18,
      replies: 15,
      isAnonymous: false
    },
    {
      id: '3',
      title: 'Feeling isolated - how to make connections?',
      content: 'I\'m in my second year but still feel like I don\'t have real friends here. The pandemic really affected my social skills. Any advice on building genuine connections?',
      author: 'Anonymous Student',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'Social Connection',
      likes: 25,
      replies: 22,
      isAnonymous: true
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    isAnonymous: true
  });

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const categories = [
    'General', 'Anxiety', 'Depression', 'Study Tips', 
    'Social Connection', 'Academic Stress', 'Sleep Issues', 'Relationships'
  ];

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both title and content are required to create a post.",
        variant: "destructive"
      });
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: newPost.isAnonymous ? 'Anonymous Student' : 'You',
      timestamp: new Date(),
      category: newPost.category,
      likes: 0,
      replies: 0,
      isAnonymous: newPost.isAnonymous
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', category: 'General', isAnonymous: true });
    setShowNewPostForm(false);

    toast({
      title: "Post created successfully! 🎉",
      description: "Your post has been shared with the community.",
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => 
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
    return 'Just now';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Anxiety': 'bg-red-100 text-red-800',
      'Depression': 'bg-purple-100 text-purple-800',
      'Study Tips': 'bg-blue-100 text-blue-800',
      'Social Connection': 'bg-green-100 text-green-800',
      'Academic Stress': 'bg-orange-100 text-orange-800',
      'Sleep Issues': 'bg-indigo-100 text-indigo-800',
      'Relationships': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Users className="w-6 h-6 mr-3 text-primary animate-pulse-soft" />
            Peer Support Community
          </CardTitle>
          <CardDescription>
            Connect with fellow students in a safe, anonymous space. Share experiences, offer support, and learn from each other.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Community Guidelines */}
          <Card className="bg-wellness-light/20 border-wellness/20 mb-6">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-wellness mt-0.5" />
                <div>
                  <h3 className="font-semibold text-wellness mb-2">Community Guidelines</h3>
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
                <CardTitle className="text-lg">Start a New Discussion</CardTitle>
                <CardDescription>Share your thoughts or ask for support from the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Discussion title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={newPost.isAnonymous}
                      onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                      Post anonymously
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} className="bg-primary hover:bg-primary/90">
                    Create Post
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
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
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No discussions found</h3>
                <p className="text-muted-foreground">Be the first to start a conversation!</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.isAnonymous ? '?' : post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getCategoryColor(post.category)} text-xs`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {post.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {post.author}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
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
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            {post.replies} replies
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerForum;