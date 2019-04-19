export type NumberHandler = ReturnType<typeof handler>;

export default function handler(nbr: number) {
  return {
    atLeast(val: number) {
      return nbr < val ? val : nbr;
    },
    atMost(val: number) {
      return nbr > val ? val : nbr;
    },
    between(min: number, max: number) {
      if (nbr > max) nbr = max;
      if (nbr < min) nbr = min;
      return nbr;
    },
    increment(min: number, max: number, step = 1) {
      nbr += step;
      if (nbr > max) nbr = min;
      if (nbr < min) nbr = max;
      return nbr;
    }
  };
}
