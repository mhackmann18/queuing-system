import { ReactElement } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import useDesk from 'hooks/useDesk';

export default function DeskRequiredRoute({ children }: { children: ReactElement }) {
  const { deskId } = useParams();
  const { desk } = useDesk();

  if (!desk) {
    return <Navigate to="/dashboard/customer-manager" />;
  }

  const getDeskInfoFromDeskIdParam = () => {
    const [divisionName, deskNum] = deskId!.split('-desk-');
    const parsedDivisionName = divisionName
      .split('-')
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' ');
    return { divisionName: parsedDivisionName, deskNum: parseInt(deskNum) };
  };

  const { divisionName, deskNum } = getDeskInfoFromDeskIdParam();

  console.log(deskNum, divisionName);
  console.log(desk);

  return desk.deskNumber === deskNum && desk.divisionName === divisionName ? (
    children
  ) : (
    <Navigate to="/dashboard/customer-manager" />
  );
}
