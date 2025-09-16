// Breadcrumb component for graph navigation history
'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/store/graph-store';
import { formatDisplayWord } from '@/lib/text-utils';

interface BreadcrumbProps {
  className?: string;
  maxItems?: number;
}

export function Breadcrumb({ className, maxItems = 5 }: BreadcrumbProps) {
  const { history, centerId, expandTo, isLoading } = useGraphStore();

  // Handle breadcrumb item click
  const handleItemClick = async (word: string, index: number) => {
    if (isLoading || word === centerId) return;

    try {
      // If clicking on an earlier item, we could either:
      // 1. Go back in history (removing items after clicked one)
      // 2. Expand to that word (keeping current graph)
      // We'll implement option 2 for better UX
      await expandTo(word);
    } catch (error) {
      console.error('Failed to navigate to breadcrumb item:', error);
    }
  };

  // Handle home button click (reset to initial word)
  const handleHomeClick = async () => {
    if (isLoading || history.length === 0) return;

    const firstWord = history[0];
    if (firstWord && firstWord !== centerId) {
      try {
        await expandTo(firstWord);
      } catch (error) {
        console.error('Failed to navigate home:', error);
      }
    }
  };

  // Truncate history if it's too long
  const displayHistory = history.length > maxItems
    ? ['...', ...history.slice(-maxItems + 1)]
    : history;

  if (history.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center gap-1 p-2 text-sm ${className}`}>
      {/* Home button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHomeClick}
        disabled={isLoading || history.length <= 1}
        className="h-8 px-2"
        title="İlk kelimeye dön"
      >
        <Home className="h-3 w-3" />
      </Button>

      <ChevronRight className="h-3 w-3 text-muted-foreground" />

      {/* Breadcrumb items */}
      {displayHistory.map((word, index) => {
        const isLast = index === displayHistory.length - 1;
        const isCurrent = word === centerId;
        const isEllipsis = word === '...';

        return (
          <div key={`${word}-${index}`} className="flex items-center gap-1">
            {isEllipsis ? (
              <span className="px-2 py-1 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={isCurrent ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleItemClick(word, index)}
                disabled={isLoading || isCurrent}
                className={`h-8 px-2 ${
                  isCurrent
                    ? 'bg-primary/10 text-primary font-medium cursor-default'
                    : 'hover:bg-muted'
                }`}
                title={isCurrent ? 'Mevcut merkez' : `${formatDisplayWord(word)} kelimesine git`}
              >
                {formatDisplayWord(word)}
              </Button>
            )}

            {!isLast && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        );
      })}

      {/* Current loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">Yükleniyor...</span>
        </div>
      )}
    </nav>
  );
}

/**
 * Compact breadcrumb variant for smaller spaces
 */
export function CompactBreadcrumb({ className }: { className?: string }) {
  const { history, centerId } = useGraphStore();

  if (history.length === 0) {
    return null;
  }

  const displayText = history.length > 3
    ? `...${formatDisplayWord(centerId || '')}`
    : history.map(word => formatDisplayWord(word)).join(' › ');

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <Home className="h-3 w-3" />
      <span className="truncate">{displayText}</span>
      {history.length > 1 && (
        <span className="bg-muted px-1 rounded text-xs">
          {history.length}
        </span>
      )}
    </div>
  );
}