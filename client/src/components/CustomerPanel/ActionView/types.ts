import { Customer } from 'utils/types';

export interface ActionViewConfigProp {
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

export interface ActionViewProps {
  customer: Customer;
  actionConfig: ActionViewConfigProp;
}
