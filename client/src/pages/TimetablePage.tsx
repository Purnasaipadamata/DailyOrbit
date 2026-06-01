import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

      {/* Weekly Timetable Grid */}
      <Card className="p-6 overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-max">
          {/* Header */}
          <div className="font-semibold text-foreground">Time</div>
          {DAYS.map((day, idx) => (
            <div key={idx} className={`font-semibold text-center p-2 rounded-md ${
              selectedDay === idx ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}>
              {day}
            </div>
          ))}

          {/* Time slots */}
          {HOURS.map((hour) => (
            <div key={`hour-${hour}`}>
              <div className="text-xs text-muted-foreground font-medium">{hour.toString().padStart(2, "0")}:00</div>
              {DAYS.map((_, dayIdx) => {
                const daySlot = daySlots?.find(
                  (s) => parseInt(s.startTime.split(":")[0]) === hour
                );
                return (
                  <div key={`${hour}-${dayIdx}`} className={`p-2 rounded-md text-xs h-12 flex items-center justify-center ${
                    daySlot
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    {daySlot && (
                      <div className="text-center truncate">
                        <p className="font-medium truncate">{daySlot.taskId}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Scheduled Slots List */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 text-foreground">All Scheduled Tasks</h2>
        <div className="space-y-2">
          {slots?.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted transition-smooth">
              <div>
                <p className="font-medium text-foreground">{DAYS[slot.dayOfWeek]}</p>
                <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSlotMutation.mutate({ id: slot.id })}
                disabled={deleteSlotMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
