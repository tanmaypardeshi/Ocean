import * as React from 'react'
import { Provider as PaperProvider, DefaultTheme, DarkTheme, IconButton, Colors } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as RNT, DarkTheme as RNDT} from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Login from './Screens/PreAuth/Login'
import { StatusBar } from 'expo-status-bar'
import Register from './Screens/PreAuth/Register';
import { KeyboardAvoidingView } from 'react-native';
import Forgot from './Screens/PreAuth/Forgot';
import HomeStackScreen from './Screens/PostAuth/DrawerParent';

const Stack = createStackNavigator();

const myDefaultTheme = {...DefaultTheme, colors: {...DefaultTheme.colors, primary: '#0064fa'}}
const myDarkTheme = {...DarkTheme, colors: {...DarkTheme.colors, primary: '#00abfa'}}

const navOptions = (dark, setDark) => ({
  headerTitleAlign: 'center',
  headerStyle: {
    height: 128, 
    backgroundColor: dark ? 'black' : 'white',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {fontSize: 36},
  headerRightContainerStyle: {paddingRight: 15},
  headerRight: () => (
    <IconButton 
      icon={dark ? 'brightness-7' : 'brightness-4'}
      onPress={(e) => setDark(!dark)}
      color={dark ? Colors.white : Colors.black}
      size={36}
    />
  )
})

function App() {
  //const scheme = useColorScheme();
  const [dark, setDark] = React.useState(true)

  return (
    <>
    <StatusBar style = {dark ? 'light' : 'dark'}/>
    <PaperProvider theme = {dark ? myDarkTheme : myDefaultTheme}>
      <NavigationContainer theme={dark ? RNDT : RNT}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name='Login' 
            component={Login}
            options={navOptions(dark, setDark)}
          />
          <Stack.Screen
            name='Register'
            component={Register}
            options={navOptions(dark, setDark)}
          />
          <Stack.Screen
            name='Forgot Password'
            component={Forgot}
            options={{...navOptions(dark, setDark), headerTitleStyle: {fontSize: 24}}}
          />
          <Stack.Screen
            name='DrawerParent'
            component={HomeStackScreen}
            options={{headerShown: false}}
            initialParams={{dark, setDark}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </>
  );
}

export default App;