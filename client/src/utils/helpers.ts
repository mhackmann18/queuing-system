const get12HourTimeString = (date: Date) => {
  let dateString;
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const minutesString = minutes < 10 ? `0${minutes}` : minutes;

  if (hours >= 12) {
    dateString = `${hours === 12 ? hours : hours % 12}:${minutesString} PM`;
  } else {
    dateString = `${hours === 0 ? '12' : hours}:${minutesString} AM`;
  }

  return dateString;
};

export { get12HourTimeString };
