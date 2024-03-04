import { ReactElement, useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';

export default function DeskRequiredRoute({ children }: { children: ReactElement }) {
  const { deskId } = useParams();
  const { desk } = useContext(DeskContext);

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

  return desk.number === deskNum && desk.divisionName === divisionName ? (
    children
  ) : (
    <Navigate to="/dashboard/customer-manager" />
  );
}
