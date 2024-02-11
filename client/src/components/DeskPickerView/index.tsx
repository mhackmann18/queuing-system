import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserController from 'utils/UserController';
import DeskSelectorButton from './DeskSelectorButton';

const DUMMY_OFFICE = {
  name: 'Main Office',
  address: '123 Main St',
  id: 'd665b49d-3c3e-4a33-840f-c65ce3d1df3c'
};

export default function DeskPickerView() {
  const [deskAvailabilityByDivision, setDeskAvailabilityByDivision] = useState<
    { divisionName: string; numDesks: number; availableDeskNums: number[] }[]
  >([]);

  // Fetch desk availability on component mount
  useEffect(() => {
    const getDeskAvailabilty = async () => {
      const { data: resData, error } = await UserController.getDesksByOffice(
        DUMMY_OFFICE.id
      );
      if (error) {
        console.error(error);
      } else if (resData) {
        setDeskAvailabilityByDivision(resData);
      }
    };
    getDeskAvailabilty();
  }, []);

  // Convert division name and desk number to a link
  const getDeskNameLink = (divisionName: string, deskNum: number) =>
    `${divisionName.toLowerCase().split(' ').join('-')}-desk-${deskNum}`;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-96">
        <h1 className="mb-6 text-2xl font-semibold">Select a desk</h1>

        {deskAvailabilityByDivision.map(
          ({ divisionName, numDesks, availableDeskNums }) => (
            <div
              key={divisionName}
              className="border-french_gray_1-600 mb-4 rounded-md border p-4 shadow-md"
            >
              <h2 className="text-slate_gray-400 mb-4 text-lg font-medium">
                {divisionName}
              </h2>

              {Array.from({ length: numDesks }).map((_, index) => {
                const deskNum = index + 1;

                return (
                  <div key={`Desk ${deskNum}`} className="mb-1">
                    {availableDeskNums.includes(deskNum) ? (
                      <Link to={getDeskNameLink(divisionName, deskNum)}>
                        <DeskSelectorButton deskNum={deskNum} open={true} />
                      </Link>
                    ) : (
                      <DeskSelectorButton deskNum={deskNum} open={false} />
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
