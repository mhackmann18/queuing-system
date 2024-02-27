export interface DateTogglerProps {
  date: Date;
  setDate: (date: Date) => void;
  setError: (error: string) => void;
  containerStyles?: string;
}
