'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Users, ChevronRight, PartyPopper, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const mockEvents = [
  {
    id: '1',
    name: "Alex's 30th Birthday Bash",
    date: "2024-06-15",
    time: "7:00 PM",
    location: "Rooftop Garden, Downtown",
    theme: "Retro Neon",
    guestCount: 45,
    rsvpCount: 32,
    status: "Planning",
    image: PlaceHolderImages[0].imageUrl
  },
  {
    id: '2',
    name: "Summer Solstice Garden Party",
    date: "2024-06-21",
    time: "4:00 PM",
    location: "Sunnybrook Park",
    theme: "Bohemian Picnic",
    guestCount: 25,
    rsvpCount: 18,
    status: "Upcoming",
    image: PlaceHolderImages[3].imageUrl
  }
];

export default function DashboardPage() {
  const [events] = useState(mockEvents);

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Nav */}
      <header className="px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-40">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <PartyPopper className="h-5 w-5" />
          </div>
          <span className="font-headline font-bold text-xl">AI Party</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button asChild variant="default" size="sm" className="rounded-full">
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" /> New Event
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold">Your Events</h1>
            <p className="text-muted-foreground">Manage your upcoming celebrations and planning tasks.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full">Total: {events.length}</Badge>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-md ring-1 ring-border">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={event.image} 
                    alt={event.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow-sm font-semibold">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary transition-colors">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 pt-1">
                    <span className="font-medium text-accent">{event.theme}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    <span>{event.date}</span>
                    <Clock className="h-4 w-4 text-primary/70 ml-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Users className="h-4 w-4 text-primary/70" />
                    <span>{event.rsvpCount} / {event.guestCount} RSVPs</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild className="w-full rounded-xl bg-secondary text-primary hover:bg-primary hover:text-white transition-all group/btn shadow-none border border-primary/10">
                    <Link href={`/events/${event.id}`}>
                      Manage Event
                      <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Create New Card */}
            <Link 
              href="/events/new" 
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
            >
              <div className="bg-primary/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline font-bold text-lg mb-1">Create New Event</h3>
              <p className="text-muted-foreground text-sm text-center">Start brainstorming your next celebration</p>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border-2 border-dashed">
            <PartyPopper className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-headline font-bold mb-2">No events yet</h2>
            <p className="text-muted-foreground mb-8">Ready to start planning your next masterpiece?</p>
            <Button asChild size="lg" className="rounded-full shadow-lg">
              <Link href="/events/new">Create Your First Event</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
