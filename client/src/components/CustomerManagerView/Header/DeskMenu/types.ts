export interface DeskMenuProps {
  setError: (error: string) => void;
  active: boolean;
  setActive: (active: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}
