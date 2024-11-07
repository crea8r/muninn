export const getSubStatusLabel = (s: number) => {
  return s === 0
    ? 'To Engage'
    : s === 1
    ? 'Proceeding'
    : s === 2
    ? 'Drop Out'
    : 'Unknown';
};

export const getSubStatusOptions = () => {
  return [0, 1, 2];
};
