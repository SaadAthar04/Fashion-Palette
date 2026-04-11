"use client";

import { useState } from "react";
import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { Review } from "@/types";

interface ReviewSectionProps {
  reviews: Review[];
  productId: number;
  isLoggedIn?: boolean;
}

function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hovered || rating) >= star
                ? "fill-accent text-accent"
                : "fill-none text-border"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border border-border rounded-lg p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {review.user?.name || "Anonymous"}
            </p>
            <p className="text-xs text-muted">{formattedDate}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

export default function ReviewSection({
  reviews,
  productId,
  isLoggedIn = false,
}: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedReviews = reviews.filter((r) => r.isApproved);

  const averageRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
        approvedReviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approvedReviews.filter((r) => r.rating === star).length,
    percentage:
      approvedReviews.length > 0
        ? (approvedReviews.filter((r) => r.rating === star).length /
            approvedReviews.length) *
          100
        : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          comment: formComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setShowForm(false);
      setFormRating(0);
      setFormComment("");
    } catch {
      // Error handled silently - toast could be added
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Average Rating */}
        <div className="text-center md:text-left md:min-w-[200px]">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <StarRating rating={Math.round(averageRating)} size="md" />
          <p className="text-sm text-muted mt-1">
            Based on {approvedReviews.length}{" "}
            {approvedReviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Bars */}
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-right font-medium">{star}</span>
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted text-xs">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="border-t border-border pt-6">
        {isLoggedIn ? (
          !showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <h3 className="text-lg font-semibold">Write Your Review</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Your Rating <span className="text-sale">*</span>
                </label>
                <StarRating
                  rating={formRating}
                  size="lg"
                  interactive
                  onRate={setFormRating}
                />
                {formRating === 0 && (
                  <p className="text-xs text-muted">Click a star to rate</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="review-comment" className="text-sm font-medium">
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={formRating === 0}
                >
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setFormRating(0);
                    setFormComment("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )
        ) : (
          <p className="text-sm text-muted">
            Please{" "}
            <a href="/account/login" className="text-accent hover:text-accent-hover underline">
              sign in
            </a>{" "}
            to write a review.
          </p>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {approvedReviews.length > 0 ? (
          approvedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-12 bg-surface rounded-lg">
            <Star className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-sm text-muted">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
