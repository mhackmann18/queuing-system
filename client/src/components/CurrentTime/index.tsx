import { useState, useEffect } from 'react';
import { get12HourTimeString } from 'utils/helpers';

interface CurrentTimeProps {
  styles?: string;
}

export default function CurrentTime({ styles }: CurrentTimeProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div className={`${styles}`}>{`${get12HourTimeString(time)}`}</div>;
}
