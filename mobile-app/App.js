import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppearanceProvider } from 'react-native-appearance';
import ThemeRoot from './ThemeRoot'

export default function App() {
  return (
    <AppearanceProvider>   
        <SafeAreaProvider>
          <ThemeRoot/>
        </SafeAreaProvider>
    </AppearanceProvider>
  );
}
