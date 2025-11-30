# 🔔 Notification Bell Integration Guide

## Quick Integration Steps

### 1. Import the Component

Add this import at the top of your dashboard files:

```tsx
import NotificationBell from "@/components/notifications/NotificationBell";
```

### 2. Add to Student Dashboard

**File:** `src/components/dashboard/StudentDashboard.tsx`

Find the header section (around line 280-300 where you have the logout button) and add:

```tsx
{/* Header */}
<div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image src={mannMitraLogo} alt="Mann Mitra" width={50} height={50} />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Student'}!</h1>
          <p className="text-teal-100">Your mental wellness companion</p>
        </div>
      </div>
      
      {/* ADD THIS SECTION */}
      <div className="flex items-center gap-3">
        <NotificationBell />  {/* <-- Add notification bell */}
        <Button 
          variant="outline" 
          className="bg-white text-teal-600"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  </div>
</div>
```

### 3. Add to Faculty Dashboard

**File:** `src/components/faculty/FacultyDashboard.tsx`

Find the header section and add the notification bell:

```tsx
<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-blue-100 mt-1">Manage your students and sessions</p>
      </div>
      
      {/* ADD THIS SECTION */}
      <div className="flex items-center gap-3">
        <NotificationBell />  {/* <-- Add notification bell */}
        <Button variant="outline" className="bg-white text-blue-600">
          Logout
        </Button>
      </div>
    </div>
  </div>
</div>
```

### 4. Add Session Booking Button (Student Dashboard)

Add a new card in the main dashboard view:

```tsx
{/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Existing cards... */}
  
  {/* NEW: Book Session Card */}
  <Card 
    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
    onClick={() => setActiveTab('sessions')}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Book a Session</CardTitle>
      <Calendar className="h-5 w-5 text-teal-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">Schedule</div>
      <p className="text-xs text-muted-foreground mt-1">
        Meet with faculty, mentors, or HODs
      </p>
      <Button className="w-full mt-4" size="sm">
        Book Now
      </Button>
    </CardContent>
  </Card>
</div>
```

### 5. Add Session Management Button (Faculty Dashboard)

Add to the quick actions section:

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Existing cards... */}
  
  {/* NEW: Manage Sessions Card */}
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Session Requests</CardTitle>
      <CalendarClock className="h-5 w-5 text-blue-600" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{pendingSessionsCount}</div>
      <p className="text-xs text-muted-foreground">Pending requests</p>
      <Button 
        className="w-full mt-4" 
        size="sm"
        onClick={() => router.push('/faculty/sessions')}
      >
        Manage Sessions
      </Button>
    </CardContent>
  </Card>
</div>
```

### 6. Add Navigation Tab (Student)

Add to the tab navigation:

```tsx
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Heart },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  // ... existing tabs ...
  { id: 'sessions', label: 'Sessions', icon: Calendar },  // <-- Add this
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

// Then add the content:
{activeTab === 'sessions' && (
  <div className="space-y-6">
    <BookSession />
  </div>
)}
```

## Complete Example: StudentDashboard Header

Here's a complete example of what your header should look like:

```tsx
import NotificationBell from "@/components/notifications/NotificationBell";
import BookSession from "@/components/sessions/BookSession";
import { Calendar } from "lucide-react";

// In your component:
const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

return (
  <div className="min-h-screen bg-gray-50">
    {/* Header with Notification Bell */}
    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src={mannMitraLogo} alt="Mann Mitra" width={50} height={50} />
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Student'}!</h1>
              <p className="text-teal-100">Your mental wellness companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell - Shows unread count */}
            <NotificationBell />
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              className="bg-white text-teal-600 hover:bg-teal-50"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`
                flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Dashboard content with session booking card */}
        </div>
      )}
      
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <BookSession />
        </div>
      )}
      
      {/* Other tabs... */}
    </div>
  </div>
);
```

## TypeScript Type Update

Don't forget to update the DashboardTab type:

```tsx
type DashboardTab = 
  | 'dashboard' 
  | 'mood' 
  | 'chat' 
  | 'mentor' 
  | 'diary' 
  | 'tasks' 
  | 'calendar' 
  | 'sessions'  // <-- Add this
  | 'appointments' 
  | 'resources' 
  | 'forum' 
  | 'profile' 
  | 'more';
```

## Visual Result

After integration, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Welcome, Student Name!                🔔(3) [Logout] │
│         Your mental wellness companion                  │
└─────────────────────────────────────────────────────────┘
│ Dashboard | Mood | Chat | Sessions | Tasks | Calendar  │
└─────────────────────────────────────────────────────────┘
```

The notification bell (🔔) will:
- Show a red badge with unread count
- Open a dropdown when clicked
- Display recent notifications
- Allow marking as read
- Provide quick links to sessions

## Testing the Integration

1. **Login as student** → Check bell appears in header
2. **Book a session** → Bell icon appears for faculty
3. **Login as faculty** → See notification bell with badge
4. **Click bell** → Dropdown shows session request
5. **Click notification** → Navigates to session details
6. **Approve session** → Bell icon appears for student
7. **Login as student** → See approval notification

## Styling Notes

The NotificationBell component uses:
- `Button` with `variant="ghost"` and `size="icon"`
- `Badge` with `variant="destructive"` for unread count
- `DropdownMenu` from shadcn/ui
- Responsive design (works on mobile too!)

## Need Help?

If you encounter any issues:
1. Ensure NotificationBell.tsx is in the correct location
2. Check that all imports are correct
3. Verify the API endpoints are working
4. Test with the provided test script

---

That's it! Your notification system is now fully integrated. 🎉
