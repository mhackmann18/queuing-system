interface TextInputLabelProps {
  htmlFor: string;
  styles?: string;
}

export default function TextInputLabel({
  htmlFor,
  styles = ''
}: TextInputLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`font-semibold ${styles}`}>
      {`${htmlFor.charAt(0).toUpperCase()}${htmlFor.slice(1)}`}
    </label>
  );
}
