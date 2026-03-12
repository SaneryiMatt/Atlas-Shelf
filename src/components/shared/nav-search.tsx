"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clapperboard, MapPin, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResultItem {
  id: string;
  kind: "book" | "movie" | "travel";
  title: string;
  href: string;
  meta: string;
}

const kindIcons = {
  book: BookOpen,
  movie: Clapperboard,
  travel: MapPin
} as const;

const kindLabels = {
  book: "书籍",
  movie: "影视",
  travel: "旅行"
} as const;

interface NavSearchProps {
  className?: string;
}

export function NavSearch({ className }: NavSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 搜索请求
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          setIsOpen(false);
          setQuery("");
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className="h-9 w-64 bg-secondary/50 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:bg-secondary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">清除</span>
          </button>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">搜索中...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = kindIcons[result.kind];
                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 transition-colors",
                      selectedIndex === index ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{result.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {kindLabels[result.kind]} · {result.meta}
                      </p>
                    </div>
                  </Link>
                );
              })}
              <div className="border-t border-border/60 px-4 py-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  查看全部搜索结果
                </Link>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              未找到相关结果
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="mt-2 block text-xs hover:underline"
              >
                前往搜索页面
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
