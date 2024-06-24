export const shortenAddress = (address: string, length: number = 3) => {
  const len = address.length;
  return (
    address.slice(0, length + 2) + "..." + address.slice(len - length, len)
  );
};

export const formatDate = (date: Date) => {
  const Months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const hr = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  const t = `${hr.toString().padStart(2, "0")}:${min
    .toString()
    .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

  const y = date.getFullYear();
  const m = Months[date.getMonth()];
  const d = date.getDate();

  const day = `${y} ${m} ${d}`;

  return {
    time: t,
    date: day,
  };
};
