import { Customer } from 'utils/types';

export interface CustomerPanelActionEventHandlers {
  updateReasonsForVisit: {
    onClick: () => void;
    onCancel: () => void;
    onConfirm: ({
      onSuccess,
      onFailure
    }: {
      onSuccess: () => void;
      onFailure: () => void;
    }) => void;
  };
  delete: {
    onClick: () => void;
    onCancel: () => void;
    onConfirm: ({
      onSuccess,
      onFailure
    }: {
      onSuccess: () => void;
      onFailure: () => void;
    }) => void;
  };
  returnToWaitingList: {
    onClick: () => void;
    onCancel: () => void;
    onConfirm: ({
      onSuccess,
      onFailure
    }: {
      onSuccess: () => void;
      onFailure: () => void;
    }) => void;
    confirmBtnDisabled: boolean;
  };
  callToStation: {
    onClick: () => void;
  };
  finishServing: {
    onClick: () => void;
  };
  markNoShow: {
    onClick: () => void;
    onCancel: () => void;
    onConfirm: ({
      onSuccess,
      onFailure
    }: {
      onSuccess: () => void;
      onFailure: () => void;
    }) => void;
  };
}

export interface CustomerPanelProps {
  customer: Customer;
  actionEventHandlers?: CustomerPanelActionEventHandlers;
  styles?: string;
}

export type CustomerPanelState =
  | 'default'
  | 'delete'
  | 'return_to_waiting_list'
  | 'mark_no_show'
  | 'update_reasons_for_visit';
