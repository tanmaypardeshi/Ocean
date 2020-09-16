import * as React from 'react';
import { View, BackHandler, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const HomeScreen = ({navigation}) => {
    return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Button>THIS IS THE HOME TAB/SCREEN!</Button>
        </View>
    )
}

export default ({navigation}) => {

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert('Log out', 'Are you sure you want to log out?', [
                    { text: 'CANCEL', style: 'cancel', onPress: () => {} },
                    { text: 'LOG OUT', style: 'destructive', onPress: () => handleLogOut()}
                ])
                return true;
            }
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        })
    )

    const handleLogOut = () => {
        SecureStore.deleteItemAsync('token')
        .then(() => navigation.navigate("Login"))
        .catch(console.log);
    }

    return(
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
                name="Home" 
                options={{
                    headerTitle: 'Home',//() => <Searchbar placeholder='Ocean search'/> ,
                    headerRight: () => <IconButton icon='message-text' onPress={() => navigation.navigate('Chat')}/>,
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
                component={HomeScreen}
            />
        </Stack.Navigator>
        
    )
}