import { useState, useEffect, useContext, useMemo } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import Confirm from 'components/Confirm';
import { ActionViewProps, ActionViewMode } from './types';
import CustomerPanelInfo from '../Info';
import { UserContext } from 'components/UserContextProvider/context';
import { getDeptFromStation, getAvailableActions } from 'utils/helpers';
import { stationsByDept } from 'utils/types';

export default function ActionView({
  customer,
  actionConfig,
  currentDept
}: ActionViewProps) {
  const [mode, setMode] = useState<ActionViewMode>('default');
  const user = useContext(UserContext);

  const actionBtnConfig = useMemo(
    () =>
      getAvailableActions(customer).map((action) => {
        let onClick = () => undefined;

        switch (action) {
          case 'Finish Serving':
            onClick = () => {
              actionConfig.finishServing.onClick();
            };
            break;
          case 'Mark No Show':
            onClick = () => {
              actionConfig.markNoShow.onClick();
              setMode('mark_no_show');
            };
            break;
          case 'Call to Station':
            onClick = () => {
              actionConfig.callToStation.onClick();
            };
            break;
          case 'Delete':
            onClick = () => {
              actionConfig.delete.onClick();
              setMode('delete');
            };
            break;
          case 'Return to Waiting List':
            onClick = () => {
              actionConfig.returnToWaitingList.onClick();
              setMode('rtwl');
            };
            break;
        }

        return { name: action, onClick };
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

  // Determine rendered component
  switch (mode) {
    case 'delete': {
      const { onCancel, onConfirm } = actionConfig.delete;

      return (
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
    }
    case 'rtwl': {
      const { onCancel, onConfirm, confirmBtnDisabled } =
        actionConfig.returnToWaitingList;

      return (
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
    }
    case 'mark_no_show': {
      const { onConfirm, onCancel } = actionConfig.markNoShow;

      return (
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
    }
    case 'default': {
      let actionsUnavailableMsg: string | undefined;

      if (!user.station) {
        actionsUnavailableMsg = 'Sign in to a station to use actions.';
      } // If customer is at another station within the user's dept, no actions are available
      else if (
        stationsByDept[getDeptFromStation(user!.station)].includes(customer.status)
      ) {
        actionsUnavailableMsg = 'Unavailable while customer is at another station.';
      } else if (currentDept !== getDeptFromStation(user!.station)) {
        actionsUnavailableMsg = `Unavailable to ${getDeptFromStation(
          user!.station
        )} stations.`;
      } else if (customer.atOtherDept) {
        actionsUnavailableMsg = `Unavailable while customer is at a ${customer.atOtherDept} desk.`;
      }

      return (
        <div>
          <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
          {actionsUnavailableMsg ? (
            <p className="text-french_gray_1-500 mb-4">{actionsUnavailableMsg}</p>
          ) : (
            <div className="mb-4">
              {actionBtnConfig.map(({ name, onClick }) => (
                <CustomerPanelActionButton
                  key={name}
                  name={name}
                  onClick={onClick}
                />
              ))}
            </div>
          )}
          <CustomerPanelInfo customer={customer} />
        </div>
      );
    }
  }
}
