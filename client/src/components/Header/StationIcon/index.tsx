import { StationIconProps } from './types';

export default function StationIcon({
  onClick,
  station,
  forwardRef,
  menuActive
}: StationIconProps) {
  const stylesByStation = {
    MV1: 'bg-mv1',
    MV2: 'bg-mv2',
    MV3: 'bg-mv3',
    MV4: 'bg-mv4',
    DL1: 'bg-dl1',
    DL2: 'bg-dl2'
  };

  return (
    <button
      className={`${stylesByStation[station]} ${
        menuActive
          ? 'outline-platinum outline outline-4'
          : 'hover:outline-antiflash_white hover:outline hover:outline-4'
      } h-10 w-10 rounded-full border-0 text-sm font-semibold text-white`}
      type="button"
      onClick={onClick}
      ref={forwardRef}
    >
      {station}
    </button>
  );
}
