"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => void;
  isPending: boolean;
}

export function AddCommentDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddCommentDialogProps) {
  const [comment, setComment] = useState("");

  const handleQuickResponse = (response: string) => {
    setComment(response);
  };

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-gp-success border-gp-success hover:bg-gp-success-soft hover:border-gp-success hover:text-gp-success cursor-pointer rounded-[10px] border text-white shadow-none transition-[background-color,border-color,color,transform] duration-[190ms] hover:-translate-y-px"
          size="sm"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Add Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-128">
        <DialogHeader>
          <DialogTitle className="text-gp-navy-900 text-lg font-semibold">
            Add Your Comment
          </DialogTitle>
          <DialogDescription className="text-gp-text-muted text-sm">
            Share your thoughts, thanks, questions, or progress updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick responses */}
          <div className="border-gp-border-subtle bg-gp-surface-subtle/60 rounded-[12px] border p-4">
            <p className="text-gp-navy-900 mb-3 text-sm leading-5 font-semibold">
              Quick responses:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("Thank you")}
                className="text-gp-text-secondary border-gp-border-control hover:border-gp-gold-300 hover:bg-gp-gold-50 text-xs font-semibold"
              >
                <ThumbsUp
                  className="text-gp-gold-600 mr-1 size-3"
                  aria-hidden="true"
                />
                Thank you
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("I agree")}
                className="text-gp-text-secondary border-gp-border-control hover:border-gp-gold-300 hover:bg-gp-gold-50 text-xs font-semibold"
              >
                I agree
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("Question")}
                className="text-gp-text-secondary border-gp-border-control hover:border-gp-gold-300 hover:bg-gp-gold-50 text-xs font-semibold"
              >
                Question
              </Button>
            </div>
          </div>

          {/* Your Response */}
          <div>
            <label
              htmlFor="comment"
              className="text-gp-navy-900 mb-2 block text-sm font-semibold"
            >
              Your Response
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Examples:&#10;• Thank you for the feedback! I'll work on improving my objection handling.&#10;• I appreciate your guidance. Could you recommend specific resources for...&#10;• I've already started implementing your suggestions and seeing positive results."
              className="placeholder:text-gp-text-placeholder border-gp-border-control bg-gp-surface-control focus-visible:border-gp-gold-500 text-gp-navy-900 focus-visible:ring-gp-gold-500/15 max-h-50 min-h-30 rounded-[10px] px-3.5 py-2.5 text-sm shadow-none"
            />
            <p className="text-gp-text-muted mt-2 text-xs leading-4">
              You can express thanks, ask questions, or share progress updates.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="text-gp-navy-900 border-gp-border-default hover:border-gp-gold-300 hover:bg-gp-gold-50 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gp-gold-500 hover:bg-gp-gold-600 shadow-gp-gold-action font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
