interface SubmitBtnProps {
  text: string;
  styles?: string;
}

export default function SubmitBtn({ text, styles = '' }: SubmitBtnProps) {
  return (
    <button
      type="submit"
      className={`bg-onyx hover:bg-outer_space rounded-md px-3 py-2.5 font-medium 
      text-white ${styles}`}
    >
      {text}
    </button>
  );
}
