import { describe, it, expect } from "vitest";
import { type Node, type Edge } from "@xyflow/react";
import { propagateLevelChange } from "../../nodeLevels";

const node = (id: string, level: number): Node =>
  ({ id, position: { x: 0, y: 0 }, data: { level } }) as unknown as Node;

const edge = (source: string, target: string): Edge =>
  ({ id: `${source}-${target}`, source, target }) as unknown as Edge;

describe("propagateLevelChange", () => {
  it("have to set the root node's own level", () => {
    const nodes = [node("a", 1)];
    const result = propagateLevelChange("a", 2, nodes, []);
    expect(result.find((n) => n.id === "a")?.data.level).toBe(2);
  });

  it("have to propagate level+1 down a chain of children", () => {
    const nodes = [node("a", 1), node("b", 1), node("c", 1)];
    const edges = [edge("a", "b"), edge("b", "c")];

    const result = propagateLevelChange("a", 1, nodes, edges);

    expect(result.find((n) => n.id === "a")?.data.level).toBe(1);
    expect(result.find((n) => n.id === "b")?.data.level).toBe(2);
    expect(result.find((n) => n.id === "c")?.data.level).toBe(3);
  });

  it("have to cap the level at 3, never going higher", () => {
    const nodes = [node("a", 1)];
    const result = propagateLevelChange("a", 5, nodes, []);
    expect(result.find((n) => n.id === "a")?.data.level).toBe(3);
  });

  it("have to stop recursing once a node hits level 3, leaving its children untouched", () => {
    const nodes = [node("a", 1), node("b", 1), node("c", 1)];
    const edges = [edge("a", "b"), edge("b", "c")];

    const result = propagateLevelChange("b", 3, nodes, edges);

    expect(result.find((n) => n.id === "b")?.data.level).toBe(3);
    expect(result.find((n) => n.id === "c")?.data.level).toBe(1);
  });

  it("have to propagate to every child on fan-out (one parent, two children)", () => {
    const nodes = [node("a", 1), node("b", 1), node("c", 1)];
    const edges = [edge("a", "b"), edge("a", "c")];

    const result = propagateLevelChange("a", 1, nodes, edges);

    expect(result.find((n) => n.id === "b")?.data.level).toBe(2);
    expect(result.find((n) => n.id === "c")?.data.level).toBe(2);
  });

  it("have to leave nodes outside the affected subtree completely unchanged (same object reference)", () => {
    const untouched = node("z", 1);
    const nodes = [node("a", 1), node("b", 1), untouched];
    const edges = [edge("a", "b")];

    const result = propagateLevelChange("a", 1, nodes, edges);

    expect(result.find((n) => n.id === "z")).toBe(untouched);
  });

  it("have to return the same node reference when its level is already correct (no unnecessary re-render)", () => {
    const alreadyCorrect = node("a", 2);
    const result = propagateLevelChange("a", 2, [alreadyCorrect], []);
    expect(result.find((n) => n.id === "a")).toBe(alreadyCorrect);
  });

  it("have to terminate instead of looping forever when edges form a cycle", () => {
    const nodes = [node("a", 1), node("b", 1)];
    const edges = [edge("a", "b"), edge("b", "a")];

    const result = propagateLevelChange("a", 1, nodes, edges);

    expect(result.find((n) => n.id === "a")?.data.level).toBe(3);
    expect(result.find((n) => n.id === "b")?.data.level).toBe(2);
  });
});
