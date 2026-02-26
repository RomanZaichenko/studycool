import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Projects from "../../components/Projects";
import React from "react";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || "mocked-image"} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Projects Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should render the section wrapper and the add button", () => {
    render(<Projects />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    const addButton = screen.getAllByRole("button")[0];
    expect(addButton).toBeInTheDocument();
  });

  it("should open the ProjectCreator modal when the add button is clicked", async () => {
    render(<Projects />);

    const addButton = screen.getAllByRole("button")[0];
    fireEvent.click(addButton);

    expect(await screen.findByText("Create project")).toBeInTheDocument();
  });

  it("should add a new project and display its card on the screen", async () => {
    render(<Projects />);

    const addButton = screen.getAllByRole("button")[0];
    fireEvent.click(addButton);
    await screen.findByText("Create project");

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "Example" } });

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(await screen.findByText("Example")).toBeInTheDocument();
    expect(screen.queryByText("Create project")).not.toBeInTheDocument();
  });
});
