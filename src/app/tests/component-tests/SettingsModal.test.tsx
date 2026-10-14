import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsModal } from "../../components/SettingsModal";
import { useSettingsStore } from "@/store/useSettingsStore";

const { mockLogoutAction, mockClearData } = vi.hoisted(() => ({
  mockLogoutAction: vi.fn(),
  mockClearData: vi.fn(),
}));

vi.mock("@/store/useSettingsStore");

vi.mock("@/app/actions/auth.actions", () => ({
  logoutAction: mockLogoutAction,
}));

vi.mock("@/store/useMainStore", () => ({
  useMainStore: (selector: (s: { clearData: () => void }) => unknown) =>
    selector({ clearData: mockClearData }),
}));

describe("SettingsModal Component", () => {
  const mockCloseSettings = vi.fn();
  const mockSetTheme = vi.fn();
  const mockSetLanguage = vi.fn();

  const testUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  };

  const settingsState = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsStore).mockReturnValue(
      settingsState as unknown as ReturnType<typeof useSettingsStore>
    );
  });

  it("renders nothing when isSettingsOpen is false", () => {
    vi.mocked(useSettingsStore).mockReturnValue({
      ...settingsState,
      isSettingsOpen: false,
    } as unknown as ReturnType<typeof useSettingsStore>);

    render(<SettingsModal user={testUser} />);
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("shows the General tab by default with the current theme highlighted", () => {
    render(<SettingsModal user={testUser} />);
    expect(screen.getByText("General Settings")).toBeInTheDocument();
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("switches to the Map Style tab", () => {
    render(<SettingsModal user={testUser} />);
    fireEvent.click(screen.getByText("Map Style"));
    expect(screen.getByText("Map Nodes Style")).toBeInTheDocument();
  });

  it("shows the logged-in user with initials on the Account tab", () => {
    render(<SettingsModal user={testUser} />);
    fireEvent.click(screen.getByText("Account"));
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("shows 'Not logged in.' when there is no user", () => {
    render(<SettingsModal user={null} />);
    fireEvent.click(screen.getByText("Account"));
    expect(screen.getByText("Not logged in.")).toBeInTheDocument();
  });

  it("calls setTheme when a theme option is clicked", () => {
    render(<SettingsModal user={testUser} />);
    fireEvent.click(screen.getByText("dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("opens the language dropdown and selects a language", () => {
    render(<SettingsModal user={testUser} />);
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByText("Українська"));
    expect(mockSetLanguage).toHaveBeenCalledWith("ua");
  });

  it("does NOT log out just by rendering", () => {
    render(<SettingsModal user={testUser} />);
    expect(mockLogoutAction).not.toHaveBeenCalled();
  });

  it("clears data, closes settings and logs out when Log Out is clicked", () => {
    render(<SettingsModal user={testUser} />);
    fireEvent.click(screen.getByText("Account"));
    fireEvent.click(screen.getByText("Log Out"));

    expect(mockClearData).toHaveBeenCalledTimes(1);
    expect(mockCloseSettings).toHaveBeenCalledTimes(1);
    expect(mockLogoutAction).toHaveBeenCalledTimes(1);
  });
});
