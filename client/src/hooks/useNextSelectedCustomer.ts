import { useRef, useEffect } from 'react';
import { Customer } from 'utils/types';

/**
 * This hook is meant to be used in the CustomerManager root component only. Returns Id of the customer immediately
 * after selectedCustomer in customers
 *
 * @param {Customer} selectedCustomer
 * @param {Customer[]} customers
 */
export default function useNextCustomerId(
  selectedCustomer: Customer | null,
  customers: Customer[]
): number {
  const candidateIdRef = useRef<number>(0);

  useEffect(() => {
    // If there's zero customers or one customer there can be no next customer
    if (!customers || customers.length <= 1) {
      candidateIdRef.current = 0;
      return;
    }

    if (selectedCustomer) {
      const indexOfSelectedCustomer = customers.indexOf(selectedCustomer);

      /* If selected customer exists, but isn't in the customers array, then that customer must have been removed in 
      the last render. In that case, the candidateId must retain its value so that in the next render, when 
      selectedCustomer's value is updated with a new selectedCustomer, the candidateId can be used to make the 
      selection. */
      if (indexOfSelectedCustomer === -1) {
        return;
      }

      /* The selectedCustomer is the last in the customers array, so there's no next customer. Instead, make candidate 
      the customer before selectedCustomer. */
      if (indexOfSelectedCustomer === customers.length - 1) {
        candidateIdRef.current = customers[indexOfSelectedCustomer - 1].id;
      }
      // Candidate is the customer after selectedCustomer
      else {
        candidateIdRef.current = customers[indexOfSelectedCustomer + 1].id;
      }
    }
  }, [customers, selectedCustomer]);

  return candidateIdRef.current;
}
