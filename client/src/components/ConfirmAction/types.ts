export interface ConfirmActionProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmBtnStyles?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  confirmBtnDisabled?: boolean;
}
