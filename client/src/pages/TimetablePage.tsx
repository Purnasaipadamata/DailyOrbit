import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [newSlot, setNewSlot] = useState({
    taskId: "",
    startTime: "09:00",
    endTime: "10:00",
    recurrence: "Weekly" as const,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.all.useQuery();
  const { data: slots, isLoading: slotsLoading } = trpc.timetable.list.useQuery();
  const { data: daySlots } = trpc.timetable.forDay.useQuery({ dayOfWeek: selectedDay });

  const createSlotMutation = trpc.timetable.create.useMutation({
    onSuccess: async () => {
      setNewSlot({ taskId: "", startTime: "09:00", endTime: "10:00", recurrence: "Weekly" });
      await utils.timetable.list.invalidate();
      await utils.timetable.forDay.invalidate();
      toast.success("Task scheduled successfully");
    },
    onError: () => toast.error("Failed to schedule task"),
  });

  const deleteSlotMutation = trpc.timetable.delete.useMutation({
    onSuccess: async () => {
      setDeletingId(null);
      await utils.timetable.list.invalidate();
      await utils.timetable.forDay.invalidate();
      toast.success("Schedule deleted");
    },
    onError: () => toast.error("Failed to delete schedule"),
  });

  const handleCreateSlot = () => {
    if (!newSlot.taskId) {
      toast.error("Please select a task");
      return;
    }
    createSlotMutation.mutate({
      taskId: parseInt(newSlot.taskId),
      dayOfWeek: selectedDay,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      recurrence: newSlot.recurrence,
    });
  };

  const checkConflict = (start: string, end: string) => {
    if (!daySlots) return false;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return daySlots.some((slot) => {
      const [slotStartH, slotStartM] = slot.startTime.split(":").map(Number);
      const [slotEndH, slotEndM] = slot.endTime.split(":").map(Number);
      const slotStartMins = slotStartH * 60 + slotStartM;
      const slotEndMins = slotEndH * 60 + slotEndM;

      return !(endMins <= slotStartMins || startMins >= slotEndMins);
    });
  };

  if (tasksLoading || slotsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasConflict = checkConflict(newSlot.startTime, newSlot.endTime);
  const getTaskName = (taskId: number) => tasks?.find((t) => t.id === taskId)?.title || `Task #${taskId}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task">Task</Label>
                <Select value={newSlot.taskId} onValueChange={(val) => setNewSlot({ ...newSlot, taskId: val })}>
                  <SelectTrigger id="task">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={selectedDay.toString()} onValueChange={(val) => setSelectedDay(parseInt(val))}>
                  <SelectTrigger id="day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select value={newSlot.recurrence} onValueChange={(val: any) => setNewSlot({ ...newSlot, recurrence: val })}>
                  <SelectTrigger id="recurrence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasConflict && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  ⚠️ This time slot conflicts with an existing task
                </div>
              )}

              <Button onClick={handleCreateSlot} disabled={createSlotMutation.isPending || hasConflict}>
                {createSlotMutation.isPending ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="list">All Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="p-6 overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-max">
              <div className="font-semibold text-foreground text-sm">Time</div>
              {DAYS.map((day, idx) => (
                <div key={idx} className={`font-semibold text-center p-2 rounded-md text-sm ${
                  selectedDay === idx ? "bg-primary text-primary-foreground" : "text-foreground"
                }`}>
                  {day.slice(0, 3)}
                </div>
              ))}

              {HOURS.map((hour) => (
                <div key={`hour-${hour}`} className="contents">
                  <div className="text-xs text-muted-foreground font-medium p-1">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const daySlot = slots?.find(
                      (s) => s.dayOfWeek === dayIdx && parseInt(s.startTime.split(":")[0]) === hour
                    );
                    return (
                      <div key={`${hour}-${dayIdx}`} className={`p-1 rounded-md text-xs h-10 flex items-center justify-center overflow-hidden ${
                        daySlot ? "bg-primary text-primary-foreground font-medium" : "bg-muted/50"
                      }`}>
                        {daySlot && (
                          <span className="truncate" title={getTaskName(daySlot.taskId)}>
                            {getTaskName(daySlot.taskId)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold mb-4 text-foreground">All Scheduled Tasks</h2>
            {slots && slots.length > 0 ? (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted transition-smooth">
                    <div className="flex-1">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {DAYS[slot.dayOfWeek]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {slot.startTime} - {slot.endTime} • {getTaskName(slot.taskId)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recurrence: {slot.recurrence}
                      </p>
                    </div>
                    <AlertDialog open={deletingId === slot.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(slot.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this scheduled task? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteSlotMutation.mutate({ id: slot.id });
                            }}
                            disabled={deleteSlotMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteSlotMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No scheduled tasks yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
