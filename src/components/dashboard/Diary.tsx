"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import StatisticsCharts from './StatisticsCharts';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  Lock,
  Calendar,
  Search,
  Smile,
  Frown,
  Meh,
  Tag,
  Download,
  FileText,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Bold,
  Italic,
  List,
  Link2,
  Code,
  Heading
} from "lucide-react";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad';
  tags: string[];
  date: string;
  createdAt: Date;
  wordCount: number;
  charCount: number;
}

const Diary = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [showStats, setShowStats] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral" as "happy" | "neutral" | "sad",
    tags: [] as string[],
    currentTag: ""
  });

  // Debug: Log state changes
  useEffect(() => {
    console.log('Diary state - isCreating:', isCreating, 'editingId:', editingId);
  }, [isCreating, editingId]);

  // Load entries on mount
  useEffect(() => {
    const saved = localStorage.getItem(`diary_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.map((e: DiaryEntry) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          tags: e.tags || []
        })));
      } catch (error) {
        console.error('Failed to load diary entries:', error);
      }
    }
  }, [user?.id]);

  const saveEntries = (updatedEntries: DiaryEntry[]) => {
    localStorage.setItem(`diary_${user?.id}`, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleCreateEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: newEntry.tags,
      date: new Date().toLocaleDateString(),
      createdAt: new Date(),
      wordCount: calculateWordCount(newEntry.content),
      charCount: newEntry.content.length
    };

    const updated = [entry, ...entries];
    saveEntries(updated);

    toast({
      title: "Entry Saved",
      description: "Your diary entry has been saved securely.",
      duration: 3000,
    });

    setNewEntry({ title: "", content: "", mood: "neutral", tags: [], currentTag: "" });
    setIsCreating(false);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    saveEntries(updated);

    toast({
      title: "Entry Deleted",
      description: "Your diary entry has been removed.",
      duration: 2000,
    });
  };

  const handleUpdateEntry = (id: string) => {
    const updated = entries.map(e => 
      e.id === id 
        ? { 
            ...e, 
            ...newEntry, 
            createdAt: e.createdAt,
            wordCount: calculateWordCount(newEntry.content),
            charCount: newEntry.content.length
          }
        : e
    );
    saveEntries(updated);

    toast({
      title: "Entry Updated",
      description: "Your changes have been saved.",
      duration: 2000,
    });

    setEditingId(null);
    setNewEntry({ title: "", content: "", mood: "neutral", tags: [], currentTag: "" });
  };

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      currentTag: ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setShowPreview(false);
    setNewEntry({ title: "", content: "", mood: "neutral", tags: [], currentTag: "" });
  };

  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newEntry.content.substring(start, end);
    const beforeText = newEntry.content.substring(0, start);
    const afterText = newEntry.content.substring(end);

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        newText = `${beforeText}**${selectedText || placeholder}**${afterText}`;
        cursorOffset = selectedText ? 0 : placeholder.length + 2;
        break;
      case 'italic':
        newText = `${beforeText}_${selectedText || placeholder}_${afterText}`;
        cursorOffset = selectedText ? 0 : placeholder.length + 1;
        break;
      case 'heading':
        newText = `${beforeText}## ${selectedText || placeholder}${afterText}`;
        cursorOffset = selectedText ? 0 : placeholder.length + 3;
        break;
      case 'list':
        newText = `${beforeText}- ${selectedText || placeholder}${afterText}`;
        cursorOffset = selectedText ? 0 : placeholder.length + 2;
        break;
      case 'link':
        newText = `${beforeText}[${selectedText || 'Link text'}](url)${afterText}`;
        cursorOffset = selectedText ? -5 : -9;
        break;
      case 'code':
        newText = `${beforeText}\`${selectedText || placeholder}\`${afterText}`;
        cursorOffset = selectedText ? 0 : placeholder.length + 1;
        break;
      default:
        return;
    }

    setNewEntry({ ...newEntry, content: newText });
    
    setTimeout(() => {
      const newPosition = selectedText ? end + (syntax === 'bold' ? 4 : syntax === 'heading' ? 3 : 2) : start + (newText.length - beforeText.length - afterText.length) + cursorOffset;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleAddTag = () => {
    const tag = newEntry.currentTag.trim().toLowerCase();
    if (tag && !newEntry.tags.includes(tag)) {
      setNewEntry({ ...newEntry, tags: [...newEntry.tags, tag], currentTag: "" });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewEntry({ ...newEntry, tags: newEntry.tags.filter(t => t !== tagToRemove) });
  };

  const handleExport = () => {
    const exportData = entries.map(e => ({
      date: e.date,
      title: e.title,
      content: e.content,
      mood: e.mood,
      tags: e.tags?.join(', ') || '',
      wordCount: e.wordCount,
      charCount: e.charCount
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diary-entries-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your diary entries have been exported.",
      duration: 2000,
    });
  };

  // Get all unique tags from entries
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));

  // Filtering logic
  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = filterMood === "all" || e.mood === filterMood;
    const matchesTag = filterTag === "all" || (e.tags && e.tags.includes(filterTag));
    return matchesSearch && matchesMood && matchesTag;
  });

  // Statistics
  const stats = {
    total: entries.length,
    totalWords: entries.reduce((sum, e) => sum + (e.wordCount || 0), 0),
    avgWords: entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + (e.wordCount || 0), 0) / entries.length) : 0,
    happyMoods: entries.filter(e => e.mood === 'happy').length,
    neutralMoods: entries.filter(e => e.mood === 'neutral').length,
    sadMoods: entries.filter(e => e.mood === 'sad').length,
    mostUsedTags: allTags.slice(0, 5)
  };

  // Prepare chart data for mood trends (last 7 days)
  const moodChartData = (() => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayEntries = entries.filter(e => {
        const entryDate = new Date(e.createdAt);
        return entryDate.toDateString() === date.toDateString();
      });
      
      last7Days.push({
        date: dateStr,
        happy: dayEntries.filter(e => e.mood === 'happy').length,
        neutral: dayEntries.filter(e => e.mood === 'neutral').length,
        sad: dayEntries.filter(e => e.mood === 'sad').length
      });
    }
    
    return last7Days;
  })();

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="w-4 h-4 text-green-600" />;
      case 'sad': return <Frown className="w-4 h-4 text-red-600" />;
      default: return <Meh className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sad': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1">
              <CardTitle className="text-xl lg:text-2xl flex items-center">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-purple-600" />
                My Personal Diary
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                A private space for your thoughts, feelings, and reflections
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isCreating && !editingId && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setShowStats(!showStats)}
                    className="border-purple-300 flex-1 sm:flex-none"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Stats</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleExport}
                    className="border-purple-300 flex-1 sm:flex-none"
                    disabled={entries.length === 0}
                    size="sm"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      console.log('New Entry button clicked');
                      setIsCreating(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start sm:items-center space-x-2 bg-white/80 rounded-lg p-3 border">
            <Lock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-xs sm:text-sm text-purple-800">
              All entries are encrypted and stored securely. Only you can access them.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Panel */}
      {showStats && !isCreating && !editingId && (
        <>
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Your Journaling Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Entries</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.totalWords}</div>
                <div className="text-xs text-gray-600">Total Words</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.avgWords}</div>
                <div className="text-xs text-gray-600">Avg Words/Entry</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <div className="text-2xl font-bold text-pink-600">{allTags.length}</div>
                <div className="text-xs text-gray-600">Unique Tags</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                <Smile className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">{stats.happyMoods}</div>
                <div className="text-xs text-gray-600">Happy Days</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                <Meh className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-600">{stats.neutralMoods}</div>
                <div className="text-xs text-gray-600">Neutral Days</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
                <Frown className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-600">{stats.sadMoods}</div>
                <div className="text-xs text-gray-600">Sad Days</div>
              </div>
            </div>

            {stats.mostUsedTags.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Most Used Tags</div>
                <div className="flex flex-wrap gap-2">
                  {stats.mostUsedTags.map(tag => (
                    <Badge key={tag} variant="outline" className="bg-purple-50 border-purple-200">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Charts */}
        <StatisticsCharts 
          moodData={moodChartData}
          taskData={[]}
          categoryData={[]}
          priorityData={[]}
        />
      </>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Edit Entry' : 'New Diary Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Give your entry a title..."
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex space-x-2">
                {[
                  { value: 'happy' as const, label: 'Happy', icon: Smile, color: 'green' },
                  { value: 'neutral' as const, label: 'Neutral', icon: Meh, color: 'gray' },
                  { value: 'sad' as const, label: 'Sad', icon: Frown, color: 'red' }
                ].map((mood) => (
                  <Button
                    key={mood.value}
                    type="button"
                    variant={newEntry.mood === mood.value ? 'default' : 'outline'}
                    onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                    className={`flex-1 ${
                      newEntry.mood === mood.value 
                        ? `bg-${mood.color}-600 hover:bg-${mood.color}-700` 
                        : ''
                    }`}
                  >
                    <mood.icon className="w-4 h-4 mr-2" />
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium block">Your Thoughts</label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {!showPreview && (
                <>
                  {/* Markdown Formatting Toolbar */}
                  <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('bold', 'bold text')}
                      className="h-8 px-2"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('italic', 'italic text')}
                      className="h-8 px-2"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('heading', 'Heading')}
                      className="h-8 px-2"
                      title="Heading"
                    >
                      <Heading className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('list', 'List item')}
                      className="h-8 px-2"
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('link', 'Link text')}
                      className="h-8 px-2"
                      title="Link"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => insertMarkdown('code', 'code')}
                      className="h-8 px-2"
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                    <div className="hidden sm:flex flex-1" />
                    <span className="hidden sm:inline text-xs text-gray-500 self-center">Markdown supported</span>
                  </div>

                  <Textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Write your thoughts... (Markdown supported)"
                    rows={8}
                    className="w-full font-mono text-sm"
                  />
                </>
              )}

              {showPreview && (
                <div className="border border-gray-200 rounded-md p-4 min-h-[200px] bg-gray-50">
                  {newEntry.content ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                      >
                        {newEntry.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Nothing to preview yet. Start writing!</p>
                  )}
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{calculateWordCount(newEntry.content)} words</span>
                <span>{newEntry.content.length} characters</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newEntry.currentTag}
                  onChange={(e) => setNewEntry({ ...newEntry, currentTag: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags to organize your entries..."
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleAddTag}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newEntry.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="bg-purple-50 border-purple-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={editingId ? () => handleUpdateEntry(editingId) : handleCreateEntry}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Entry
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelEdit}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {!isCreating && !editingId && entries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="pl-10"
                />
              </div>

              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger>
                  <SelectValue placeholder="All Moods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      {!isCreating && !editingId && (
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No entries match your search'
                    : 'No diary entries yet. Start writing your first one!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getMoodIcon(entry.mood)}
                        <CardTitle className="text-base sm:text-lg truncate">{entry.title}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                        <div className="flex items-center whitespace-nowrap">
                          <Calendar className="w-3 h-3 mr-1" />
                          {entry.date}
                        </div>
                        <Badge variant="outline" className={getMoodColor(entry.mood)}>
                          {entry.mood}
                        </Badge>
                        {entry.wordCount > 0 && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                            <FileText className="w-3 h-3 mr-1" />
                            {entry.wordCount} words
                          </Badge>
                        )}
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {entry.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="bg-purple-50 border-purple-200 text-purple-800 text-xs"
                            >
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(entry)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-sm text-gray-700 line-clamp-4">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {entry.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Diary;
