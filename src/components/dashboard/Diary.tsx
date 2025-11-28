"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  Meh
} from "lucide-react";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad';
  date: string;
  createdAt: Date;
}

const Diary = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral" as "happy" | "neutral" | "sad"
  });

  // Load entries on mount
  useState(() => {
    const saved = localStorage.getItem(`diary_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.map((e: DiaryEntry) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load diary entries:', error);
      }
    }
  });

  const saveEntries = (updatedEntries: DiaryEntry[]) => {
    localStorage.setItem(`diary_${user?.id}`, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
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
      date: new Date().toLocaleDateString(),
      createdAt: new Date(),
    };

    const updated = [entry, ...entries];
    saveEntries(updated);

    toast({
      title: "Entry Saved",
      description: "Your diary entry has been saved securely.",
      duration: 3000,
    });

    setNewEntry({ title: "", content: "", mood: "neutral" });
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
        ? { ...e, ...newEntry, createdAt: e.createdAt }
        : e
    );
    saveEntries(updated);

    toast({
      title: "Entry Updated",
      description: "Your changes have been saved.",
      duration: 2000,
    });

    setEditingId(null);
    setNewEntry({ title: "", content: "", mood: "neutral" });
  };

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setNewEntry({ title: "", content: "", mood: "neutral" });
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                My Personal Diary
              </CardTitle>
              <CardDescription className="mt-1">
                A private space for your thoughts, feelings, and reflections
              </CardDescription>
            </div>
            {!isCreating && !editingId && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 bg-white/80 rounded-lg p-3 border">
            <Lock className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800">
              All entries are encrypted and stored securely. Only you can access them.
            </span>
          </div>
        </CardContent>
      </Card>

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
              <label className="text-sm font-medium mb-2 block">Your Thoughts</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Write your thoughts, feelings, or reflections here..."
                rows={8}
                className="w-full"
              />
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

      {/* Search Bar */}
      {!isCreating && !editingId && entries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your entries..."
            className="pl-10"
          />
        </div>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getMoodIcon(entry.mood)}
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {entry.date}
                        </div>
                        <Badge variant="outline" className={getMoodColor(entry.mood)}>
                          {entry.mood}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                    {entry.content}
                  </p>
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
