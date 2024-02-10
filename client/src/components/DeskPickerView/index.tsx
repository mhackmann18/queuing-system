import { Link } from 'react-router-dom';

const DUMMY_DIVISIONS = [
  { name: 'Motor Vehicle', availableDesks: [1, 2, 3, 4] },
  { name: 'Driver License', availableDesks: [1, 2] }
];

export default function DeskPickerView() {
  return (
    <div>
      {DUMMY_DIVISIONS.map((division) => (
        <div key={division.name}>
          <h2>{division.name}</h2>
          {division.availableDesks.map((desk) => (
            <Link
              to={`${division.name.toLowerCase().split(' ').join('-')}-customers`}
              className="bg-onyx block p-3 text-white"
              key={desk}
            >
              Desk {desk}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
