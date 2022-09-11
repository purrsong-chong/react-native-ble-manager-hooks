import { useCallback, useState } from "react";

type UseSwitchStateType = [boolean, (v?: boolean) => void];

/**
 *
 *
 * useSwitchState
 * - handle state[boolean only]
 *
 * @param initValue :boolean
 *
 * @returns value: boolean - state
 * @returns handler: (v?:boolean) => void - action to change state
 *
 */
export const useSwitchState = (
  initValue: boolean = false
): UseSwitchStateType => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((v?: boolean) => {
    if (typeof v === "boolean") {
      setter(v);
    } else {
      setter((prev) => !prev);
    }
  }, []);

  return [value, handler];
};
