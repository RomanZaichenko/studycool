import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "../../hooks/useFilters";

describe("useFilters - Unit test", () => {
  it("have to initialize with empty value", () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.filters).toEqual([]);
    expect(result.current.selectedFilters).toEqual([]);
    expect(result.current.inputValue).toBe("");
  });

  it("have to update inputValue", () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.setInputValue("Example");
    });

    expect(result.current.inputValue).toBe("Example");
  });

  describe("addFilter", () => {
    it("have to add new filter and clear input", () => {
      const { result } = renderHook(() => useFilters());

      // 1. Встановлюємо значення
      act(() => {
        result.current.setInputValue("Example");
      });
      // 2. Викликаємо додавання
      act(() => {
        result.current.addFilter();
      });

      expect(result.current.filters).toContain("Example");
      expect(result.current.inputValue).toBe("");
    });

    it("have not to take spaces into account", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.setInputValue("   ");
      });
      
      act(() => {
        result.current.addFilter();
      });

      expect(result.current.filters.length).toBe(0);
    });

    it("have not to add duplicates, but should clear input", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.setInputValue("Example");
      });
      act(() => {
        result.current.addFilter();
      });

      act(() => {
        result.current.setInputValue("ExAmpLe");
      });
      act(() => {
        result.current.addFilter();
      });

      expect(result.current.filters.length).toBe(1);
      expect(result.current.filters[0]).toBe("Example");
      expect(result.current.inputValue).toBe("");
    });
  });

  describe("toggleFilter", () => {
    it("have to add filter to selected, if it's not there", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.toggleFilter("Example");
      });

      expect(result.current.selectedFilters).toContain("Example");
    });

    it("have to remove filter from selected, if it's already there", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.toggleFilter("Example");
      });
      
      act(() => {
        result.current.toggleFilter("Example");
      });

      expect(result.current.selectedFilters).not.toContain("Example");
    });
  });

  describe("removeFilter", () => {
    it("have to remove filter from both lists", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.setInputValue("Example");
      });
      act(() => {
        result.current.addFilter();
      });
      act(() => {
        result.current.toggleFilter("Example"); 
      });

      expect(result.current.filters).toContain("Example");
      expect(result.current.selectedFilters).toContain("Example");

      act(() => {
        result.current.removeFilter("Example");
      });

      expect(result.current.filters).not.toContain("Example");
      expect(result.current.selectedFilters).not.toContain("Example");
    });
  });
});