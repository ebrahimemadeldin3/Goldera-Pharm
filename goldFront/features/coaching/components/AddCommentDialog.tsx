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
          className="bg-dashboard-green border-dashboard-green hover:text-dashboard-green cursor-pointer border text-white hover:bg-white"
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
          Add Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-128">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-black">
            Add Your Comment
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Share your thoughts, thanks, questions, or progress updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick responses */}
          <div className="p-4 bg-secondary-very-light">
            <p className="mb-3 text-sm/5 font-normal text-secondary-dark">
              Quick responses:
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("Thank you")}
                className="text-xs"
              >
                <ThumbsUp className="mr-1 h-3 w-3" />
                Thank you
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("I agree")}
                className="text-xs"
              >
                I agree
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse("Question")}
                className="text-xs"
              >
                Question
              </Button>
            </div>
          </div>

          {/* Your Response */}
          <div>
            <label
              htmlFor="comment"
              className="mb-2 block text-sm font-medium text-black"
            >
              Your Response
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Examples:&#10;• Thank you for the feedback! I'll work on improving my objection handling.&#10;• I appreciate your guidance. Could you recommend specific resources for...&#10;• I've already started implementing your suggestions and seeing positive results."
              className="placeholder:text-secondary-text min-h-30 max-h-50 border border-slate-200 bg-secondary-very-light px-3 py-2 text-sm font-normal shadow-none"
            />
            <p className="text-secondary-dark mt-2 text-xs/4">
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
            className="border-secondary-light"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="button-system-gradient-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
