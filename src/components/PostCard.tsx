import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Smile, Frown, Zap, Brain, Wind, AlertCircle, CloudRain, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  sentiment_label: string | null;
  sentiment_score: number | null;
  created_at: string;
  user_id: string;
}

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
  currentUserId?: string;
}

const sentimentConfig: Record<string, { icon: any; color: string }> = {
  happy: { icon: Smile, color: "hsl(45 93% 47%)" },
  sad: { icon: Frown, color: "hsl(217 91% 60%)" },
  excited: { icon: Zap, color: "hsl(320 85% 60%)" },
  angry: { icon: AlertCircle, color: "hsl(0 85% 60%)" },
  neutral: { icon: Wind, color: "hsl(280 10% 70%)" },
  thoughtful: { icon: Brain, color: "hsl(280 80% 65%)" },
  anxious: { icon: CloudRain, color: "hsl(240 80% 65%)" },
  peaceful: { icon: Heart, color: "hsl(160 75% 55%)" },
};

export const PostCard = ({ post, onDelete, currentUserId }: PostCardProps) => {
  const { t } = useTranslation();
  const sentiment = post.sentiment_label 
    ? sentimentConfig[post.sentiment_label as keyof typeof sentimentConfig] 
    : null;
  
  const SentimentIcon = sentiment?.icon || Smile;
  const isOwner = currentUserId === post.user_id;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success(t('postFeed.deleteSuccess'));
      onDelete?.();
    } catch (error: any) {
      toast.error(t('postFeed.deleteError'));
      console.error('Error deleting post:', error);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm hover:shadow-[var(--glow-primary)] transition-all duration-300 group">
      {post.image_url && (
        <div className="relative overflow-hidden">
          <img 
            src={post.image_url} 
            alt="Post" 
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <p className="text-foreground leading-relaxed">{post.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sentiment && (
              <Badge 
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${sentiment.color}, ${sentiment.color}dd)`,
                  border: `1px solid ${sentiment.color}40`,
                  color: 'white',
                  boxShadow: `0 4px 12px ${sentiment.color}30`
                }}
              >
                <SentimentIcon className="h-4 w-4" />
                {t(`sentiment.${post.sentiment_label}`)}
                {post.sentiment_score !== null && (
                  <span className="text-xs opacity-80">
                    {(post.sentiment_score * 100).toFixed(0)}%
                  </span>
                )}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('postFeed.delete')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('postFeed.deleteConfirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('postFeed.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};