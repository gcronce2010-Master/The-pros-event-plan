import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, PartyPopper, MessageSquare, ClipboardList, CalendarDays, Users } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-party');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform">
            <PartyPopper className="h-6 w-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight">AI Party</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors mt-2" href="/dashboard">
            Dashboard
          </Link>
          <Button asChild variant="default" className="rounded-full shadow-lg shadow-primary/20">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4">
          <div className="container mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4 animate-slide-up">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary text-primary border-primary/20 mb-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>The future of celebrations is here</span>
                </div>
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Plan your <span className="text-primary">perfect party</span> with the power of AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  From brainstorming unique themes to managing guest lists and real-time coordination. 
                  AI Party handles the stress so you can enjoy the moment.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <Button asChild size="lg" className="rounded-full px-8 text-lg font-semibold shadow-xl shadow-primary/20">
                    <Link href="/dashboard">Start Planning Now</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-lg border-2">
                    How it works
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-3xl shadow-2xl animate-fade-in group">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold mb-4">Everything you need for an unforgettable event</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our suite of tools takes the guesswork out of event management.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<Sparkles className="h-8 w-8 text-primary" />}
                title="AI Theme Brainstormer"
                description="Input your occasion and vibe, and our AI suggests custom themes, decor ideas, and activities."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Guest List & RSVPs"
                description="Invite guests easily and track RSVPs with custom questions for dietary needs and preferences."
              />
              <FeatureCard 
                icon={<MessageSquare className="h-8 w-8 text-primary" />}
                title="Real-time Chat"
                description="Instant communication between organizers and guests to keep everyone updated in real-time."
              />
              <FeatureCard 
                icon={<ClipboardList className="h-8 w-8 text-primary" />}
                title="Task Management"
                description="Stay organized with shared to-do lists, assigned tasks, and completion tracking."
              />
              <FeatureCard 
                icon={<CalendarDays className="h-8 w-8 text-primary" />}
                title="Event Scheduling"
                description="Manage dates, times, and locations in one centralized place with automatic reminders."
              />
              <FeatureCard 
                icon={<PartyPopper className="h-8 w-8 text-primary" />}
                title="Memorable Moments"
                description="Focus on making memories while we handle the logistics of your celebration."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-4 md:px-6 bg-background">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <PartyPopper className="h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold">AI Party</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AI Party. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Terms
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background p-8 rounded-2xl border hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-headline font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
