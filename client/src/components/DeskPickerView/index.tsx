import { useEffect, useState } from 'react';
import DeskSelectorButton from './DeskSelectorButton';
import Connector from 'utils/signalRConnection';
import useOffice from 'hooks/useOffice';
import useDesk from 'hooks/useDesk';
import { useNavigate } from 'react-router-dom';

export default function DeskPickerView() {
  const { id: officeId } = useOffice();
  const [deskAvailabilityByDivision, setDeskAvailabilityByDivision] = useState<
    { divisionName: string; numDesks: number; occupiedDeskNums: number[] }[]
  >([]);
  const { events } = Connector();
  const { sitAtDesk, desk } = useDesk();
  const navigate = useNavigate();

  useEffect(() => {
    if (desk) {
      console.log(getDeskNameLink(desk.divisionName, desk.number));
      navigate(getDeskNameLink(desk.divisionName, desk.number));
    }
  }, [desk, navigate]);

  // Fetch desk availability on component mount
  useEffect(() => {
    const getDeskAvailabilty = async () => {
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${officeId}/divisions`,
        {
          method: 'GET'
        }
      );

      const { error, data } = await res.json();

      if (error) {
        console.error(error);
      } else if (data) {
        console.log(data);
        setDeskAvailabilityByDivision(
          data.map(
            (division: {
              name: string;
              maxNumberOfDesks: number;
              occupiedDeskNums: number[];
            }) => ({
              divisionName: division.name,
              numDesks: division.maxNumberOfDesks,
              occupiedDeskNums: division.occupiedDeskNums
            })
          )
        );
      }
    };
    events({
      onDesksUpdated: getDeskAvailabilty
    });
    getDeskAvailabilty();
  }, [events, officeId]);

  // Convert division name and desk number to a link
  const getDeskNameLink = (divisionName: string, deskNum: number) =>
    `${divisionName.toLowerCase().split(' ').join('-')}-desk-${deskNum}`;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-96">
        <h1 className="mb-6 text-2xl font-semibold">Select a desk</h1>

        {deskAvailabilityByDivision.map(
          ({ divisionName, numDesks, occupiedDeskNums }) => (
            <div
              key={divisionName}
              className="border-french_gray_1-600 mb-4 rounded-md border p-4 shadow-md"
            >
              <h2 className="text-slate_gray-400 mb-4 text-lg font-medium">
                {divisionName}
              </h2>

              {Array.from({ length: numDesks }).map((_, index) => {
                const deskNum = index + 1;

                const handleDeskClick = async () => {
                  const res = await sitAtDesk({ divisionName, number: deskNum });

                  console.log(res);

                  if (res.error) {
                    console.error(res.error);
                    return;
                  }
                };

                return (
                  <div key={`Desk ${deskNum}`} className="mb-1">
                    {!occupiedDeskNums.includes(deskNum) ? (
                      <DeskSelectorButton
                        onClick={handleDeskClick}
                        deskNum={deskNum}
                        open={true}
                      />
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
