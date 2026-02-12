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
} from "@/components/ui/select";
import { 
  MessageSquare, 
  ClipboardList, 
  Settings, 
  Send, 
  Plus, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Shield,
  CheckCircle2,
  UserPlus,
  Trash2,
  Save,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestPartyTasks } from '@/ai/flows/suggest-party-tasks';
import { draftGuestMessage } from '@/ai/flows/draft-guest-message';
import { formatTimeTo12h } from '@/lib/utils';

// Mock data for initial state
const MOCK_GUESTS = [
  { id: '1', name: 'Tony Stark', status: 'Attending', diet: 'Cheeseburgers' },
  { id: '2', name: 'Bruce Banner', status: 'Maybe', diet: 'None' },
  { id: '3', name: 'Diana Prince', status: 'Pending', diet: 'Greek Cuisine' },
];

const MOCK_MESSAGES = [
  { id: '1', sender: 'Coordinator', text: "Avengers, assemble for the celebration!", time: '10:00 AM EST' },
  { id: '2', sender: 'Tony Stark', text: "I'll bring the tech. Who's got the food?", time: '10:05 AM EST' },
];

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Event state
  const [event, setEvent] = useState({
    name: "The Hero Assembly Gala",
    date: '2024-08-20',
    time: '20:00', // Using 24h format for internal storage/input, formatTimeTo12h for display
    location: 'Solitude Links, Smiths Creek, MI',
    theme: 'Cape and Mask',
    description: 'A night of celebration for our local protectors. Dress code: Your finest heroic attire.'
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
      title: "Mission Briefing Updated", 
      description: "Event logistics have been modified." 
    });
  };

  const handleGenerateTasks = async () => {
    setLoadingTasks(true);
    try {
      const result = await suggestPartyTasks({
        eventType: "Hero Gala",
        theme: event.theme,
        eventDate: new Date(event.date).toISOString(),
      });
      setTasks(result.tasks.map(t => ({ ...t, completed: false })));
      toast({ title: "Strategy Generated", description: "AI has provided a heroic planning timeline." });
    } catch (err) {
      toast({ title: "Error", description: "Tactical failure: Failed to generate tasks", variant: "destructive" });
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
    toast({ title: "Objective Added", description: "New task assigned to the mission." });
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
    toast({ title: "Ally Recruited", description: `${newGuestName} has been added to the roster.` });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Explicitly use 12-hour format and New York time zone for EST
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'America/New_York' 
    });

    setChatMessages([...chatMessages, {
      id: Date.now().toString(),
      sender: 'Coordinator',
      text: message,
      time: `${timestamp} EST`
    }]);
    setMessage('');
  };

  const handleAiMessageDraft = async () => {
    toast({ title: "Analyzing Data...", description: "Drafting a heroic transmission." });
    try {
      const result = await draftGuestMessage({
        eventName: event.name,
        eventDate: event.date,
        eventTime: formatTimeTo12h(event.time),
        eventLocation: event.location,
        eventTheme: event.theme,
        eventDescription: event.description,
        messageType: 'welcome',
        tone: 'exciting'
      });
      setMessage(result.draftedMessage);
    } catch (err) {
      toast({ title: "Error", description: "Comms failure", variant: "destructive" });
    }
  };

  const getMapQuestUrl = () => {
    const destination = encodeURIComponent(event.location);
    return `https://www.mapquest.com/directions/to/${destination}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline font-bold truncate text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> {event.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex border-primary text-primary font-bold">ACTIVE MISSION</Badge>
          
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
                <DialogTitle>Mission Parameters</DialogTitle>
                <DialogDescription>
                  Modify the logistical data for your assembly.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-name">Mission Name</Label>
                  <Input 
                    id="event-name" 
                    value={editEvent.name}
                    onChange={(e) => setEditEvent({...editEvent, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-theme">Visual Theme</Label>
                  <Input 
                    id="event-theme" 
                    value={editEvent.theme}
                    onChange={(e) => setEditEvent({...editEvent, theme: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">Activation Date</Label>
                    <Input 
                      id="event-date" 
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({...editEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-time">Activation Time</Label>
                    <Input 
                      id="event-time" 
                      type="time"
                      value={editEvent.time}
                      onChange={(e) => setEditEvent({...editEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-location">Coordinates</Label>
                  <Input 
                    id="event-location" 
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({...editEvent, location: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-description">Mission Brief</Label>
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
                  Save Parameters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit rounded-full p-1 h-12 bg-secondary/50">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Brief</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Objectives</TabsTrigger>
            <TabsTrigger value="guests" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Allies</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Comms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 shadow-lg border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent fill-current" /> Tactical Intel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg">Visual Identity: {event.theme}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Launch Window</p>
                        <p className="font-medium">{event.date} @ {formatTimeTo12h(event.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary"><MapPin className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Coordinates</p>
                        <p className="font-medium truncate">{event.location}</p>
                        <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary font-bold hover:no-underline flex items-center gap-1 mt-1">
                          <a href={getMapQuestUrl()} target="_blank" rel="noopener noreferrer">
                            Get MapQuest Directions <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="font-headline">Mission Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Recruited</span>
                    <span className="font-bold">{guests.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Ready</span>
                    <span className="font-bold text-green-600">{guests.filter(g => g.status === 'Attending').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Open Objectives</span>
                    <span className="font-bold text-accent">{tasks.filter(t => !t.completed).length}</span>
                  </div>
                  <Button className="w-full rounded-full shadow-md" onClick={() => setActiveTab('guests')}>
                    Manage Roster
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Mission Objectives</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateTasks} disabled={loadingTasks} className="rounded-full border-primary text-primary hover:bg-primary/5">
                  <Zap className="h-4 w-4 mr-2" />
                  {tasks.length > 0 ? 'Recalculate' : 'Generate Intel'}
                </Button>
                
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full shadow-md">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>New Mission Task</DialogTitle>
                      <DialogDescription>
                        Define a new tactical requirement.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="task-desc">Objective Description</Label>
                        <Input 
                          id="task-desc" 
                          placeholder="e.g., Secure the vibranium" 
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-timeline">Deadline Window</Label>
                        <Input 
                          id="task-timeline" 
                          placeholder="e.g., T-minus 2 weeks" 
                          value={newTaskTimeline}
                          onChange={(e) => setNewTaskTimeline(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask} disabled={!newTaskDesc.trim()}>Deploy Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {tasks.length > 0 ? (
              <div className="grid gap-4">
                {tasks.map((task, i) => (
                  <Card key={i} className="shadow-md border-none ring-1 ring-border group hover:ring-primary/40 transition-all bg-white">
                    <CardContent className="flex items-center gap-4 py-4">
                      <button 
                        onClick={() => {
                          const newTasks = [...tasks];
                          newTasks[i].completed = !newTasks[i].completed;
                          setTasks(newTasks);
                        }}
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30 hover:border-primary'}`}
                      >
                        {task.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.description}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mt-1">{task.timeline}</p>
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
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-3xl border-4 border-dotted border-primary/20">
                <ClipboardList className="h-12 w-12 text-primary/30 mb-4" />
                <p className="text-muted-foreground font-medium mb-6">No objectives detected. Need a tactical plan?</p>
                <Button onClick={handleGenerateTasks} className="rounded-full shadow-lg">
                  <Zap className="h-4 w-4 mr-2" />
                  Request AI Strategy
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guests" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">The Roster</h2>
              
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full shadow-md">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Recruit Ally
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Recruitment Form</DialogTitle>
                    <DialogDescription>
                      Add a hero or ally to the assembly.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guest-name">Hero Name / Secret Identity</Label>
                      <Input 
                        id="guest-name" 
                        placeholder="e.g., Peter Parker" 
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-status">Readiness Status</Label>
                      <Select value={newGuestStatus} onValueChange={setNewGuestStatus}>
                        <SelectTrigger id="guest-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attending">READY</SelectItem>
                          <SelectItem value="Maybe">RESERVE</SelectItem>
                          <SelectItem value="Pending">STANDBY</SelectItem>
                          <SelectItem value="Declined">OFF-WORLD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-diet">Special Requirements</Label>
                      <Input 
                        id="guest-diet" 
                        placeholder="e.g., Gluten-Free, Nut Allergy" 
                        value={newGuestDiet}
                        onChange={(e) => setNewGuestDiet(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteGuest} disabled={!newGuestName.trim()}>Authorize Recruitment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-primary/5">
                        <th className="px-6 py-4 font-headline font-black text-sm uppercase tracking-tighter">Ally</th>
                        <th className="px-6 py-4 font-headline font-black text-sm uppercase tracking-tighter">Status</th>
                        <th className="px-6 py-4 font-headline font-black text-sm uppercase tracking-tighter">Intel / Diet</th>
                        <th className="px-6 py-4 font-headline font-black text-sm uppercase tracking-tighter text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-black shadow-inner">
                                {guest.name.charAt(0)}
                              </div>
                              <span className="font-black text-foreground">{guest.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              guest.status === 'Attending' ? 'default' : 
                              guest.status === 'Maybe' ? 'secondary' : 
                              guest.status === 'Declined' ? 'destructive' : 'outline'
                            } className="font-black">
                              {guest.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                            {guest.diet}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-destructive hover:bg-destructive/10 font-bold"
                              onClick={() => setGuests(guests.filter(g => g.id !== guest.id))}
                            >
                              EXCLUDE
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
            <Card className="shadow-2xl border-2 border-primary/20 flex flex-col h-[600px] overflow-hidden bg-white">
              <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-primary text-white">
                <div>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> Secure Comms Channel
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">Encrypted tactical coordination</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleAiMessageDraft}>
                  <Zap className="h-4 w-4 mr-2" />
                  AI Protocol
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/10">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'Coordinator' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-primary uppercase">{msg.sender}</span>
                      <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-md font-medium ${msg.sender === 'Coordinator' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-foreground rounded-tl-none border-2 border-primary/10'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Broadcast to the team..." 
                    className="rounded-full px-6 border-2 focus:ring-primary" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" className="rounded-full h-10 w-10 shadow-lg" onClick={handleSendMessage}>
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
