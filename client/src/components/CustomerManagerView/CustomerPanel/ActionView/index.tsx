import { useState, ReactElement, useEffect, useContext, useMemo } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import Confirm from 'components/Confirm';
import { ActionViewProps } from './types';
import CustomerPanelInfo from '../Info';
import { UserContext } from 'components/UserContextProvider/context';
import { getDeptFromStation, getAvailableActions } from 'utils/helpers';
import { stationsByDept } from 'utils/types';

type ActionViewMode = 'default' | 'delete' | 'rtwl' | 'mark_no_show';

export default function ActionView({
  customer,
  actionConfig,
  currentDept
}: ActionViewProps) {
  const [mode, setMode] = useState<ActionViewMode>('default');
  const [component, setComponent] = useState<ReactElement | null>(null);
  const user = useContext(UserContext);

  const actions = useMemo(
    () =>
      getAvailableActions(customer).map((action) => {
        let actionFn = () => undefined;

        switch (action) {
          case 'Finish Serving':
            actionFn = () => {
              actionConfig.finishServing.onClick();
            };
            break;
          case 'Mark No Show':
            actionFn = () => {
              actionConfig.markNoShow.onClick();
              setMode('mark_no_show');
            };
            break;
          case 'Call to Station':
            actionFn = () => {
              actionConfig.callToStation.onClick();
            };
            break;
          case 'Delete':
            actionFn = () => {
              actionConfig.delete.onClick();
              setMode('delete');
            };
            break;
          case 'Return to Waiting List':
            actionFn = () => {
              actionConfig.returnToWaitingList.onClick();
              setMode('rtwl');
            };
            break;
        }

        return { actionName: action, actionFn };
      }),
    [
      actionConfig.callToStation,
      actionConfig.delete,
      actionConfig.finishServing,
      actionConfig.markNoShow,
      actionConfig.returnToWaitingList,
      customer
    ]
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
            confirmBtnStyles="text-white bg-red-500 hover:bg-red-600"
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
          actions.map(({ actionName, actionFn }) => {
            return (
              <CustomerPanelActionButton
                key={actionName}
                text={actionName}
                onClick={actionFn}
              />
            );
          });

        let actionComponent: ReactElement = (
          <p className="text-french_gray_1-500 mb-4">Unavailable</p>
        );

        if (!user.station) {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Sign in to a station to use actions.
            </p>
          );
        } // If customer is at another station within the user's dept, no actions are available
        else if (
          stationsByDept[getDeptFromStation(user!.station)].includes(customer.status)
        ) {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Unavailable while customer is at another station.
            </p>
          );
        } else if (currentDept !== getDeptFromStation(user!.station)) {
          actionComponent = (
            <p className="text-french_gray_1-500 mb-4">
              Unavailable to {getDeptFromStation(user!.station)} stations.
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
    actions,
    customer,
    currentDept,
    user
  ]);

  return component;
}
