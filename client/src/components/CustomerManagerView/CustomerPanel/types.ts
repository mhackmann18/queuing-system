import { Customer } from 'utils/types';

export interface ActionEventHandlersProp {
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
  actionEventHandlers: ActionEventHandlersProp;
}

export type CustomerPanelState = 'default' | 'delete' | 'rtwl' | 'mark_no_show';
