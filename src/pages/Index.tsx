import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { CreatePost } from "@/components/CreatePost";
import { PostFeed } from "@/components/PostFeed";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/80 backdrop-blur-md shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('app.signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold bg-[var(--gradient-hero)] bg-clip-text text-transparent animate-in fade-in duration-700">
            {t('hero.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </section>

        {/* Create Post */}
        <section className="max-w-2xl mx-auto">
          <CreatePost onPostCreated={handlePostCreated} />
        </section>

        {/* Posts Feed */}
        <section>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('postFeed.title')}
          </h3>
          <PostFeed refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  );
};

export default Index;