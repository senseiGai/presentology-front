import { useCallback, useRef } from "react";

interface UseSlideNavigationProps {
  slideRefs: React.MutableRefObject<Record<number, HTMLDivElement>>;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const useSlideNavigation = ({
  slideRefs,
  scrollContainerRef,
}: UseSlideNavigationProps) => {
  // Function to scroll to a specific slide
  const scrollToSlide = useCallback(
    (slideNumber: number) => {
      const slideElement = slideRefs.current[slideNumber];
      const container = scrollContainerRef.current;

      if (slideElement && container) {
        slideElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [slideRefs, scrollContainerRef]
  );

  // Function to scroll to slide in sidebar (checks viewport boundaries)
  const scrollToSlideInSidebar = useCallback(
    (slideNumber: number) => {
      const slideElement = slideRefs.current[slideNumber];
      const container = scrollContainerRef.current;

      if (slideElement && container) {
        const containerRect = container.getBoundingClientRect();
        const slideRect = slideElement.getBoundingClientRect();

        // Calculate if slide is outside viewport
        const isAboveViewport = slideRect.top < containerRect.top;
        const isBelowViewport = slideRect.bottom > containerRect.bottom;

        if (isAboveViewport || isBelowViewport) {
          slideElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    [slideRefs, scrollContainerRef]
  );

  return {
    scrollToSlide,
    scrollToSlideInSidebar,
  };
};
