import React, { useEffect, useLayoutEffect } from 'react';
import { ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';

export type ModeType = 'light' | 'dark' | 'system';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  useIsomorphicLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      const element = document.documentElement;
      if (mode === 'dark') {
        element.classList.add('dark');
      } else if (mode === 'light') {
        element.classList.remove('dark');
      }
    }
  }, [mode]);

  return (
    <OverlayProvider children={<ToastProvider children={props.children} />} />
  );
}
