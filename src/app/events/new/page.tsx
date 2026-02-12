
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Calendar, MapPin, Users, PartyPopper, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { brainstormPartyTheme, type BrainstormPartyThemeOutput } from '@/ai/flows/brainstorm-party-theme';
import { useToast } from '@/hooks/use-toast';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    occasion: '',
    guestCount: 20,
    vibe: '',
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState<BrainstormPartyThemeOutput | null>(null);

  const handleBrainstorm = async () => {
    if (!formData.occasion || !formData.vibe) {
      toast({
        title: "Missing Information",
        description: "Please provide an occasion and vibe for the AI to brainstorm ideas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await brainstormPartyTheme({
        occasion: formData.occasion,
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
    setFormData({ ...formData, name: `${formData.occasion}: ${theme}` });
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving
    toast({
      title: "Event Created!",
      description: "Redirecting to your new event dashboard...",
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <header className="mb-8 text-center">
          <PartyPopper className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline font-bold mb-2">Plan Something Amazing</h1>
          <p className="text-muted-foreground">Let's start with the basics, or let our AI inspire you.</p>
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
              <CardTitle className="font-headline">Step 1: The Basics</CardTitle>
              <CardDescription>Tell us about the occasion you're celebrating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>What's the occasion?</Label>
                  <Input 
                    placeholder="e.g., 30th Birthday, Wedding Anniversary" 
                    value={formData.occasion}
                    onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Guests</Label>
                  <Input 
                    type="number" 
                    value={formData.guestCount}
                    onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>What's the vibe?</Label>
                <Input 
                  placeholder="e.g., Casual backyard, Elegant black-tie, Fun neon disco" 
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
                Skip to Manual Planning
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && aiSuggestions && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-headline font-bold text-center">AI Suggestions for your {formData.occasion}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-md group border-none"
                onClick={() => selectTheme(aiSuggestions.theme)}
              >
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-primary font-headline">The Theme</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">{aiSuggestions.theme}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Decor Ideas</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {aiSuggestions.decorIdeas.slice(0, 3).map((idea, i) => (
                          <li key={i}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full">Select This Theme</Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="font-headline text-accent">Activity Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {aiSuggestions.activityIdeas.map((activity, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm">
                          <div className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                            {i+1}
                          </div>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Re-brainstorm
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <Card className="shadow-xl border-none ring-1 ring-border animate-slide-up">
            <CardHeader>
              <CardTitle className="font-headline">Step 3: Event Details</CardTitle>
              <CardDescription>Fill in the logistical details for your guests.</CardDescription>
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
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Date</Label>
                    <Input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location</Label>
                  <Input 
                    placeholder="Enter an address or venue name" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    placeholder="What should your guests know?" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button variant="outline" type="button" onClick={() => setStep(aiSuggestions ? 2 : 1)} className="flex-1 rounded-full">
                  Back
                </Button>
                <Button type="submit" className="flex-[2] rounded-full shadow-lg shadow-primary/20">
                  Create Event <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
