import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { NowNextContent } from '../../components/NowNext.tsx';
import { colors } from '../../components/theme.ts';

function NowAccessory() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  return <NowNextContent compact={placement === 'inline'} />;
}

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={colors.text} minimizeBehavior="onScrollDown">
      <NativeTabs.BottomAccessory>
        <NowAccessory />
      </NativeTabs.BottomAccessory>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>My plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'star', selected: 'star.fill' }} md="star" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="all">
        <NativeTabs.Trigger.Label>All talks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
