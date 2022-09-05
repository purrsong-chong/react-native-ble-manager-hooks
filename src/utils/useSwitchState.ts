import { useCallback, useState } from 'react';

type UseSwitchStateType = [boolean, (v?: any) => void];

/**
 *
 * @param initValue
 *
 * @returns value: boolean
 * @returns handler: (v?:any) => void (v 는 any type 이지만 실질적으로 boolean type을 사용해야함 (pressable object의 onPress type 때문))
 *
 */
export const useSwitchState = (initValue: boolean = false): UseSwitchStateType => {
  const [value, setter] = useState(initValue);
  const handler = useCallback((v?: any) => {
    if (typeof v === 'boolean') {
      setter(v);
    } else {
      setter((prev) => !prev);
    }
  }, []);

  return [value, handler];
};
