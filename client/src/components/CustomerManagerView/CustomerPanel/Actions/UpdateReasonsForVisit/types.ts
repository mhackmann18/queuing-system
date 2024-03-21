export interface UpdateReasonsForVisitProps {
  currentReasonsForVisit: string[];
  onCancel: () => void;
  onConfirm: (newReasonsForVisit: string[]) => void;
}

export interface ReasonsForVisitFormValues {
  reasonForVisit: string[];
}
