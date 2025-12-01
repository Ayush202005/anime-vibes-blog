import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Area, AreaChart } from "recharts";
import { Loader2, TrendingUp, MessageSquare, Smile, Frown, Meh, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SentimentData {
  label: string;
  count: number;
  percentage: number;
}

interface TrendData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface Stats {
  totalPosts: number;
  avgSentiment: number;
  mostCommon: string;
}

export const SentimentDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sentimentDistribution, setSentimentDistribution] = useState<SentimentData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, avgSentiment: 0, mostCommon: 'neutral' });

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('sentiment_label, sentiment_score, created_at')
        .not('sentiment_label', 'is', null);

      if (error) throw error;

      if (posts && posts.length > 0) {
        // Calculate distribution
        const distribution = posts.reduce((acc: any, post) => {
          const label = post.sentiment_label || 'neutral';
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {});

        const total = posts.length;
        const distributionData: SentimentData[] = Object.entries(distribution).map(([label, count]) => ({
          label,
          count: count as number,
          percentage: Math.round(((count as number) / total) * 100)
        }));

        setSentimentDistribution(distributionData);

        // Calculate trends (last 7 days)
        const now = new Date();
        const trends: { [key: string]: { positive: number; negative: number; neutral: number } } = {};
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trends[dateStr] = { positive: 0, negative: 0, neutral: 0 };
        }

        posts.forEach(post => {
          const postDate = new Date(post.created_at);
          const dateStr = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (trends[dateStr]) {
            const label = post.sentiment_label || 'neutral';
            trends[dateStr][label as keyof typeof trends[string]]++;
          }
        });

        const trendArray: TrendData[] = Object.entries(trends).map(([date, values]) => ({
          date,
          ...values
        }));

        setTrendData(trendArray);

        // Calculate stats
        const avgScore = posts.reduce((sum, post) => sum + (post.sentiment_score || 0), 0) / posts.length;
        const mostCommon = distributionData.sort((a, b) => b.count - a.count)[0]?.label || 'neutral';

        setStats({
          totalPosts: total,
          avgSentiment: parseFloat(avgScore.toFixed(2)),
          mostCommon
        });
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const SENTIMENT_COLORS = {
    positive: 'hsl(142 76% 36%)',
    negative: 'hsl(0 85% 60%)',
    neutral: 'hsl(190 85% 55%)'
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-destructive" />;
      default:
        return <Meh className="h-5 w-5 text-secondary" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (sentimentDistribution.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('dashboard.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:shadow-[var(--shadow-card)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('dashboard.totalPosts')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:shadow-[var(--shadow-card)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('dashboard.avgSentiment')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgSentiment}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.outOf1')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border hover:shadow-[var(--shadow-card)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('dashboard.mostCommon')}
            </CardTitle>
            {getSentimentIcon(stats.mostCommon)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize text-foreground">{t(`sentiment.${stats.mostCommon}`)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('dashboard.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="distribution">{t('dashboard.distribution')}</TabsTrigger>
              <TabsTrigger value="trends">{t('dashboard.trends')}</TabsTrigger>
              <TabsTrigger value="breakdown">{t('dashboard.breakdown')}</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution" className="space-y-4">
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percentage }) => `${t(`sentiment.${label}`)}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sentimentDistribution.map((entry) => (
                        <Cell key={`cell-${entry.label}`} fill={SENTIMENT_COLORS[entry.label as keyof typeof SENTIMENT_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} posts (${props.payload.percentage}%)`,
                        t(`sentiment.${props.payload.label}`)
                      ]}
                    />
                    <Legend 
                      formatter={(value) => t(`sentiment.${value}`)}
                      wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))'
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: any, name: any) => [value, t(`sentiment.${name}`)]}
                    />
                    <Legend 
                      formatter={(value) => t(`sentiment.${value}`)}
                      wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="positive" 
                      stackId="1"
                      stroke={SENTIMENT_COLORS.positive} 
                      fill={SENTIMENT_COLORS.positive}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="neutral" 
                      stackId="1"
                      stroke={SENTIMENT_COLORS.neutral} 
                      fill={SENTIMENT_COLORS.neutral}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="negative" 
                      stackId="1"
                      stroke={SENTIMENT_COLORS.negative} 
                      fill={SENTIMENT_COLORS.negative}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => t(`sentiment.${value}`)}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} posts (${props.payload.percentage}%)`,
                        t(`sentiment.${props.payload.label}`)
                      ]}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {sentimentDistribution.map((entry) => (
                        <Cell key={`cell-${entry.label}`} fill={SENTIMENT_COLORS[entry.label as keyof typeof SENTIMENT_COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
