import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, Trash2, Edit2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { TaskForm } from "./TaskForm";
// Task type is inferred from the API response

interface TaskListProps {
  folderId: number;
}

const STATUS_COLORS = {
  Pending: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS = {
  Low: "text-gray-500",
  Medium: "text-yellow-600",
  High: "text-red-600",
};

export function TaskList({ folderId }: TaskListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<"Pending" | "In Progress" | "Completed">("Pending");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({ folderId });

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: async () => {
      setEditingId(null);
      await utils.tasks.list.invalidate();
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });

  const handleStatusToggle = (task: any) => {
    const statusCycle: Record<string, "Pending" | "In Progress" | "Completed"> = {
      Pending: "In Progress",
      "In Progress": "Completed",
      Completed: "Pending",
    };
    const newStatus = statusCycle[task.status];
    updateTaskMutation.mutate({ id: task.id, status: newStatus });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading tasks...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No tasks yet</p>
        <TaskForm folderId={folderId} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Tasks ({tasks.length})</h3>
        <TaskForm folderId={folderId} />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-smooth">
            <div className="flex items-start gap-3">
              {/* Status Toggle */}
              <button
                onClick={() => handleStatusToggle(task)}
                className="mt-1 flex-shrink-0 transition-colors hover:opacity-70"
              >
                {task.status === "Completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>
                    {task.status}
                  </span>
                </div>

                {/* Task Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {task.priority && (
                    <span className={`font-medium ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
                      {task.priority} Priority
                    </span>
                  )}
                  {task.estimatedMinutes && (
                    <span className="flex items-center gap-1">
                      <span>~{task.estimatedMinutes}m</span>
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(task.id);
                        setEditingStatus(task.status);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={editingStatus} onValueChange={(val: any) => setEditingStatus(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => {
                          updateTaskMutation.mutate({ id: task.id, status: editingStatus });
                        }}
                        disabled={updateTaskMutation.isPending}
                      >
                        {updateTaskMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog open={deletingId === task.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(task.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteTaskMutation.mutate({ id: task.id });
                          setDeletingId(null);
                        }}
                        disabled={deleteTaskMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
