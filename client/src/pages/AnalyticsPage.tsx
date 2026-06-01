import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertCircle, Clock, Flame, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.summary.useQuery();
  const { data: weekly, isLoading: weeklyLoading } = trpc.analytics.weekly.useQuery();

  if (summaryLoading || weeklyLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare weekly data for chart
  const weeklyData = weekly
    ? Object.entries(weekly).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        completed: count,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Progress Analytics</h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Completion Rate */}
        <Card className="p-6 border border-border hover:shadow-lg transition-smooth">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary?.completionRate || 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Today's progress</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Overdue Tasks */}
        <Card className="p-6 border border-border hover:shadow-lg transition-smooth">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary?.overdueCount || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Pending Workload */}
        <Card className="p-6 border border-border hover:shadow-lg transition-smooth">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Workload</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary?.pendingCount || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Tasks to complete</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Average Time in Progress */}
        <Card className="p-6 border border-border hover:shadow-lg transition-smooth">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time in Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary?.avgTimeInProgress || 0}m</p>
              <p className="text-xs text-muted-foreground mt-1">Per task</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Streak Tracker */}
        <Card className="p-6 border border-border hover:shadow-lg transition-smooth">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold text-foreground mt-2">{summary?.streak || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Consecutive days</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Completion Chart */}
      <Card className="p-6 border border-border">
        <h2 className="font-semibold text-foreground mb-4">Weekly Completion Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="completed" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insights */}
      <Card className="p-6 border border-border">
        <h2 className="font-semibold text-foreground mb-4">Insights</h2>
        <div className="space-y-3">
          {summary && summary.streak > 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-900">
                Great job! You have a {summary.streak}-day streak. Keep it up! 🔥
              </p>
            </div>
          )}
          {summary && summary.overdueCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-900">
                You have {summary.overdueCount} overdue task{summary.overdueCount !== 1 ? "s" : ""}. Consider prioritizing them.
              </p>
            </div>
          )}
          {summary && summary.completionRate >= 80 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-900">
                Excellent productivity! You're completing {summary.completionRate}% of your tasks today.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
