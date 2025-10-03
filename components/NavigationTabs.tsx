import { Button } from "@/components/ui/button";
import { navigationTabs, ViewType } from "@/constants/app-data";
import { useRef, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface NavigationTabsProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function NavigationTabs({ currentView, setCurrentView }: NavigationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  // Determine active tab based on pathname
  const getActiveTab = (): ViewType => {
    if (pathname.startsWith('/therabook')) return 'book';
    if (pathname.startsWith('/theraself')) return 'self-test';
    if (pathname.startsWith('/therastore')) return 'store';
    if (pathname.startsWith('/theralearn')) return 'learn';
    if (pathname.startsWith('/therapists')) return 'therapists';
    if (pathname.startsWith('/blog')) return 'blog';
    return currentView;
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: typeof navigationTabs[0]) => {
    if (tab.url) {
      router.push(tab.url);
    } else {
      setCurrentView(tab.key as ViewType);
    }
  };

  // Check scroll position to show/hide scroll indicators
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
      
      // Calculate current scroll position for pagination
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const totalScrollWidth = container.scrollWidth;
      const numberOfPages = Math.ceil(totalScrollWidth / containerWidth);
      const currentPage = Math.floor(scrollLeft / containerWidth);
      setCurrentScrollIndex(Math.min(currentPage, numberOfPages - 1));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Auto-scroll to active tab on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const activeButton = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const isVisible = 
          buttonRect.left >= containerRect.left && 
          buttonRect.right <= containerRect.right;
        
        if (!isVisible) {
          activeButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }
      }
    }
  }, [activeTab]);

  // Calculate pagination
  const getNumberOfPages = () => {
    const container = scrollContainerRef.current;
    if (container) {
      return Math.max(1, Math.ceil(container.scrollWidth / container.clientWidth));
    }
    return Math.ceil(navigationTabs.length / 3); // Fallback
  };

  const scrollToPage = (pageIndex: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const scrollLeft = pageIndex * containerWidth;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm flex justify-center items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Desktop: Flex wrap layout */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {navigationTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabClick(tab)}
                className={`flex items-center space-x-2 font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === tab.key 
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile: Horizontal scrollable layout */}
        <div className="sm:hidden relative">
          {/* Left scroll indicator */}
          {showLeftScroll && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          )}
          
          {/* Right scroll indicator */}
          {showRightScroll && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          )}

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-3 pb-2 px-2" style={{ minWidth: 'max-content' }}>
              {navigationTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.key}
                    data-tab={tab.key}
                    variant={activeTab === tab.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center space-x-2 whitespace-nowrap flex-shrink-0 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                      activeTab === tab.key 
                        ? "bg-blue-500 text-white shadow-md scale-105 hover:bg-blue-600" 
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Scroll progress indicator */}
          <div className="flex justify-center mt-3">
            <div className="flex space-x-2">
              {Array.from({ length: getNumberOfPages() }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToPage(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:opacity-75 ${
                    currentScrollIndex === index 
                      ? 'w-8 bg-blue-500 shadow-sm' 
                      : 'w-2 bg-gray-300 hover:bg-blue-300'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
