"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  Calendar,
  Search,
  Filter,
  Clock,
  Flag,
  Tag,
  ListTodo,
  CheckCircle2,
  Circle,
  AlertCircle,
  Bell
} from "lucide-react";

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskCategory = 'personal' | 'academic' | 'health' | 'work' | 'other';
type TaskStatus = 'pending' | 'in-progress' | 'completed';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const TodoList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    category: "personal" as TaskCategory,
    dueDate: ""
  });

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Check for upcoming tasks and send notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const upcomingTasks = tasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Notify 24 hours before and 1 hour before
        return (hoursDiff > 0 && hoursDiff <= 24) || (hoursDiff > 0 && hoursDiff <= 1);
      });

      upcomingTasks.forEach(task => {
        const dueDate = new Date(task.dueDate!);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        let notificationSent = false;
        const storageKey = `notification_${task.id}_${hoursDiff < 2 ? '1h' : '24h'}`;
        
        if (!localStorage.getItem(storageKey)) {
          const timeText = hoursDiff < 2 ? 'in 1 hour' : 'in 24 hours';
          
          new Notification('Task Reminder', {
            body: `"${task.title}" is due ${timeText}!`,
            icon: '/mann-mitra-icon.png',
            badge: '/mann-mitra-icon.png',
            tag: task.id,
            requireInteraction: false
          });
          
          localStorage.setItem(storageKey, 'sent');
          notificationSent = true;
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [tasks, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll receive reminders for upcoming tasks.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Enable notifications in your browser settings.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Load tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem(`tasks_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed.map((t: Task) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined
        })));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }, [user?.id]);

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem(`tasks_${user?.id}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: 'pending',
      dueDate: newTask.dueDate || undefined,
      completed: false,
      createdAt: new Date(),
    };

    const updated = [task, ...tasks];
    saveTasks(updated);

    toast({
      title: "Task Created",
      description: "Your task has been added to the list.",
      duration: 2000,
    });

    setNewTask({ title: "", description: "", priority: "medium", category: "personal", dueDate: "" });
    setIsCreating(false);
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        return {
          ...t,
          completed: isCompleting,
          status: isCompleting ? 'completed' as TaskStatus : 'pending' as TaskStatus,
          completedAt: isCompleting ? new Date() : undefined
        };
      }
      return t;
    });
    saveTasks(updated);

    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toast({
        title: "Task Completed! 🎉",
        description: "Great job! Keep up the momentum.",
        duration: 2000,
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);

    toast({
      title: "Task Deleted",
      description: "The task has been removed from your list.",
      duration: 2000,
    });
  };

  const handleUpdateTask = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id 
        ? { ...t, ...newTask, createdAt: t.createdAt, completedAt: t.completedAt }
        : t
    );
    saveTasks(updated);

    toast({
      title: "Task Updated",
      description: "Your changes have been saved.",
      duration: 2000,
    });

    setEditingId(null);
    setNewTask({ title: "", description: "", priority: "medium", category: "personal", dueDate: "" });
  };

  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    saveTasks(updated);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setNewTask({ title: "", description: "", priority: "medium", category: "personal", dueDate: "" });
  };

  // Filtering logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  // Priority styling
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'high': return <Flag className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Flag className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Flag className="w-4 h-4 text-green-600" />;
    }
  };

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'health': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'work': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'personal': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus, completed: boolean) => {
    if (completed) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed && t.status === 'pending').length,
    inProgress: tasks.filter(t => !t.completed && t.status === 'in-progress').length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
  };

  return (
    <div className="space-y-4">
      {/* Header with Statistics */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1">
              <CardTitle className="text-xl lg:text-2xl flex items-center">
                <ListTodo className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" />
                My Tasks & To-Do List
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Stay organized and track your daily tasks
              </CardDescription>
            </div>
            {!isCreating && !editingId && (
              <div className="flex flex-wrap gap-2">
                {!notificationsEnabled && (
                  <Button 
                    onClick={requestNotificationPermission}
                    variant="outline"
                    className="border-blue-300 flex-1 sm:flex-none"
                    title="Enable task reminders"
                    size="sm"
                  >
                    <Bell className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Enable Reminders</span>
                  </Button>
                )}
                {notificationsEnabled && (
                  <Button 
                    variant="outline"
                    className="border-green-300 bg-green-50 flex-1 sm:flex-none"
                    disabled
                    title="Reminders are active"
                    size="sm"
                  >
                    <Bell className="w-4 h-4 sm:mr-2 text-green-600" />
                    <span className="hidden sm:inline">Reminders On</span>
                  </Button>
                )}
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/80 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white/80 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="bg-white/80 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="bg-white/80 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="bg-white/80 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Edit Task' : 'New Task'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add more details about this task..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as TaskPriority })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value as TaskCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={editingId ? () => handleUpdateTask(editingId) : handleCreateTask}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'} Task
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
      {!isCreating && !editingId && tasks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10"
                />
              </div>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="flex-1 sm:flex-none"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                  className="flex-1 sm:flex-none"
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === "in-progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("in-progress")}
                  className="flex-1 sm:flex-none"
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("completed")}
                  className="flex-1 sm:flex-none"
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {!isCreating && !editingId && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || filterPriority !== "all" || filterCategory !== "all" || filterStatus !== "all"
                    ? 'No tasks match your filters'
                    : 'No tasks yet. Create your first task to get started!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className={`hover:shadow-md transition-shadow ${task.completed ? 'opacity-60' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(task.status, task.completed)}
                            <h3 className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h3>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2 break-words">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {getPriorityIcon(task.priority)}
                              <span className="ml-1 capitalize">{task.priority}</span>
                            </Badge>
                            
                            <Badge variant="outline" className={getCategoryColor(task.category)}>
                              <Tag className="w-3 h-3 mr-1" />
                              <span className="capitalize">{task.category}</span>
                            </Badge>
                            
                            {task.dueDate && (
                              <Badge 
                                variant="outline" 
                                className={new Date(task.dueDate) < new Date() && !task.completed
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Badge>
                            )}

                            {!task.completed && (
                              <Select value={task.status} onValueChange={(value) => handleUpdateStatus(task.id, value as TaskStatus)}>
                                <SelectTrigger className="w-full sm:w-[130px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1 w-full sm:w-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(task)}
                            disabled={task.completed}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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

export default TodoList;
