import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Folder, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function FoldersPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const utils = trpc.useUtils();
  const { data: folders, isLoading } = trpc.folders.list.useQuery();
  const { data: children } = trpc.folders.children.useQuery(
    { folderId: selectedFolderId || 0 },
    { enabled: selectedFolderId !== null }
  );
  const { data: tasks } = trpc.tasks.list.useQuery(
    { folderId: selectedFolderId || 0 },
    { enabled: selectedFolderId !== null }
  );

  const createFolderMutation = trpc.folders.create.useMutation({
    onSuccess: async () => {
      setNewFolderName("");
      await utils.folders.list.invalidate();
      toast.success("Folder created successfully");
    },
    onError: () => toast.error("Failed to create folder"),
  });

  const updateFolderMutation = trpc.folders.update.useMutation({
    onSuccess: async () => {
      setEditingId(null);
      setEditingName("");
      await utils.folders.list.invalidate();
      toast.success("Folder updated successfully");
    },
    onError: () => toast.error("Failed to update folder"),
  });

  const deleteFolderMutation = trpc.folders.delete.useMutation({
    onSuccess: async () => {
      setSelectedFolderId(null);
      await utils.folders.list.invalidate();
      toast.success("Folder deleted successfully");
    },
    onError: () => toast.error("Failed to delete folder"),
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate({ name: newFolderName, parentId: selectedFolderId || undefined });
  };

  const handleUpdateFolder = (id: number) => {
    if (!editingName.trim()) return;
    updateFolderMutation.mutate({ id, name: editingName });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Tasks & Folders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
              </div>
              <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending}>
                {createFolderMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders List */}
        <Card className="lg:col-span-1 p-4">
          <h2 className="font-semibold mb-4 text-foreground">Folders</h2>
          <div className="space-y-2">
            {folders?.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-smooth flex items-center gap-2 ${
                  selectedFolderId === folder.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Tasks & Content */}
        <div className="lg:col-span-3 space-y-4">
          {selectedFolderId && (
            <>
              {/* Folder Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => {
                      const folder = folders?.find(f => f.id === selectedFolderId);
                      if (folder) {
                        setEditingId(folder.id);
                        setEditingName(folder.name);
                      }
                    }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Folder Name</Label>
                        <Input
                          id="edit-name"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder(editingId!)}
                        />
                      </div>
                      <Button onClick={() => handleUpdateFolder(editingId!)} disabled={updateFolderMutation.isPending}>
                        {updateFolderMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFolderMutation.mutate({ id: selectedFolderId })}
                  disabled={deleteFolderMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Tasks in Folder */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-foreground">Tasks in this folder</h3>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 border border-border rounded-md hover:bg-muted transition-smooth">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === "Completed" ? "bg-green-100 text-green-700" :
                            task.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks in this folder</p>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
