import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ImagePlus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error(t('createPost.emptyError'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      // Upload image if present
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Analyze sentiment (include image URL if available)
      const sentimentResponse = await supabase.functions.invoke('analyze-sentiment', {
        body: { 
          content,
          imageUrl: imageUrl 
        }
      });

      if (sentimentResponse.error) throw sentimentResponse.error;

      const sentiment = sentimentResponse.data;

      // Create post
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          image_url: imageUrl,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label,
        });

      if (insertError) throw insertError;

      toast.success(t('createPost.success'));
      setContent("");
      setImage(null);
      setPreview(null);
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || t('createPost.error'));
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={t('createPost.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] border-border bg-input resize-none"
        />
        
        {preview && (
          <div className="relative rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
            >
              {t('createPost.remove')}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {t('createPost.addImage')}
            </Button>
          </label>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? t('createPost.posting') : t('createPost.post')}
          </Button>
        </div>
      </form>
    </Card>
  );
};