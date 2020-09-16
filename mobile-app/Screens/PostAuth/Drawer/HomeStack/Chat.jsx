import * as React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

export default ({navigation}) => {
    return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Button>THIS IS THE CHAT SCREEN!</Button>
        </View>
    )
}