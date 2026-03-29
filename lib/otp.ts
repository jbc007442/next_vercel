export const generateOTP = (): string => {
  const array = new Uint32Array(6);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => (num % 10).toString()).join('');
};
