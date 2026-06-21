"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // Current rating (e.g. 3.4 or 4)
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  interactive = false,
  onRatingChange,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const handleStarClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  // Logic to determine fill percentage for each star (for fractional ratings like 4.2)
  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;
    
    // When interactive, we light up based on hover state or selected value
    if (interactive) {
      const active = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
      return (
        <button
          key={starIndex}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
          className="focus:outline-none transition-transform active:scale-95 duration-100 cursor-pointer"
        >
          <Star
            className={`${sizeClass[size]} ${
              active
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                : "text-slate-600 fill-slate-800"
            } transition duration-150`}
          />
        </button>
      );
    }

    // Read-only fractional fill
    const fillAmount = Math.max(0, Math.min(1, rating - starIndex));
    
    return (
      <div key={starIndex} className="relative inline-block">
        {/* Empty background star */}
        <Star className={`${sizeClass[size]} text-slate-700 fill-slate-900`} />
        {/* Filled foreground star with clip-path */}
        {fillAmount > 0 && (
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${fillAmount * 100}%` }}
          >
            <Star
              className={`${sizeClass[size]} fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.2)]`}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
    </div>
  );
}
