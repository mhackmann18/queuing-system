import { useState, ReactElement, useEffect, useCallback } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import CustomerPanelInfo from '../Info';
import Confirm from 'components/Confirm';
import { Customer } from 'utils/types';
import { ActionViewProps } from './types';

export default function ActionView({ customer, actionConfig }: ActionViewProps) {
  const [view, setView] = useState<ReactElement | null>(null);

  const getAvailableActions = useCallback(
    (customer: Customer): Record<string, () => void>[] => {
      let actions: Record<string, () => void>[] = [];
      const { status, callTimes } = customer;

      const handleDeleteBtnClick = () => {
        const { onClick, onCancel, onConfirm } = actionConfig.delete;

        onClick();

        setView(
          <Confirm
            title="Delete this Customer?"
            message={
              'Are you sure you want to delete this customer? This action cannot be undone'
            }
            onCancel={() => {
              onCancel();
              displayDefaultView();
            }}
            onConfirm={() =>
              onConfirm({ onSuccess: displayDefaultView, onFailure: () => null })
            }
          />
        );
      };

      const handleReturnToWaitingListBtnClick = () => {
        const { onClick, onCancel, onConfirm, confirmBtnDisabled } =
          actionConfig.returnToWaitingList;

        onClick();

        setView(
          <Confirm
            title="Return Customer to Waiting List"
            message={'Select where this customer should appear in the waiting list.'}
            onCancel={() => {
              onCancel();
              displayDefaultView();
            }}
            onConfirm={() =>
              onConfirm({ onSuccess: displayDefaultView, onFailure: () => null })
            }
            confirmBtnDisabled={confirmBtnDisabled}
          />
        );
      };

      const handleCallToStationBtnClick = () => {
        actionConfig.callToStation.onClick();
      };

      const handleFinishServingBtnClick = async () => {
        actionConfig.finishServing.onClick();
      };

      const handleMarkNoShowBtnClick = async () => {
        const { onClick, onConfirm, onCancel } = actionConfig.markNoShow;

        onClick();

        setView(
          <Confirm
            title={'Mark Customer as a No Show?'}
            message={
              'Marking this customer as a no show will remove them from the waiting list and require them to re-check in.'
            }
            onCancel={() => {
              onCancel();
              displayDefaultView();
            }}
            confirmBtnText="Mark No Show"
            onConfirm={() =>
              onConfirm({ onSuccess: displayDefaultView, onFailure: () => null })
            }
          />
        );
      };

      switch (status) {
        case 'Waiting':
          actions.push({
            'Call to Station': handleCallToStationBtnClick
          });
          if (callTimes.length) {
            actions.push({ 'Mark No Show': handleMarkNoShowBtnClick });
          }
          actions.push({ Delete: handleDeleteBtnClick });
          break;
        case 'Serving':
          actions = [
            {
              'Finish Serving': handleFinishServingBtnClick
            },
            {
              'Mark No Show': handleMarkNoShowBtnClick
            },
            {
              'Return to Waiting List': handleReturnToWaitingListBtnClick
            },
            {
              Delete: handleDeleteBtnClick
            }
          ];
          break;
        case 'Served':
          actions = [
            {
              Delete: handleDeleteBtnClick
            }
          ];
          break;
        case 'No Show':
          actions = [
            {
              'Return to Waiting List': handleReturnToWaitingListBtnClick
            },
            {
              Delete: handleDeleteBtnClick
            }
          ];
          break;
        default:
          actions = [];
      }

      return actions;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actionConfig]
  );

  const displayDefaultView = useCallback(() => {
    const renderActionBtns = () =>
      getAvailableActions(customer).map((action) => {
        const [actionName, actionFn] = Object.entries(action)[0];
        return (
          <CustomerPanelActionButton
            key={actionName}
            text={actionName}
            onClick={() => actionFn()}
          />
        );
      });

    setView(
      <div>
        <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
        <div className="mb-4">{renderActionBtns()}</div>
        <CustomerPanelInfo customer={customer} />
      </div>
    );
  }, [customer, getAvailableActions]);

  useEffect(() => {
    displayDefaultView();
  }, [displayDefaultView]);

  return view;
}
