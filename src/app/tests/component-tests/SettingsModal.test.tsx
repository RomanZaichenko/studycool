import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsModal } from "../../components/SettingsModal";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

vi.mock("@/store/useSettingsStore");
vi.mock("@/store/useAuthStore");

describe("SettingsModal Component", () => {
  const mockCloseSettings = vi.fn();
  const mockSetTheme = vi.fn();
  const mockSetLanguage = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSettingsStore).mockReturnValue({
      isSettingsOpen: true,
      closeSettings: mockCloseSettings,
      theme: "light",
      setTheme: mockSetTheme,
      language: "en",
      setLanguage: mockSetLanguage,
      mapTheme: "default",
      setMapTheme: vi.fn(),
      useThickLines: false,
      setUseThickLines: vi.fn(),
    } as unknown as ReturnType<typeof useSettingsStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      user: { name: "test@example.com", initials: "TE" },
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  it("renders nothing when isSettingsOpen is false", () => {
    vi.mocked(useSettingsStore).mockReturnValue({
      isSettingsOpen: false,
      closeSettings: mockCloseSettings,
      theme: "light",
      setTheme: mockSetTheme,
      language: "en",
      setLanguage: mockSetLanguage,
      mapTheme: "default",
      setMapTheme: vi.fn(),
      useThickLines: false,
      setUseThickLines: vi.fn(),
    } as unknown as ReturnType<typeof useSettingsStore>);

    render(<SettingsModal />);
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("shows the General tab by default with the current theme highlighted", () => {
    render(<SettingsModal />);
    expect(screen.getByText("General Settings")).toBeInTheDocument();
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("switches to the Map Style tab", () => {
    render(<SettingsModal />);
    fireEvent.click(screen.getByText("Map Style"));
    expect(screen.getByText("Map Nodes Style")).toBeInTheDocument();
  });

  it("switches to the Account tab and shows the logged-in user", () => {
    render(<SettingsModal />);
    fireEvent.click(screen.getByText("Account"));
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("calls setTheme when a theme option is clicked", () => {
    render(<SettingsModal />);
    fireEvent.click(screen.getByText("dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("opens the language dropdown and selects a language", () => {
    render(<SettingsModal />);
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByText("Українська"));
    expect(mockSetLanguage).toHaveBeenCalledWith("ua");
  });

  it("calls logout and closeSettings when Log Out is clicked", () => {
    render(<SettingsModal />);
    fireEvent.click(screen.getByText("Account"));
    fireEvent.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockCloseSettings).toHaveBeenCalledTimes(1);
  });
});