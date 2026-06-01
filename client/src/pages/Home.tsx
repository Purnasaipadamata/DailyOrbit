import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { CheckCircle, Clock, TrendingUp, Zap, Calendar, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DailyOrbit</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Master Your Time,<br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Achieve Your Goals
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DailyOrbit combines hierarchical task management, intelligent scheduling, and powerful analytics to help you stay productive and focused every single day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <a href={getLoginUrl()}>Get Started Free</a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Stay Organized
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to help you manage tasks, schedule your time, and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Hierarchical Organization</h3>
            <p className="text-muted-foreground">
              Organize tasks into nested folders with unlimited depth. Mirror how you naturally think about your work.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Smart Scheduling</h3>
            <p className="text-muted-foreground">
              Assign tasks to weekly time slots with drag-and-drop. Get instant conflict detection and recurrence support.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Track completion rates, streaks, overdue tasks, and productivity insights in real-time.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Task Management</h3>
            <p className="text-muted-foreground">
              Create, prioritize, and track tasks with status, priority levels, due dates, and estimated duration.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your productivity with daily, weekly, and folder-wise completion rates and streaks.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="p-6 border border-border hover:shadow-lg transition-smooth hover:border-primary/50">
            <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Time Management</h3>
            <p className="text-muted-foreground">
              Schedule tasks with recurrence patterns and get alerts for time conflicts and overdue items.
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20 bg-card/50 rounded-2xl border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose DailyOrbit?
            </h2>
            <ul className="space-y-4">
              {[
                "Elegant, intuitive interface designed for productivity",
                "Real-time conflict detection prevents scheduling chaos",
                "Comprehensive analytics reveal your productivity patterns",
                "Flexible organization supports any workflow",
                "Responsive design works on desktop, tablet, and mobile",
                "Secure authentication with Manus OAuth",
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-primary mt-1">87%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-primary mt-1">12 days</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-3xl font-bold text-primary mt-1">156</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users who are mastering their time with DailyOrbit.
          </p>
          <Button size="lg" asChild className="h-12 px-8 text-base">
            <a href={getLoginUrl()}>Start Your Free Journey</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2026 DailyOrbit. All rights reserved. Designed for productivity.</p>
        </div>
      </footer>
    </div>
  );
}
