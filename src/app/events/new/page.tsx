
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Calendar, MapPin, Users, PartyPopper, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { brainstormPartyTheme, type BrainstormPartyThemeOutput } from '@/ai/flows/brainstorm-party-theme';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    guestCount: 20,
    vibe: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState<BrainstormPartyThemeOutput | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleBrainstorm = async () => {
    if (!formData.name || !formData.vibe) {
      toast({
        title: "Missing Information",
        description: "Please provide an event name and vibe for the AI to brainstorm ideas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // We pass the name as the 'occasion' to the AI flow
      const result = await brainstormPartyTheme({
        occasion: formData.name,
        guestCount: formData.guestCount,
        vibe: formData.vibe,
      });
      setAiSuggestions(result);
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectTheme = (theme: string) => {
    // Keep the original name but note the theme
    setFormData({ ...formData, description: `Theme: ${theme}. ${formData.description}` });
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setLoading(true);
    try {
      const eventsRef = collection(firestore, 'users', user.uid, 'events');
      const eventData = {
        organizerId: user.uid,
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        theme: aiSuggestions?.theme || 'Heroic Custom',
        members: { [user.uid]: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      addDocumentNonBlocking(eventsRef, eventData);
      
      toast({
        title: "Mission Activated!",
        description: "Redirecting to your command center...",
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mission data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <header className="mb-8 text-center">
          <PartyPopper className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline font-bold mb-2">Assemble Your Event</h1>
          <p className="text-muted-foreground">Every great mission starts with a name and a vision.</p>
        </header>

        <div className="flex justify-center mb-8 gap-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 w-16 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-secondary'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card className="shadow-xl border-none ring-1 ring-border animate-slide-up">
            <CardHeader>
              <CardTitle className="font-headline">Step 1: The Concept</CardTitle>
              <CardDescription>Give your mission a name and set the tactical vibe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input 
                    placeholder="e.g., Grants 50th Birthday Bash" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Squad Size</Label>
                  <Input 
                    type="number" 
                    value={formData.guestCount}
                    onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desired Vibe</Label>
                <Input 
                  placeholder="e.g., Cyberpunk, Retro-Futuristic, High-Stakes Gala" 
                  value={formData.vibe}
                  onChange={(e) => setFormData({...formData, vibe: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleBrainstorm} 
                className="flex-1 rounded-full shadow-lg shadow-primary/20 py-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Brainstorm with AI
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep(3)} 
                className="rounded-full py-6 border-2"
                disabled={loading}
              >
                Skip to Logistics
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && aiSuggestions && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-headline font-bold text-center">Tactical Intel for: {formData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-md group border-none"
                onClick={() => selectTheme(aiSuggestions.theme)}
              >
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-primary font-headline">Recommended Theme</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">{aiSuggestions.theme}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Visual Decryption</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {aiSuggestions.decorIdeas.slice(0, 3).map((idea, i) => (
                          <li key={i}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full">Adopt This Strategy</Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="font-headline text-accent">Engagement Protocols</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {aiSuggestions.activityIdeas.map((activity, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm">
                          <div className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {i+1}
                          </div>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Refine Concept
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <Card className="shadow-xl border-none ring-1 ring-border animate-slide-up">
            <CardHeader>
              <CardTitle className="font-headline">Step 3: Final Deployment</CardTitle>
              <CardDescription>Verify the coordinates and activation window.</CardDescription>
            </CardHeader>
            <form onSubmit={handleFinalSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g., Spectacular Birthday Bash"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Calendar className="h-4 w-4 text-primary" /> Date</Label>
                    <Input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Time</Label>
                    <Input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-primary" /> Coordinates / Venue</Label>
                  <Input 
                    placeholder="Enter the HQ address or venue name" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Mission Briefing (Optional)</Label>
                  <Textarea 
                    placeholder="What should your allies know?" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button variant="outline" type="button" onClick={() => setStep(aiSuggestions ? 2 : 1)} className="flex-1 rounded-full">
                  Back
                </Button>
                <Button type="submit" className="flex-[2] rounded-full shadow-lg shadow-primary/20 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Launch Mission <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
