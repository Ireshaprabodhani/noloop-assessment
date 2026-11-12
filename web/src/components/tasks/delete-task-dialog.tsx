"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

interface DeleteTaskDialogProps {
  /** The task to confirm deletion for; the dialog is open while set. */
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  /** Deletes the task. Should throw on failure so the dialog stays open. */
  onConfirm: (task: Task) => Promise<void>;
}

export function DeleteTaskDialog({
  task,
  onOpenChange,
  onConfirm,
}: DeleteTaskDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!task) return;
    setDeleting(true);
    try {
      await onConfirm(task);
    } catch {
      // The caller reports the error; keep the dialog open so the user can retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={task !== null}
      onOpenChange={(open) => {
        if (!deleting) onOpenChange(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{task?.title}&rdquo; will be permanently deleted. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          {/* A plain Button rather than AlertDialogAction, which would close
              the dialog immediately instead of waiting for the request. */}
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting && <Loader2 className="animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
