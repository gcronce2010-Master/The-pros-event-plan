
'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
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
  ExternalLink,
  QrCode,
  Share2,
  Clock,
  Loader2,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestPartyTasks } from '@/ai/flows/suggest-party-tasks';
import { draftGuestMessage } from '@/ai/flows/draft-guest-message';
import { formatTimeTo12h } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Mock data for initial state fallback
const MOCK_GUESTS = [
  { id: '1', name: 'Tony Stark', status: 'Attending', diet: 'Cheeseburgers' },
  { id: '2', name: 'Bruce Banner', status: 'Maybe', diet: 'None' },
  { id: '3', name: 'Diana Prince', status: 'Pending', diet: 'Greek Cuisine' },
];

const MOCK_MESSAGES = [
  { id: '1', sender: 'Coordinator', text: "Team, the coordinates are confirmed for the assembly.", time: '10:00 AM EST' },
  { id: '2', sender: 'Tony Stark', text: "I'll bring the tech. Who's got the fuel and rations?", time: '10:05 AM EST' },
];

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUrl, setCurrentUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Event state
  const [event, setEvent] = useState({
    name: "Mission HQ Assembly",
    date: '2026-05-15',
    time: '18:00',
    location: 'Modern Forest Venue, Seattle, WA',
    theme: 'Modern Woodland',
    description: 'A celebration of a half-century in the great outdoors.'
  });

  // Firestore Data Fetching
  const eventRef = useMemoFirebase(() => {
    if (!firestore || !user || !id) return null;
    return doc(firestore, 'users', user.uid, 'events', id);
  }, [firestore, user, id]);

  const { data: eventDoc, isLoading: isEventLoading } = useDoc(eventRef);

  useEffect(() => {
    if (eventDoc) {
      setEvent({
        name: eventDoc.name,
        date: eventDoc.date,
        time: eventDoc.time,
        location: eventDoc.location,
        theme: eventDoc.theme,
        description: eventDoc.description
      });
    }
  }, [eventDoc]);

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
    if (!eventRef) return;
    
    updateDocumentNonBlocking(eventRef, {
      ...editEvent,
      updatedAt: serverTimestamp()
    });

    setEvent(editEvent);
    setIsSettingsOpen(false);
    toast({ 
      title: "Mission Briefing Updated", 
      description: "Logistics have been modified." 
    });
  };

  const handleGenerateTasks = async () => {
    setLoadingTasks(true);
    try {
      const result = await suggestPartyTasks({
        eventType: "Celebration",
        theme: event.theme,
        eventDate: new Date(event.date).toISOString(),
      });
      setTasks(result.tasks.map(t => ({ ...t, completed: false })));
      toast({ title: "Strategy Generated", description: "AI has provided a tactical planning timeline." });
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
    toast({ title: "Analyzing Data...", description: "Drafting a tactical transmission." });
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

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Coordinates Copied",
        description: "Mission link has been copied to your clipboard.",
      });
    }
  };

  const missionHqImage = PlaceHolderImages.find(img => img.id === 'mission-hq') || PlaceHolderImages[0];

  if (!mounted || isAuthLoading || (isEventLoading && !eventDoc)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Badge variant="outline" className="hidden sm:inline-flex border-primary text-primary font-bold">MISSION ACTIVE</Badge>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Broadcast Mission</DialogTitle>
                <DialogDescription>
                  Share the coordinates with your allies.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 space-y-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl ring-1 ring-border flex items-center justify-center">
                  {mounted && currentUrl ? (
                    <QRCodeSVG 
                      value={currentUrl} 
                      size={200} 
                      includeMargin={true}
                      level="M"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded-lg" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Scan to access briefing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">Link</Label>
                  <Input id="link" defaultValue={currentUrl} readOnly className="rounded-full px-4 h-11" />
                </div>
                <Button size="sm" className="rounded-full px-6 h-11 font-bold" onClick={handleCopyLink}>
                  Copy URL
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={(open) => {
            setIsSettingsOpen(open);
            if (open) setEditEvent({ ...event });
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Mission Parameters</DialogTitle>
                <DialogDescription>
                  Modify the logistical data for your assembly.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-name" className="font-bold">Mission Title</Label>
                  <Input 
                    id="event-name" 
                    value={editEvent.name}
                    className="rounded-xl h-11"
                    onChange={(e) => setEditEvent({...editEvent, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-theme" className="font-bold">Visual Identity / Theme</Label>
                  <Input 
                    id="event-theme" 
                    value={editEvent.theme}
                    className="rounded-xl h-11"
                    onChange={(e) => setEditEvent({...editEvent, theme: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-date" className="font-bold">Activation Date</Label>
                    <Input 
                      id="event-date" 
                      type="date"
                      value={editEvent.date}
                      className="rounded-xl h-11"
                      onChange={(e) => setEditEvent({...editEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-time" className="font-bold">Activation Time</Label>
                    <Input 
                      id="event-time" 
                      type="time"
                      value={editEvent.time}
                      className="rounded-xl h-11"
                      onChange={(e) => setEditEvent({...editEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-location" className="font-bold">Coordinates</Label>
                  <Input 
                    id="event-location" 
                    value={editEvent.location}
                    className="rounded-xl h-11"
                    onChange={(e) => setEditEvent({...editEvent, location: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-description" className="font-bold">Briefing Details</Label>
                  <Textarea 
                    id="event-description" 
                    value={editEvent.description}
                    className="rounded-xl min-h-[100px]"
                    onChange={(e) => setEditEvent({...editEvent, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateEvent} className="rounded-full px-8 py-6 text-lg font-bold w-full">
                  <Save className="h-5 w-5 mr-2" />
                  Save Parameters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[450px] rounded-full p-1 h-14 bg-secondary/30 backdrop-blur-sm">
            <TabsTrigger value="overview" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">Brief</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">Objectives</TabsTrigger>
            <TabsTrigger value="guests" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">Allies</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">Comms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
                <div className="relative h-64 w-full">
                  <Image 
                    src={missionHqImage.imageUrl} 
                    alt="Mission HQ" 
                    fill 
                    className="object-cover"
                    data-ai-hint={missionHqImage.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <Badge className="bg-primary text-white mb-2 font-bold px-3 py-1">HQ SECURE</Badge>
                    <h2 className="text-white text-4xl font-headline font-bold">Mission Overview</h2>
                  </div>
                </div>
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Zap className="h-6 w-6 text-accent fill-current" /> Tactical Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-8">
                  <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-primary/5 border-2 border-primary/10 shadow-inner">
                    <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-xl mb-1">Theme: {event.theme}</h3>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-sm"><Calendar className="h-6 w-6" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-0.5">Activation Date</p>
                        <p className="font-bold text-lg">{event.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-sm"><Clock className="h-6 w-6" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-0.5">Activation Time</p>
                        <p className="font-bold text-lg">{formatTimeTo12h(event.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:col-span-2 bg-secondary/20 p-4 rounded-[2rem] border border-black/5">
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-sm"><MapPin className="h-6 w-6" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-0.5">Mission Coordinates</p>
                        <p className="font-bold text-lg truncate">{event.location}</p>
                        <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary font-bold hover:no-underline flex items-center gap-1 mt-1">
                          <a href={getMapQuestUrl()} target="_blank" rel="noopener noreferrer">
                            Decrypt Directions <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white h-fit">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="font-headline text-2xl">Mission Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-black/5">
                      <span className="text-muted-foreground font-medium">Allies Recruited</span>
                      <span className="font-black text-xl">{guests.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-black/5">
                      <span className="text-muted-foreground font-medium">Ready for Deployment</span>
                      <span className="font-black text-xl text-green-600">{guests.filter(g => g.status === 'Attending').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-black/5">
                      <span className="text-muted-foreground font-medium">Open Objectives</span>
                      <span className="font-black text-xl text-accent">{tasks.filter(t => !t.completed).length}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-2xl py-8 text-lg font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                        <QrCode className="h-6 w-6" /> Share Briefing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-headline text-center">Broadcast Coordinates</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-8 space-y-6">
                        <div className="p-6 bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 flex items-center justify-center">
                          {mounted && currentUrl ? (
                            <QRCodeSVG 
                              value={currentUrl} 
                              size={250} 
                              includeMargin={true}
                              level="M"
                            />
                          ) : (
                            <div className="w-[250px] h-[250px] bg-muted animate-pulse rounded-2xl" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground text-center px-4 font-medium italic">
                          Scan to access secure mission briefings and tactical updates.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-headline font-bold">Strategic Objectives</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={handleGenerateTasks} disabled={loadingTasks} className="rounded-full border-2 border-primary text-primary hover:bg-primary/5 font-bold h-12">
                  <Zap className="h-5 w-5 mr-2" />
                  AI Intelligence
                </Button>
                
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full shadow-xl shadow-primary/20 font-bold h-12">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Objective
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-headline">New Tactical Objective</DialogTitle>
                      <DialogDescription>
                        Define a new requirement for mission success.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      <div className="grid gap-2">
                        <Label htmlFor="task-desc" className="font-bold">Objective Description</Label>
                        <Input 
                          id="task-desc" 
                          placeholder="e.g., Secure elite woodcraft catering" 
                          value={newTaskDesc}
                          className="rounded-xl h-12"
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-timeline" className="font-bold">Completion Window</Label>
                        <Input 
                          id="task-timeline" 
                          placeholder="e.g., T-minus 14 days" 
                          value={newTaskTimeline}
                          className="rounded-xl h-12"
                          onChange={(e) => setNewTaskTimeline(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask} disabled={!newTaskDesc.trim()} className="w-full py-6 rounded-full text-lg font-bold">Deploy Objective</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {tasks.length > 0 ? (
              <div className="grid gap-6">
                {tasks.map((task, i) => (
                  <Card key={i} className="shadow-lg border-none ring-1 ring-black/5 group hover:ring-primary/30 transition-all bg-white rounded-[2rem]">
                    <CardContent className="flex items-center gap-6 py-6 px-8">
                      <button 
                        onClick={() => {
                          const newTasks = [...tasks];
                          newTasks[i].completed = !newTasks[i].completed;
                          setTasks(newTasks);
                        }}
                        className={`h-8 w-8 rounded-full border-4 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'border-primary/20 hover:border-primary'}`}
                      >
                        {task.completed && <CheckCircle2 className="h-5 w-5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xl font-bold ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>{task.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-primary/50" />
                          <p className="text-xs text-primary/60 uppercase tracking-[0.2em] font-black">{task.timeline}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-12 w-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTask(i)}
                        >
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-secondary/10 rounded-[3rem] border-4 border-dotted border-primary/20">
                <div className="bg-primary/5 p-6 rounded-full mb-6">
                  <ClipboardList className="h-16 w-16 text-primary/20" />
                </div>
                <p className="text-muted-foreground font-bold text-xl mb-8">No objectives detected in this sector.</p>
                <Button onClick={handleGenerateTasks} className="rounded-full px-10 py-8 text-xl font-bold shadow-2xl shadow-primary/30">
                  <Zap className="h-6 w-6 mr-3" />
                  Request AI Tactical Plan
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guests" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-headline font-bold">The Assembly Roster</h2>
              
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-xl shadow-primary/20 font-bold h-12">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Recruit Ally
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Recruitment Profile</DialogTitle>
                    <DialogDescription>
                      Authorize a new hero or ally for the mission.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="guest-name" className="font-bold">Identity / Name</Label>
                      <Input 
                        id="guest-name" 
                        placeholder="e.g., Peter Parker" 
                        value={newGuestName}
                        className="rounded-xl h-12"
                        onChange={(e) => setNewGuestName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-status" className="font-bold">Readiness Protocol</Label>
                      <Select value={newGuestStatus} onValueChange={setNewGuestStatus}>
                        <SelectTrigger id="guest-status" className="rounded-xl h-12">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attending">READY FOR OPS</SelectItem>
                          <SelectItem value="Maybe">RESERVE STATUS</SelectItem>
                          <SelectItem value="Pending">SIGNAL SENT</SelectItem>
                          <SelectItem value="Declined">OFF-GRID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guest-diet" className="font-bold">Biological Intel / Diet</Label>
                      <Input 
                        id="guest-diet" 
                        placeholder="e.g., Paleo, Vegan, Allergies" 
                        value={newGuestDiet}
                        className="rounded-xl h-12"
                        onChange={(e) => setNewGuestDiet(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteGuest} disabled={!newGuestName.trim()} className="w-full py-6 rounded-full text-lg font-bold">Authorize Ally</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-primary/5">
                        <th className="px-8 py-6 font-headline font-black text-sm uppercase tracking-[0.2em] text-primary/60">Ally</th>
                        <th className="px-8 py-6 font-headline font-black text-sm uppercase tracking-[0.2em] text-primary/60">Status</th>
                        <th className="px-8 py-6 font-headline font-black text-sm uppercase tracking-[0.2em] text-primary/60">Intel / Diet</th>
                        <th className="px-8 py-6 font-headline font-black text-sm uppercase tracking-[0.2em] text-primary/60 text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg">
                                {guest.name.charAt(0)}
                              </div>
                              <span className="font-bold text-lg text-foreground">{guest.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant={
                              guest.status === 'Attending' ? 'default' : 
                              guest.status === 'Maybe' ? 'secondary' : 
                              guest.status === 'Declined' ? 'destructive' : 'outline'
                            } className="font-black px-3 py-1 text-xs tracking-wider">
                              {guest.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-muted-foreground/80 italic">
                            {guest.diet}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-destructive hover:bg-destructive/10 font-bold tracking-tighter"
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
            <Card className="shadow-2xl border-none flex flex-col h-[700px] overflow-hidden bg-white rounded-[3rem]">
              <CardHeader className="border-b border-black/5 px-8 py-6 flex flex-row items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                      Secure Comms Channel
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/70 font-medium">Encrypted tactical coordination</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/30 px-6 font-bold h-10" onClick={handleAiMessageDraft}>
                  <Zap className="h-4 w-4 mr-2" />
                  AI Protocol
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-8 space-y-8 bg-secondary/10 shadow-inner">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'Coordinator' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <span className={`text-xs font-black uppercase tracking-widest ${msg.sender === 'Coordinator' ? 'text-primary' : 'text-accent'}`}>{msg.sender}</span>
                      <span className="text-[10px] text-muted-foreground/50 font-bold">{msg.time}</span>
                    </div>
                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-base shadow-xl font-medium ${msg.sender === 'Coordinator' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-foreground rounded-tl-none border-2 border-primary/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-6 border-t border-black/5 bg-white">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Broadcast to the assembly..." 
                    className="rounded-full h-14 px-8 border-2 bg-secondary/10 focus:ring-primary text-lg" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" className="rounded-full h-14 w-14 shadow-2xl shadow-primary/30 shrink-0" onClick={handleSendMessage}>
                    <Send className="h-6 w-6" />
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
