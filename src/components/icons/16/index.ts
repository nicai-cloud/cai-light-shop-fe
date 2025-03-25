import { FunctionComponent } from 'react';
import Down from './Down';
import Up from './Up';
import IconProps from '../props';
import Back from './Back';

const icon16Components = {
  back: Back,
  down: Down,
  up: Up,
};

export function getComponentForKey(key: Icon16): FunctionComponent<IconProps> {
  return icon16Components[key];
}

export type Icon16 = keyof typeof icon16Components;