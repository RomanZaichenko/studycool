import { describe, it, expect } from "vitest";
import { type Node as FlowNode, type Edge } from "@xyflow/react";
import {
  rgbToHex,
  resolveColorToRGB,
  parseGraph,
  formatAsStudyCool,
  formatAsTxt,
  formatAsMarkdown,
  type GraphData,
} from "../../exportService";

describe("rgbToHex", () => {
  it("have to convert an rgb() string to an uppercase hex triplet", () => {
    expect(rgbToHex("rgb(255, 0, 0)")).toBe("FF0000");
  });

  it("have to convert an rgba() string, ignoring alpha", () => {
    expect(rgbToHex("rgba(0, 128, 255, 0.5)")).toBe("0080FF");
  });

  it("have to pad single-digit hex components with a leading zero", () => {
    expect(rgbToHex("rgb(1, 2, 3)")).toBe("010203");
  });

  it("have to strip the leading # from an already-hex string", () => {
    expect(rgbToHex("#AABBCC")).toBe("AABBCC");
  });

  it("have to return undefined for a string it can't parse", () => {
    expect(rgbToHex("not-a-color")).toBeUndefined();
  });
});

describe("resolveColorToRGB", () => {
  it("have to return 'transparent' for an empty string", () => {
    expect(resolveColorToRGB("")).toBe("transparent");
  });

  it("have to return 'transparent' for 'none'", () => {
    expect(resolveColorToRGB("none")).toBe("transparent");
  });

  it("have to return 'transparent' for 'transparent'", () => {
    expect(resolveColorToRGB("transparent")).toBe("transparent");
  });

  it("have to pass through a plain rgb() string unchanged", () => {
    expect(resolveColorToRGB("rgb(10, 20, 30)")).toBe("rgb(10, 20, 30)");
  });

  it("have to pass through a hex string unchanged", () => {
    expect(resolveColorToRGB("#112233")).toBe("#112233");
  });

  // NOTE: the oklch/oklab/lab/lch/color(...) branch renders on a <canvas>
  // to let the browser do the conversion. jsdom has no real canvas backend
  // here (no `canvas` package installed), so that branch isn't covered by
  // this unit test - it needs a browser/e2e check instead.
});

describe("parseGraph", () => {
  const node = (id: string, label: string, noteContent = ""): FlowNode =>
    ({
      id,
      position: { x: 0, y: 0 },
      data: { label, noteContent },
    }) as unknown as FlowNode;

  const edge = (source: string, target: string): Edge =>
    ({ id: `${source}-${target}`, source, target }) as unknown as Edge;

  it("have to walk a simple chain root -> child in depth order", () => {
    const nodes = [node("a", "Root"), node("b", "Child")];
    const edges = [edge("a", "b")];

    const result = parseGraph(nodes, edges);

    expect(result.hierarchical).toHaveLength(2);
    expect(result.hierarchical[0]).toMatchObject({ title: "Root", depth: 1 });
    expect(result.hierarchical[1]).toMatchObject({ title: "Child", depth: 2 });
    expect(result.orphans).toHaveLength(0);
  });

  it("have to treat a node with no incoming edge and no children as a root, not an orphan", () => {
    const nodes = [node("a", "Alone")];
    const result = parseGraph(nodes, []);

    expect(result.hierarchical).toHaveLength(1);
    expect(result.orphans).toHaveLength(0);
  });

  it("have to put unreachable nodes (e.g. a disconnected cycle) into orphans", () => {
    // b <-> c form a cycle with no root pointing into it, so dfs from
    // roots never visits them.
    const nodes = [node("a", "Root"), node("b", "B"), node("c", "C")];
    const edges = [edge("b", "c"), edge("c", "b")];

    const result = parseGraph(nodes, edges);

    expect(result.hierarchical).toHaveLength(1);
    expect(result.hierarchical[0].title).toBe("Root");
    expect(result.orphans.map((o) => o.title).sort()).toEqual(["B", "C"]);
  });

  it("have to fall back to 'Нотатка' when a node has no label", () => {
    const nodes = [node("a", "")];
    const result = parseGraph(nodes, []);
    expect(result.hierarchical[0].title).toBe("Нотатка");
  });

  it("have to strip HTML tags from noteContent for the plain-text 'content' field but keep 'rawContent' as-is", () => {
    const nodes = [node("a", "Title", "<p>Hello <b>world</b></p>")];
    const result = parseGraph(nodes, []);

    expect(result.hierarchical[0].content).toBe("Hello world");
    expect(result.hierarchical[0].rawContent).toBe("<p>Hello <b>world</b></p>");
  });

  it("have to branch fan-out (one parent, two children) into two depth-2 entries", () => {
    const nodes = [node("a", "Root"), node("b", "Left"), node("c", "Right")];
    const edges = [edge("a", "b"), edge("a", "c")];

    const result = parseGraph(nodes, edges);

    expect(result.hierarchical).toHaveLength(3);
    const depths = result.hierarchical.map((n) => n.depth);
    expect(depths).toEqual([1, 2, 2]);
  });
});

describe("formatAsStudyCool", () => {
  it("have to produce a JSON blob containing the map title, nodes and edges", async () => {
    const nodes = [{ id: "a" } as unknown as FlowNode];
    const edges = [{ id: "a-b", source: "a", target: "b" } as unknown as Edge];

    const blob = formatAsStudyCool("My Map", nodes, edges);
    expect(blob.type).toBe("application/json");

    const parsed = JSON.parse(await blob.text());
    expect(parsed.mapTitle).toBe("My Map");
    expect(parsed.version).toBe("1.0");
    expect(parsed.nodes).toEqual(nodes);
    expect(parsed.edges).toEqual(edges);
  });
});

describe("formatAsTxt", () => {
  const graph = (overrides: Partial<GraphData> = {}): GraphData => ({
    hierarchical: [],
    orphans: [],
    ...overrides,
  });

  it("have to output only the raw content when isSingleNote is true", async () => {
    const data = graph({
      hierarchical: [
        {
          title: "Note",
          content: "Just the content",
          rawContent: "",
          depth: 1,
        },
      ],
    });

    const blob = formatAsTxt("My Note", data, true);
    const text = await blob.text();

    expect(text).toContain("Just the content");
    expect(text).not.toContain("■");
  });

  it("have to render a bullet list with indentation by depth when isSingleNote is false", async () => {
    const data = graph({
      hierarchical: [
        { title: "Root", content: "root content", rawContent: "", depth: 1 },
        { title: "Child", content: "child content", rawContent: "", depth: 2 },
      ],
    });

    const text = await formatAsTxt("Map", data, false).text();

    expect(text).toContain("■ Root");
    expect(text).toContain("  • Child");
  });

  it("have to append an orphans section only when orphans exist", async () => {
    const withOrphans = graph({
      hierarchical: [{ title: "Root", content: "", rawContent: "", depth: 1 }],
      orphans: [{ title: "Lost", content: "", rawContent: "", depth: 1 }],
    });
    const withoutOrphans = graph({
      hierarchical: [{ title: "Root", content: "", rawContent: "", depth: 1 }],
    });

    const textWith = await formatAsTxt("Map", withOrphans, false).text();
    const textWithout = await formatAsTxt("Map", withoutOrphans, false).text();

    expect(textWith).toContain("Самотні нотатки");
    expect(textWith).toContain("Lost");
    expect(textWithout).not.toContain("Самотні нотатки");
  });
});

describe("formatAsMarkdown", () => {
  const graph = (overrides: Partial<GraphData> = {}): GraphData => ({
    hierarchical: [],
    orphans: [],
    ...overrides,
  });

  it("have to convert HTML rawContent to Markdown for a single note", async () => {
    const data = graph({
      hierarchical: [
        {
          title: "Note",
          content: "",
          rawContent: "<p><b>Bold</b> text</p>",
          depth: 1,
        },
      ],
    });

    const md = await formatAsMarkdown("My Note", data, true).text();
    expect(md).toContain("**Bold** text");
  });

  it("have to use #, ## and ### headings based on depth for the full map", async () => {
    const data = graph({
      hierarchical: [
        { title: "Root", content: "", rawContent: "root", depth: 1 },
        { title: "Child", content: "", rawContent: "child", depth: 2 },
        {
          title: "Grandchild",
          content: "",
          rawContent: "grandchild",
          depth: 3,
        },
      ],
    });

    const md = await formatAsMarkdown("Map", data, false).text();

    expect(md).toContain("# Root");
    expect(md).toContain("## Child");
    expect(md).toContain("### Grandchild");
  });

  it("have to append orphans under a '## Самотні нотатки' section", async () => {
    const data = graph({
      hierarchical: [
        { title: "Root", content: "", rawContent: "root", depth: 1 },
      ],
      orphans: [{ title: "Lost", content: "", rawContent: "lost", depth: 1 }],
    });

    const md = await formatAsMarkdown("Map", data, false).text();
    expect(md).toContain("## Самотні нотатки");
    expect(md).toContain("### Lost");
  });
});
