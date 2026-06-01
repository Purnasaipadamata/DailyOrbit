import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
import { Route, Switch } from "wouter";
import FoldersPage from "./FoldersPage";
import TimetablePage from "./TimetablePage";
import AnalyticsPage from "./AnalyticsPage";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={FoldersPage} />
        <Route path="/dashboard/timetable" component={TimetablePage} />
        <Route path="/dashboard/analytics" component={AnalyticsPage} />
        <Route component={FoldersPage} />
      </Switch>
    </DashboardLayout>
  );
}
