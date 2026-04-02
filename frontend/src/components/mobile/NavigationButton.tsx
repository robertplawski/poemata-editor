import { ArrowLeft, ArrowRight } from "lucide-react";
import { type RefObject, useEffect, useMemo, useState } from "react";
import { cn } from "../../utils/cn";
import { IconButton } from "../IconButton";

interface NavigationButtonProps {
  direction: "left" | "right";
  containerRef: RefObject<HTMLElement | null>;
}

const useContainerScroll = (ref: RefObject<HTMLElement | null>) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const moveByFraction = (fraction: number) => {
    if (!ref || !ref.current) return;
    const { current: container } = ref;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const scrollAmount = fraction * maxScrollLeft;
    container.scrollBy(scrollAmount, 0);
  };

  useEffect(() => {
    if (!ref) return;
    const container = ref.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      const percentage =
        maxScrollLeft > 0 ? container.scrollLeft / maxScrollLeft : 0;
      const fixedPercentage = Math.round(percentage * 100) / 100;

      setScrollPercentage(fixedPercentage);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);

  return { scrollPercentage, moveByFraction };
};

export default function NavigationButton({
  direction,
  containerRef,
}: NavigationButtonProps) {
  const { scrollPercentage, moveByFraction } = useContainerScroll(containerRef);

  const moveToSide = () => {
    moveByFraction(((direction === "left" ? -1 : 1) * 1) / 2);
  };

  const visible = useMemo(() => {
    if (!containerRef || !containerRef.current) return;

    const invisibleClassName = "opacity-0 pointer-events-none";

    if (direction === "left" && scrollPercentage === 0)
      return invisibleClassName;

    if (direction === "right" && scrollPercentage === 1)
      return invisibleClassName;
  }, [containerRef, direction, scrollPercentage]);
  const disabled = useMemo(() => {
    if (!containerRef || !containerRef.current) return;

    return (
      (direction === "left" && scrollPercentage === 0) ||
      (direction === "right" && scrollPercentage === 1)
    );
  }, [containerRef, direction, scrollPercentage]);

  const side = direction === "left" ? "left-0" : "right-0";

  return (
    <div
      className={cn(
        "pointer-events-none absolute flex justify-center px-4 overflow-hidden h-[100vh] w-[100vw] opacity-100 md:opacity-0",
      )}
    >
      <IconButton
        onClick={() => moveToSide()}
        disabled={disabled}
        className={cn(
          "transition-opacity p-4 pointer-events-auto text-neutral-700 cursor-pointer bottom-[10%] mx-4 absolute ",
          visible,
          side,
        )}
      >
        {direction === "left" ? <ArrowLeft /> : <ArrowRight />}
      </IconButton>
    </div>
  );
}
