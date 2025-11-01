import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Frown, Zap, Brain, Wind, AlertCircle, CloudRain } from "lucide-react";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  sentiment_label: string | null;
  sentiment_score: number | null;
  created_at: string;
}

interface PostCardProps {
  post: Post;
}

const sentimentConfig = {
  happy: { icon: Smile, color: "hsl(45 93% 47%)", label: "Happy" },
  sad: { icon: Frown, color: "hsl(217 91% 60%)", label: "Sad" },
  excited: { icon: Zap, color: "hsl(320 85% 60%)", label: "Excited" },
  angry: { icon: AlertCircle, color: "hsl(0 85% 60%)", label: "Angry" },
  neutral: { icon: Wind, color: "hsl(280 10% 70%)", label: "Neutral" },
  thoughtful: { icon: Brain, color: "hsl(280 80% 65%)", label: "Thoughtful" },
  anxious: { icon: CloudRain, color: "hsl(240 80% 65%)", label: "Anxious" },
  peaceful: { icon: Heart, color: "hsl(160 75% 55%)", label: "Peaceful" },
};

export const PostCard = ({ post }: PostCardProps) => {
  const sentiment = post.sentiment_label 
    ? sentimentConfig[post.sentiment_label as keyof typeof sentimentConfig] 
    : null;
  
  const SentimentIcon = sentiment?.icon || Smile;

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
              {sentiment.label}
              {post.sentiment_score !== null && (
                <span className="text-xs opacity-80">
                  {(post.sentiment_score * 100).toFixed(0)}%
                </span>
              )}
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};