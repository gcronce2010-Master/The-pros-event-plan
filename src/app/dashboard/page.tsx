
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, ChevronRight, PartyPopper, Clock, Settings, User, LogOut, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { formatTimeTo12h } from '@/lib/utils';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth, mounted]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'events'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: events, isLoading: isEventsLoading } = useCollection(eventsQuery);

  const handleSettingsClick = (item: string) => {
    toast({
      title: `${item} Settings`,
      description: `This feature is coming soon in the next update!`,
    });
  };

  const getEventImage = (index: number) => {
    // Cycle through relevant placeholder images
    const images = PlaceHolderImages.filter(img => img.id !== 'hero-party' && img.id !== 'mission-hq');
    return images[index % images.length] || PlaceHolderImages[0];
  };

  if (!mounted || isUserLoading || isEventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-40">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <PartyPopper className="h-5 w-5" />
          </div>
          <span className="font-headline font-bold text-xl">The Pros Event Plan</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button asChild variant="default" size="sm" className="rounded-full px-6">
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" /> New Mission
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSettingsClick('Profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettingsClick('Billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettingsClick('Settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold">Active Missions</h1>
            <p className="text-muted-foreground">Manage your upcoming celebrations and logistical tasks.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
              Total: {events?.length || 0}
            </Badge>
          </div>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => {
              const eventImg = getEventImage(index);
              return (
                <Card key={event.id} className="overflow-hidden group hover:shadow-2xl transition-all border-none shadow-lg ring-1 ring-black/5 rounded-3xl bg-white">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={eventImg.imageUrl} 
                      alt={event.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={eventImg.imageHint}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/95 text-primary hover:bg-white backdrop-blur-md border-none shadow-md font-bold px-3 py-1">
                        ACTIVE
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl leading-tight group-hover:text-primary transition-colors">
                      {event.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-semibold">
                        {event.theme}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Clock className="h-4 w-4 text-primary/70" />
                        <span className="font-medium">{formatTimeTo12h(event.time)}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      <span className="truncate font-medium">{event.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button asChild className="w-full rounded-2xl bg-secondary text-primary hover:bg-primary hover:text-white transition-all group/btn shadow-none border border-primary/10 py-6 text-lg font-bold">
                      <Link href={`/events/${event.id}`}>
                        Enter Command Center
                        <ChevronRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
            
            <Link 
              href="/events/new" 
              className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-primary/20 rounded-[2.5rem] bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group min-h-[400px]"
            >
              <div className="bg-primary/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-headline font-bold text-2xl mb-2">New Mission</h3>
              <p className="text-muted-foreground text-center max-w-[200px]">Start brainstorming your next legendary event</p>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-[3rem] border-4 border-dashed border-primary/10 shadow-inner">
            <div className="bg-primary/10 p-8 rounded-full mb-8">
              <PartyPopper className="h-20 w-20 text-primary/40" />
            </div>
            <h2 className="text-3xl font-headline font-bold mb-3">No Missions Assigned</h2>
            <p className="text-muted-foreground mb-10 text-lg max-w-md text-center">Ready to start planning your next masterpiece in the woods?</p>
            <Button asChild size="lg" className="rounded-full px-12 py-8 text-xl font-bold shadow-2xl shadow-primary/30">
              <Link href="/events/new">Initiate First Mission</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
