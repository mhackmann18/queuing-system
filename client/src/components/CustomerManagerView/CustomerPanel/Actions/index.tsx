import { useMemo } from 'react';
import CustomerPanelActionButton from '../ActionButton';
import ConfirmAction from 'components/ConfirmAction';
import { CustomerPanelActionsProps } from './types';
import { getAvailableActions } from 'utils/helpers';
import { DESK_REGEX } from 'utils/constants';
import UpdateReasonsForVisit from './UpdateReasonsForVisit';

export default function CustomerPanelActions({
  customer,
  actionEventHandlers,
  panelState,
  setPanelState
}: CustomerPanelActionsProps) {
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
              setPanelState('return_to_waiting_list');
            };
            break;
          case 'Update Reasons for Visit':
            onClick = () => {
              actionEventHandlers.updateReasonsForVisit.onClick();
              setPanelState('update_reasons_for_visit');
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
      actionEventHandlers.updateReasonsForVisit,
      setPanelState,
      customer
    ]
  );

  // Determine rendered component
  switch (panelState) {
    case 'delete': {
      const { onCancel, onConfirm } = actionEventHandlers.delete;

      return (
        <ConfirmAction
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
    case 'return_to_waiting_list': {
      const { onCancel, onConfirm, confirmBtnDisabled } =
        actionEventHandlers.returnToWaitingList;

      return (
        <ConfirmAction
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
        <ConfirmAction
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
    case 'update_reasons_for_visit': {
      const { onConfirm } = actionEventHandlers.updateReasonsForVisit;
      return (
        <UpdateReasonsForVisit
          currentReasonsForVisit={customer.reasonsForVisit}
          onCancel={() => setPanelState('default')}
          onConfirm={(newReasonsForVisit) =>
            onConfirm({
              onSuccess: () => setPanelState('default'),
              onFailure: () => null,
              newReasonsForVisit
            })
          }
        />
      );
    }
    case 'default': {
      let actionsUnavailableMsg: string | undefined;

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
