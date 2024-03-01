import { useEffect, useState } from 'react';
import DeskSelectorButton from './DeskSelectorButton';
import useDesk from 'hooks/useDesk';
import { useNavigate } from 'react-router-dom';
import { useDivisions } from 'hooks/apiHooks';

export default function DeskPickerView() {
  const [deskAvailabilityByDivision, setDeskAvailabilityByDivision] = useState<
    { name: string; maxNumberOfDesks: number; occupiedDeskNums: number[] }[]
  >([]);
  const { sitAtDesk, desk } = useDesk();
  const navigate = useNavigate();
  const { divisions } = useDivisions();

  useEffect(() => {
    if (desk) {
      console.log(getDeskNameLink(desk.divisionName, desk.number));
      navigate(getDeskNameLink(desk.divisionName, desk.number));
    }
  }, [desk, navigate]);

  // Fetch desk availability on component mount
  useEffect(() => {
    if (divisions) {
      setDeskAvailabilityByDivision(
        divisions.map(({ name, maxNumberOfDesks, occupiedDeskNums }) => ({
          name,
          maxNumberOfDesks,
          occupiedDeskNums
        }))
      );
    }
  }, [divisions]);

  // Convert division name and desk number to a link
  const getDeskNameLink = (divisionName: string, deskNum: number) =>
    `${divisionName.toLowerCase().split(' ').join('-')}-desk-${deskNum}`;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-96">
        <h1 className="mb-6 text-2xl font-semibold">Select a desk</h1>

        {deskAvailabilityByDivision.map(
          ({ name: divisionName, maxNumberOfDesks, occupiedDeskNums }) => (
            <div
              key={divisionName}
              className="border-french_gray_1-600 mb-4 rounded-md border p-4 shadow-md"
            >
              <h2 className="text-slate_gray-400 mb-4 text-lg font-medium">
                {divisionName}
              </h2>

              {Array.from({ length: maxNumberOfDesks }).map((_, index) => {
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
