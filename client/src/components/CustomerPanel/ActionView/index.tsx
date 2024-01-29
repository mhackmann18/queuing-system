import { useState, ReactElement, useEffect, useCallback, useContext } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import Confirm from 'components/Confirm';
import { Customer } from 'utils/types';
import { ActionViewProps } from './types';
import CustomerPanelInfo from '../Info';
import UserContext from 'components/UserContext';
import { getDeptFromStation, sameDay } from 'utils/helpers';

type ActionViewMode = 'default' | 'delete' | 'rtwl' | 'mark_no_show';

export default function ActionView({
  customer,
  actionConfig,
  currentDept
}: ActionViewProps) {
  const [mode, setMode] = useState<ActionViewMode>('default');
  const [component, setComponent] = useState<ReactElement | null>(null);
  const user = useContext(UserContext);

  const getAvailableActions = useCallback(
    (customer: Customer): Record<string, () => void>[] => {
      let actions: Record<string, () => void>[] = [];

      const handleDeleteBtnClick = () => {
        actionConfig.delete.onClick();
        setMode('delete');
      };

      const handleRtwlBtnClick = () => {
        actionConfig.returnToWaitingList.onClick();
        setMode('rtwl');
      };

      const handleCallToStationBtnClick = () => {
        actionConfig.callToStation.onClick();
      };

      const handleFinishServingBtnClick = () => {
        actionConfig.finishServing.onClick();
      };

      const handleMarkNoShowBtnClick = () => {
        actionConfig.markNoShow.onClick();
        setMode('mark_no_show');
      };

      switch (customer.status) {
        case 'Waiting':
          actions.push({
            'Call to Station': handleCallToStationBtnClick
          });
          if (customer.callTimes.length) {
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
              'Return to Waiting List': handleRtwlBtnClick
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
              'Return to Waiting List': handleRtwlBtnClick
            },
            {
              Delete: handleDeleteBtnClick
            }
          ];
          break;
      }

      // The only available action for customers from previous days is to delete them
      if (!sameDay(customer.checkInTime, new Date())) {
        actions = [{ Delete: handleDeleteBtnClick }];
      }

      return actions;
    },
    [actionConfig]
  );

  // Reset view when customer changes
  useEffect(() => {
    setMode('default');
  }, [customer.id]);

  // Determine component
  useEffect(() => {
    switch (mode) {
      case 'delete': {
        const { onCancel, onConfirm } = actionConfig.delete;

        setComponent(
          <Confirm
            title="Confirm Deletion"
            message={
              'Are you sure you want to delete this customer? This action cannot be undone.'
            }
            onCancel={() => {
              onCancel();
              setMode('default');
            }}
            onConfirm={() =>
              onConfirm({
                onSuccess: () => setMode('default'),
                onFailure: () => null
              })
            }
            confirmBtnText="Delete"
            confirmBtnStyles="text-white bg-red-500"
          />
        );
        break;
      }
      case 'rtwl': {
        const { onCancel, onConfirm, confirmBtnDisabled } =
          actionConfig.returnToWaitingList;

        setComponent(
          <Confirm
            title="Return Customer to Waiting List"
            message={'Select where this customer should appear in the waiting list.'}
            onCancel={() => {
              onCancel();
              setMode('default');
            }}
            onConfirm={() =>
              onConfirm({
                onSuccess: () => setMode('default'),
                onFailure: () => null
              })
            }
            confirmBtnDisabled={confirmBtnDisabled}
          />
        );
        break;
      }
      case 'mark_no_show': {
        const { onConfirm, onCancel } = actionConfig.markNoShow;

        setComponent(
          <Confirm
            title={'Mark Customer as a No Show?'}
            message={
              'Marking this customer as a no show will remove them from the waiting list and require them to re-check in.'
            }
            onCancel={() => {
              onCancel();
              setMode('default');
            }}
            confirmBtnText="Mark No Show"
            onConfirm={() =>
              onConfirm({
                onSuccess: () => setMode('default'),
                onFailure: () => null
              })
            }
          />
        );
        break;
      }
      case 'default': {
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

        let actionComponent: ReactElement = (
          <p className="text-french_gray_1-500 mb-4">Unavailable</p>
        );

        if (user!.station === 'none') {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Sign in to a station to use actions.
            </p>
          );
        } else if (currentDept !== getDeptFromStation(user!.station)) {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Unavailable to {getDeptFromStation(user!.station)} desks.
            </p>
          );
        } else if (customer.atOtherDept) {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Unavailable while customer is at a {customer.atOtherDept} desk.
            </p>
          );
        } else {
          actionComponent = <div className="mb-4">{renderActionBtns()}</div>;
        }

        setComponent(
          <div>
            <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
            {actionComponent}
            <CustomerPanelInfo customer={customer} />
          </div>
        );
      }
    }
  }, [
    mode,
    actionConfig.markNoShow,
    actionConfig.delete,
    actionConfig.returnToWaitingList,
    getAvailableActions,
    customer,
    currentDept,
    user
  ]);

  return component;
}
