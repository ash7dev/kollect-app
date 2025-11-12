import React from 'react';
import { ScrollView, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  showsScrollIndicator?: boolean;
};

export function HorizontalScroller({
  children,
  contentContainerStyle,
  showsScrollIndicator = false,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsScrollIndicator}
      contentContainerStyle={[
        {
          paddingHorizontal: 16,
          gap: 12,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}


