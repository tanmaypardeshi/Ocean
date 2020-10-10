import * as React from 'react';
import { NavigationContainer, DarkTheme as DRKT, DefaultTheme as DFT} from '@react-navigation/native';
import { Provider as PaperProvider, DarkTheme, DefaultTheme, Colors } from 'react-native-paper';
import { useColorScheme } from 'react-native-appearance';
import { StatusBar } from 'expo-status-bar';
import MainStackNavigator from './Navigators/MainStackNavigator';

const newColors = {
    primary: Colors.blue500,
    accent: Colors.teal500
}

const PDRK = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        ...newColors
    }
}

const PDFT = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        ...newColors
    }
}

export default () => {

    const dark = useColorScheme() === 'dark' ? true : false;

    return(
        <PaperProvider theme={dark ? PDRK : PDFT}>
            <NavigationContainer theme={dark ? DRKT : DFT}>
                <StatusBar style={dark ? 'light' : 'dark'} />
                <MainStackNavigator/>
            </NavigationContainer>
        </PaperProvider>
    )
}