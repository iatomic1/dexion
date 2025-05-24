// Custom JSON serializer to handle BigInt
export const jsonStringifyWithBigInt = (obj: any, space?: number) => {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "bigint") {
        return value.toString() + "n"; // Add 'n' suffix to indicate it was a BigInt
      }
      return value;
    },
    space,
  );
};
