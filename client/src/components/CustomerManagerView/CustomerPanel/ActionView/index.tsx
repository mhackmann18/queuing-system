import { useMemo } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import Confirm from 'components/ConfirmAction';
import { CustomerPanelActionViewProps } from './types';
import { getAvailableActions } from 'utils/helpers';
import { DESK_REGEX } from 'utils/constants';

export default function CustomerPanelActionView({
  customer,
  actionEventHandlers,
  panelState,
  setPanelState
}: CustomerPanelActionViewProps) {
  const actionBtnConfig = useMemo(
    () =>
      getAvailableActions(customer).map((action) => {
        let onClick = () => undefined;

        switch (action) {
          case 'Finish Serving':
            onClick = () => {
              actionEventHandlers.finishServing.onClick();
            };
            break;
          case 'Mark No Show':
            onClick = () => {
              actionEventHandlers.markNoShow.onClick();
              setPanelState('mark_no_show');
            };
            break;
          case 'Call to Station':
            onClick = () => {
              actionEventHandlers.callToStation.onClick();
            };
            break;
          case 'Delete':
            onClick = () => {
              actionEventHandlers.delete.onClick();
              setPanelState('delete');
            };
            break;
          case 'Return to Waiting List':
            onClick = () => {
              actionEventHandlers.returnToWaitingList.onClick();
              setPanelState('rtwl');
            };
            break;
        }

        return { name: action, onClick };
      }),
    [
      actionEventHandlers.callToStation,
      actionEventHandlers.delete,
      actionEventHandlers.finishServing,
      actionEventHandlers.markNoShow,
      actionEventHandlers.returnToWaitingList,
      setPanelState,
      customer
    ]
  );

  // Determine rendered component
  switch (panelState) {
    case 'delete': {
      const { onCancel, onConfirm } = actionEventHandlers.delete;

      return (
        <Confirm
          title="Confirm Deletion"
          message={
            'Are you sure you want to delete this customer? This action cannot be undone.'
          }
          onCancel={() => {
            onCancel();
            setPanelState('default');
          }}
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setPanelState('default'),
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
        actionEventHandlers.returnToWaitingList;

      return (
        <Confirm
          title="Return Customer to Waiting List"
          message={'Select where this customer should appear in the waiting list.'}
          onCancel={() => {
            onCancel();
            setPanelState('default');
          }}
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setPanelState('default'),
              onFailure: () => null
            })
          }
          confirmBtnDisabled={confirmBtnDisabled}
        />
      );
    }
    case 'mark_no_show': {
      const { onConfirm, onCancel } = actionEventHandlers.markNoShow;

      return (
        <Confirm
          title={'Mark Customer as a No Show?'}
          message={
            'Marking this customer as a no show will remove them from the waiting list and require them to re-check in.'
          }
          onCancel={() => {
            onCancel();
            setPanelState('default');
          }}
          confirmBtnText="Mark No Show"
          onConfirm={() =>
            onConfirm({
              onSuccess: () => setPanelState('default'),
              onFailure: () => null
            })
          }
        />
      );
    }
    case 'default': {
      let actionsUnavailableMsg: string | undefined;

      // if (currentDivision !== user.division) {
      //   actionsUnavailableMsg = `Unavailable to ${user.division} stations.`;
      // } else
      if (DESK_REGEX.test(customer.status)) {
        actionsUnavailableMsg = 'Unavailable while customer is at another desk.';
      } else if (customer.atOtherDivision) {
        actionsUnavailableMsg = `Unavailable while customer is at a ${customer.atOtherDivision} desk.`;
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
