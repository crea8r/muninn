export const substatus = (s: number) => {
  return s === 0
    ? 'To Engage'
    : s === 1
    ? 'Proceeding'
    : s === 2
    ? 'Drop Out'
    : 'Unknown';
};
