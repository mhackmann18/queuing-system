import { useContext, useMemo } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import Confirm from 'components/Confirm';
import { ActionViewProps } from './types';
import { UserContext } from 'components/UserContextProvider/context';
import { getDeptFromStation, getAvailableActions } from 'utils/helpers';
import { stationsByDept } from 'utils/types';
import { CustomerPanelContext } from '../context';

export default function ActionView({
  customer,
  actionConfig,
  currentDept
}: ActionViewProps) {
  const { state, setState } = useContext(CustomerPanelContext);
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
              setState('mark_no_show');
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
              setState('delete');
            };
            break;
          case 'Return to Waiting List':
            onClick = () => {
              actionConfig.returnToWaitingList.onClick();
              setState('rtwl');
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
      setState,
      customer
    ]
  );

  // Determine rendered component
  switch (state) {
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
            setState('default');
          }}
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setState('default'),
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
            setState('default');
          }}
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setState('default'),
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
            setState('default');
          }}
          confirmBtnText="Mark No Show"
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setState('default'),
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
        </div>
      );
    }
  }
}
