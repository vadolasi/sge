import { useMemo } from "react";

export const DOTS = "...";

interface PaginationProps {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}

const range = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
};

const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: PaginationProps): (string | number)[] => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);

    // Ensure currentPage is within bounds
    const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPageCount);

    const totalPageNumbers = siblingCount * 2 + 3; // Adjusted for 1 dot on each side

    if (totalPageCount <= totalPageNumbers) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(validCurrentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      validCurrentPage + siblingCount,
      totalPageCount
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const start = 1;
      const end = totalPageNumbers - 1;
      return [...range(start, end), DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const start = totalPageCount - (totalPageNumbers - 2);
      const end = totalPageCount;
      return [1, DOTS, ...range(start, end)];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const start = leftSiblingIndex;
      const end = rightSiblingIndex;
      return [1, DOTS, ...range(start, end), DOTS, totalPageCount];
    }

    return [];
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};

export default usePagination;
