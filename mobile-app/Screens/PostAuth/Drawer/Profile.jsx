import * as React from 'react'
import { Button } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store';
import { Alert, BackHandler, View } from 'react-native';

export default ({navigation}) => {

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const onBackPress = () => {
    //             Alert.alert('Log out', 'Are you sure you want to log out?', [
    //                 { text: 'CANCEL', style: 'cancel', onPress: () => {} },
    //                 { text: 'LOG OUT', style: 'destructive', onPress: () => handleLogOut()}
    //             ])
    //             return true;
    //         }
    //         BackHandler.addEventListener('hardwareBackPress', onBackPress);
    //         return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    //     })
    // )

    // const handleLogOut = () => {
    //     SecureStore.deleteItemAsync('token')
    //     .then(() => navigation.navigate("Login"))
    //     .catch(console.log);
    // }

    return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button>PROFILE</Button>
        </View>
    )
}