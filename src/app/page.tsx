import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, PartyPopper, Shield, Zap, Sword, Users } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-party');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight">Hero Party</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors mt-2" href="/dashboard">
            Dashboard
          </Link>
          <Button asChild variant="default" className="rounded-full shadow-lg shadow-primary/20">
            <Link href="/dashboard">Join the Team</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4 animate-slide-up">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-accent text-accent-foreground border-accent/20 mb-2">
                  <Zap className="mr-2 h-4 w-4 fill-current" />
                  <span>Assemble your ultimate celebration</span>
                </div>
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Plan <span className="text-primary italic">Legendary</span> Events with AI Powers
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Transform ordinary gatherings into extraordinary assemblies. From cosmic themes to top-secret guest lists, Hero Party handles the heavy lifting.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <Button asChild size="lg" className="rounded-full px-8 text-lg font-semibold shadow-xl shadow-primary/30">
                    <Link href="/dashboard">Activate Now</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-lg border-2 border-primary text-primary hover:bg-primary/5">
                    View Dossier
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(30,64,175,0.3)] animate-fade-in group border-4 border-white">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold mb-4">Heroic Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Equip yourself with the tools needed for mission success.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-accent fill-current" />}
                title="Super Brainstorming"
                description="Our AI generates themes so epic, they'll be talked about for light-years. Input your vibe, get a master plan."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                title="The Assemble List"
                description="Easily recruit your squad. Track RSVPs and secret dietary needs in one secure headquarters."
              />
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="Command Center"
                description="Real-time communication for the whole team. Stay in sync even when the party is in full swing."
              />
              <FeatureCard 
                icon={<Sword className="h-8 w-8 text-accent" />}
                title="Mission Tasks"
                description="No hero left behind. Shared to-do lists ensure every objective is completed before the big day."
              />
              <FeatureCard 
                icon={<Sparkles className="h-8 w-8 text-primary" />}
                title="Cosmic Scheduling"
                description="Manage multiple timelines across galaxies. Get automated alerts for every critical milestone."
              />
              <FeatureCard 
                icon={<PartyPopper className="h-8 w-8 text-accent" />}
                title="Legendary Memories"
                description="Focus on the victory. We handle the logistical chaos so you can be the hero of the hour."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-4 md:px-6 bg-secondary/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold">Hero Party</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Legend I s Born HQ. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Code of Ethics
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Secret Identity Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-headline font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
