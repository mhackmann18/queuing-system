import useCustomers from 'hooks/useCustomers';

export default function CustomerWaitingListView() {
  const { customers } = useCustomers({
    statuses: { Waiting: true },
    date: new Date(),
    division: 'Motor Vehicle'
  });

  return (
    <div>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
}
