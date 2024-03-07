import { useEffect, useState, useContext } from 'react';
import DeskSelectorButton from './DeskSelectorButton';
import { useNavigate } from 'react-router-dom';
import useDivisions from 'hooks/api/useDivisions';
import { DivisionDto } from 'hooks/api/types';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import ErrorAlert from 'components/ErrorAlert';

export default function DeskPickerView() {
  const navigate = useNavigate();
  const [deskAvailabilityByDivision, setDeskAvailabilityByDivision] = useState<
    DivisionDto[]
  >([]);
  const { sitAtDesk } = useContext(DeskContext);
  const {
    divisions,
    loading: divisionsLoading,
    error: divisionsError
  } = useDivisions();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (divisionsError) {
      setError(divisionsError);
    }
  }, [divisionsError]);
  // useEffect(() => {
  //   if (desk) {
  //     navigate(getDeskNameLink(desk.divisionName, desk.number));
  //   }
  // }, [desk, navigate]);

  // Fetch desk availability on component mount
  useEffect(() => {
    if (divisions) {
      setDeskAvailabilityByDivision(
        divisions.map(({ name, numberOfDesks, occupiedDeskNumbers }) => ({
          name,
          numberOfDesks,
          occupiedDeskNumbers
        }))
      );
    }
  }, [divisions]);

  // Convert division name and desk number to a link
  const getDeskNameLink = (divisionName: string, deskNumber: number) =>
    `${divisionName.toLowerCase().split(' ').join('-')}-desk-${deskNumber}`;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-96">
        <h1 className="mb-6 text-2xl font-semibold">Select a desk</h1>

        {divisionsLoading ? (
          <>Loading available desks...</>
        ) : (
          deskAvailabilityByDivision.map(
            ({ name: divisionName, numberOfDesks, occupiedDeskNumbers }) => (
              <div
                key={divisionName}
                className="border-french_gray_1-600 mb-4 rounded-md border p-4 shadow-md"
              >
                <h2 className="text-slate_gray-400 mb-4 text-lg font-medium">
                  {divisionName}
                </h2>

                {Array.from({ length: numberOfDesks }).map((_, index) => {
                  const deskNum = index + 1;

                  const handleDeskClick = async () => {
                    try {
                      const desk = await sitAtDesk({
                        divisionName,
                        number: deskNum
                      });
                      navigate(getDeskNameLink(desk.divisionName, desk.number));
                    } catch (error) {
                      if (error instanceof Error) {
                        // TODO handle error
                        setError(error.message);
                      }
                    }
                  };

                  return (
                    <div key={`Desk ${deskNum}`} className="mb-1">
                      {!occupiedDeskNumbers.includes(deskNum) ? (
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
          )
        )}
      </div>
      {error && (
        <ErrorAlert
          error={error}
          close={() => setError('')}
          styles={'fixed bottom-10 right-10'}
        />
      )}
    </div>
  );
}
