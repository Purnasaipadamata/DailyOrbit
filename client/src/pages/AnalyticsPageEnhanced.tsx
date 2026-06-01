import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, CheckCircle2, AlertCircle, Clock, Flame } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPageEnhanced() {
  const { data: analytics, isLoading } = trpc.analytics.summary.useQuery();
  const { data: dailyData } = trpc.analytics.daily.useQuery({ date: new Date() });
  const { data: weeklyData } = trpc.analytics.weekly.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = [
    {
      title: "Completion Rate",
      value: analytics?.completionRate ? `${(analytics.completionRate * 100).toFixed(1)}%` : "0%",
      icon: CheckCircle2,
      color: "bg-green-50 text-green-700",
      description: "Tasks completed this week",
    },
    {
      title: "Overdue Tasks",
      value: analytics?.overdueCount || 0,
      icon: AlertCircle,
      color: "bg-red-50 text-red-700",
      description: "Tasks past due date",
    },
    {
      title: "Pending Workload",
      value: analytics?.pendingCount || 0,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-700",
      description: "Tasks awaiting completion",
    },
    {
      title: "Avg Time in Progress",
      value: analytics?.avgTimeInProgress ? `${Math.round(analytics.avgTimeInProgress)}m` : "0m",
      icon: Clock,
      color: "bg-purple-50 text-purple-700",
      description: "Average duration per task",
    },
    {
      title: "Streak",
      value: analytics?.streak || 0,
      icon: Flame,
      color: "bg-orange-50 text-orange-700",
      description: "Consecutive days active",
    },
  ];

  const chartData = Array.isArray(weeklyData) ? weeklyData.map((item: any) => ({
    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    completed: item.completedCount || 0,
    pending: item.pendingCount || 0,
    rate: item.completionRate ? Math.round(item.completionRate * 100) : 0,
  })) : [];

  const statusDistribution = [
    { name: "Pending", value: analytics?.pendingCount || 0 },
  ].filter((item) => (item as any).value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">Track your productivity and progress</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className={`p-4 ${metric.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <p className="text-xs opacity-60 mt-1">{metric.description}</p>
                </div>
                <Icon className="w-6 h-6 opacity-50" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Completion Trend */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-foreground mb-4">Weekly Completion Trend</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Task Status Distribution */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4">Task Distribution</h2>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No tasks yet
            </div>
          )}
        </Card>
      </div>

      {/* Completion Rate Trend */}
      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4">Completion Rate Trend</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" label={{ value: "Rate (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Completion Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {analytics?.completionRate ? `${(analytics.completionRate * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overdue Tasks</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{analytics?.overdueCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{analytics?.pendingCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{analytics?.streak || 0} days</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
