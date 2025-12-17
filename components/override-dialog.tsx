'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { logOverride } from '@/app/actions/override';
import { useRouter } from 'next/navigation';

interface OverrideDialogProps {
  versionId: string;
}

export function OverrideDialog({ versionId }: OverrideDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const router = useRouter();

  async function handleOverride() {
    if (!reason.trim()) {
      alert('Please provide a reason for the override');
      return;
    }

    setLoading(true);
    try {
      await logOverride(versionId, 'GATE_OVERRIDE', reason);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error logging override:', error);
      alert('Failed to log override');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Override Gates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Override Validation Gates</DialogTitle>
          <DialogDescription>
            This will allow you to skip ahead and access all validation steps without completing the previous ones.
            <br /><br />
            <strong className="text-yellow-600">Warning:</strong> Skipping steps may result in incomplete validation and lower scores. This override will be logged and shown in your final validation memo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Override *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need to override the gating (e.g., 'Already have market data from previous research', 'Time-sensitive demo needed')"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              This reason will be included in your validation memo for transparency.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleOverride}
            disabled={loading || !reason.trim()}
            variant="destructive"
          >
            {loading ? 'Overriding...' : 'Confirm Override'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
