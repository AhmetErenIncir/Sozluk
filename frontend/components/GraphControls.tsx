// GraphControls component with search, settings, and navigation
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ChangeEvent } from 'react';
import { Search, ArrowLeft, RotateCcw, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGraphStore } from '@/store/graph-store';
import { useDebounce } from '@/lib/hooks';

interface GraphControlsProps {
  className?: string;
}

export function GraphControls({ className }: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'new' | 'expand'>('expand');

  const {
    isLoading,
    error,
    history,
    physicsEnabled,
    maxNodes,
    maxRelatedPerNode,
    loadInitial,
    expandTo,
    goBack,
    reset,
    togglePhysics,
    setMaxNodes,
    setMaxRelatedPerNode,
    clearError,
  } = useGraphStore();

  // Debounce search input to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle search submission
  const handleSearch = useCallback(async () => {
    if (!debouncedSearchQuery.trim()) return;

    try {
      if (searchMode === 'new') {
        await loadInitial(debouncedSearchQuery);
      } else {
        await expandTo(debouncedSearchQuery);
      }
      setSearchQuery(''); // Clear search after successful operation
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [debouncedSearchQuery, searchMode, loadInitial, expandTo]);

  // Auto-search when debounced query changes (optional behavior)
  useEffect(() => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery !== searchQuery) {
      // Only auto-search if user hasn't typed for a while
      // This is disabled by default to avoid excessive API calls
      // handleSearch();
    }
  }, [debouncedSearchQuery]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Handle slider changes with validation
  const handleMaxNodesChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(50, Math.min(500, parseInt(e.target.value) || 250));
    setMaxNodes(value);
  }, [setMaxNodes]);

  const handleMaxRelatedChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(5, Math.min(50, parseInt(e.target.value) || 20));
    setMaxRelatedPerNode(value);
  }, [setMaxRelatedPerNode]);

  return (
    <div className={`flex items-center gap-4 p-4 bg-background/95 border-b ${className}`}>
      {/* Search Section */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Bir kelime arayın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isLoading}
          size="sm"
        >
          {searchMode === 'new' ? 'Yeni Graf' : 'Genişlet'}
        </Button>
      </div>

      {/* Search Mode Toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Mod:</Label>
        <select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value as 'new' | 'expand')}
          className="px-2 py-1 text-sm rounded border bg-background"
        >
          <option value="expand">Genişlet</option>
          <option value="new">Yeni Graf</option>
        </select>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goBack}
          disabled={history.length <= 1 || isLoading}
          title="Geri git"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={isLoading}
          title="Grafiği sıfırla"
        >
          <RotateCcw className="h-4 w-4" />
          Sıfırla
        </Button>
      </div>

      {/* Physics Control */}
      <Button
        variant="outline"
        size="sm"
        onClick={togglePhysics}
        title={physicsEnabled ? 'Fiziği durdur' : 'Fiziği başlat'}
      >
        {physicsEnabled ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Settings Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" title="Ayarlar">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <Label htmlFor="max-nodes">Maksimum Node Sayısı</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="max-nodes"
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={maxNodes}
                  onChange={handleMaxNodesChange}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-right">{maxNodes}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Grafikteki maksimum kelime sayısı
              </p>
            </div>

            <div>
              <Label htmlFor="max-related">Kelime Başına İlişkili Kelime</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="max-related"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxRelatedPerNode}
                  onChange={handleMaxRelatedChange}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-right">{maxRelatedPerNode}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Her kelime için gösterilecek maksimum ilişkili kelime sayısı
              </p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Fizik Simülasyonu</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePhysics}
                >
                  {physicsEnabled ? 'Durdur' : 'Başlat'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Node'ların otomatik yerleşimi
              </p>
            </div>

            {/* Graph Statistics */}
            <div className="pt-2 border-t">
              <Label>Graf İstatistikleri</Label>
              <div className="text-xs text-muted-foreground space-y-1 mt-1">
                <div>Geçmiş: {history.length} merkez</div>
                <div>Fizik: {physicsEnabled ? 'Aktif' : 'Pasif'}</div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-destructive">Hata: {error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-destructive hover:text-destructive"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Yükleniyor...
        </div>
      )}
    </div>
  );
}
