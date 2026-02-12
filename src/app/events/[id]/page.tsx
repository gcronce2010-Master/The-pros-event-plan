'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/select";
import { 
  MessageSquare, 
  ClipboardList, 
  Settings, 
  Send, 
  Plus, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  UserPlus,
  Trash2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestPartyTasks } from '@/ai/flows/suggest-party-tasks';
import { draftGuestMessage } from '@/ai/flows/draft-guest-message';

// Mock data for initial state
const MOCK_GUESTS = [
  { id: '1', name: 'Emily Smith', status: 'Attending', diet: 'Vegetarian' },
  { id: '2', name: 'James Wilson', status: 'Maybe', diet: 'None' },
  { id: '3', name: 'Sarah Parker', status: 'Pending', diet: 'Gluten Free' },
];

const MOCK_MESSAGES = [
  { id: '1', sender: 'Organizer', text: "Hey everyone! Can't wait for the party.", time: '10:00 AM' },
  { id: '2', sender: 'Emily Smith', text: "Me too! Should I bring anything?", time: '10:05 AM' },
];

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Event state
  const [event, setEvent] = useState({
    name: "Alex's 30th Birthday Bash",
    date: '2024-06-15',
    time: '7:00 PM',
    location: 'Rooftop Garden, Downtown',
    theme: 'Retro Neon',
    description: 'A night of vibrant colors and 80s beats to celebrate Alex hitting the big 3-0!'
  });

  const [tasks, setTasks] = useState<{description: string, timeline: string, completed: boolean}[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_MESSAGES);
  const [guests, setGuests] = useState(MOCK_GUESTS);
  
  // Task Dialog State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTimeline, setNewTaskTimeline] = useState('1 week before');

  // Guest Dialog State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestStatus, setNewGuestStatus] = useState('Pending');
  const [newGuestDiet, setNewGuestDiet] = useState('');

  // Settings Dialog State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editEvent, setEditEvent] = useState({ ...event });

  const handleUpdateEvent = () => {
    setEvent(editEvent);
    setIsSettingsOpen(false);
    toast({ 
      title: "Event Updated", 
      description: "Logistics and details have been updated successfully." 
    });
  };

  const handleGenerateTasks = async () => {
    setLoadingTasks(true);
    try {
      const result = await suggestPartyTasks({
        eventType: "Birthday Party",
        theme: event.theme,
        eventDate: new Date(event.date).toISOString(),
      });
      setTasks(result.tasks.map(t => ({ ...t, completed: false })));
      toast({ title: "Tasks generated", description: "AI has suggested a planning timeline for you." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate tasks", variant: "destructive" });
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskDesc.trim()) return;
    setTasks([
      ...tasks, 
      { description: newTaskDesc, timeline: newTaskTimeline, completed: false }
    ]);
    setNewTaskDesc('');
    setNewTaskTimeline('1 week before');
    setIsAddTaskOpen(false);
    toast({ title: "Task added", description: "Your new task has been added to the checklist." });
  };

  const handleDeleteTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleInviteGuest = () => {
    if (!newGuestName.trim()) return;
    const newGuest = {
      id: Date.now().toString(),
      name: newGuestName,
      status: newGuestStatus,
      diet: newGuestDiet || 'None'
    };
    setGuests([...guests, newGuest]);
    setNewGuestName('');
    setNewGuestStatus('Pending');
    setNewGuestDiet('');
    setIsInviteOpen(false);
    toast({ title: "Guest invited", description: `${newGuestName} has been added to the list.` });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages([...chatMessages, {
      id: Date.now().toString(),
      sender: 'Organizer',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
  };

  const handleAiMessageDraft = async () => {
    toast({ title: "AI Thinking...", description: "Drafting a welcoming message for you." });
    try {
      const result = await draftGuestMessage({
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventTheme: event.theme,
        eventDescription: event.description,
        messageType: 'welcome',
        tone: 'exciting'
      });
      setMessage(result.draftedMessage);
    } catch (err) {
      toast({ title: "Error", description: "Failed to draft message", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline font-bold truncate text-xl">{event.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">Organizing</Badge>
          
          <Dialog open={isSettingsOpen} onOpenChange={(open) => {
            setIsSettingsOpen(open);
            if (open) setEditEvent({ ...event });
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Event Settings</DialogTitle>
                <DialogDescription>
                  Update the logistical details for your celebration.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input 
                    id="event-name" 
                    value={editEvent.name}
                    onChange={(e) => setEditEvent({...editEvent, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-theme">Theme</Label>
                  <Input 
                    id="event-theme" 
                    value={editEvent.theme}
                    onChange={(e) => setEditEvent({...editEvent, theme: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">Date</Label>
                    <Input 
                      id="event-date" 
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({...editEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-time">Time</Label>
                    <Input 
                      id="event-time" 
                      type="time"
                      value={editEvent.time}
                      onChange={(e) => setEditEvent({...editEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input 
                    id="event-location" 
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({...editEvent, location: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea 
                    id="event-description" 
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({...editEvent, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateEvent} className="rounded-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit rounded-full p-1 h-12">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full">Tasks</TabsTrigger>
            <TabsTrigger value="guests" className="rounded-full">Guests</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-full">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline">The Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30">
                    <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold">Theme: {event.theme}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date & Time</p>
                        <p className="font-medium">{event.date} @ {event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary"><MapPin className="h-5 w-5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Location</p>
                        <p className="font-medium truncate">{event.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Invited</span>
                    <span className="font-bold">{guests.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Attending</span>
                    <span className="font-bold text-green-600">{guests.filter(g => g.status === 'Attending').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Tasks Pending</span>
                    <span className="font-bold text-accent">{tasks.filter(t => !t.completed).length}</span>
                  </div>
                  <Button className="w-full rounded-full" onClick={() => setActiveTab('guests')}>
                    Manage Guests
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Planning Checklist</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateTasks} disabled={loadingTasks} className="rounded-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {tasks.length > 0 ? 'Regenerate' : 'Suggest Tasks'}
                </Button>
                
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>
                        Add a task to your planning checklist.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="task-desc">Task Description</Label>
                        <Input 
                          id="task-desc" 
                          placeholder="e.g., Order the cake" 
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-timeline">Timeline</Label>
                        <Input 
                          id="task-timeline" 
                          placeholder="e.g., 2 weeks before" 
                          value={newTaskTimeline}
                          onChange={(e) => setNewTaskTimeline(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask} disabled={!newTaskDesc.trim()}>Create Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {tasks.length > 0 ? (
              <div className="grid gap-4">
                {tasks.map((task, i) => (
                  <Card key={i} className="shadow-sm border-none ring-1 ring-border group hover:ring-primary/40 transition-all">
                    <CardContent className="flex items-center gap-4 py-4">
                      <button 
                        onClick={() => {
                          const newTasks = [...tasks];
                          newTasks[i].completed = !newTasks[i].completed;
                          setTasks(newTasks);
                        }}
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary text-white' : 'border-muted-foreground/30 hover:border-primary'}`}
                      >
                        {task.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.description}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{task.timeline}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTask(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-primary/10">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground mb-6">No tasks added yet. Want some help?</p>
                <Button onClick={handleGenerateTasks} className="rounded-full shadow-lg shadow-primary/10">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Planning Assistant
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guests" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Guest List</h2>
              
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Guest
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite New Guest</DialogTitle>
                    <DialogDescription>
                      Add a guest to your event's tracking list.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guest-name">Guest Name</Label>
                      <Input 
                        id="guest-name" 
                        placeholder="e.g., Emily Smith" 
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-status">RSVP Status</Label>
                      <Select value={newGuestStatus} onValueChange={setNewGuestStatus}>
                        <SelectTrigger id="guest-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attending">Attending</SelectItem>
                          <SelectItem value="Maybe">Maybe</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-diet">Dietary Info</Label>
                      <Input 
                        id="guest-diet" 
                        placeholder="e.g., Vegan, Nut Allergy" 
                        value={newGuestDiet}
                        onChange={(e) => setNewGuestDiet(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteGuest} disabled={!newGuestName.trim()}>Add to List</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-sm border-none ring-1 ring-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-secondary/10">
                        <th className="px-6 py-4 font-headline font-bold text-sm">Guest Name</th>
                        <th className="px-6 py-4 font-headline font-bold text-sm">Status</th>
                        <th className="px-6 py-4 font-headline font-bold text-sm">Dietary Info</th>
                        <th className="px-6 py-4 font-headline font-bold text-sm text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {guest.name.charAt(0)}
                              </div>
                              <span className="font-medium">{guest.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              guest.status === 'Attending' ? 'default' : 
                              guest.status === 'Maybe' ? 'secondary' : 
                              guest.status === 'Declined' ? 'destructive' : 'outline'
                            }>
                              {guest.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {guest.diet}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-destructive hover:bg-destructive/10"
                              onClick={() => setGuests(guests.filter(g => g.id !== guest.id))}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="animate-fade-in">
            <Card className="shadow-lg border-none ring-1 ring-border flex flex-col h-[600px] overflow-hidden">
              <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-lg">Event Chat</CardTitle>
                  <CardDescription>Plan details with your guests</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleAiMessageDraft}>
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  AI Draft
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/5">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'Organizer' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">{msg.sender}</span>
                      <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                    </div>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'Organizer' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-foreground rounded-tl-none ring-1 ring-border'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    className="rounded-full px-6" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" className="rounded-full h-10 w-10 shadow-md" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
