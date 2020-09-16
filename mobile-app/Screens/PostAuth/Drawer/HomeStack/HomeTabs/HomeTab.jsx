import * as React from 'react';
import { View, BackHandler, Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, IconButton, TextInput, Appbar, useTheme, Card, Avatar, Title, Paragraph } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
    cardStyle: {
        marginVertical: 10
    }
})

const HomeScreen = ({navigation}) => {

    const theme = useTheme();
    
    return(
        <ScrollView style={{flex: 1, marginTop: 20, marginHorizontal: 10}}>
            <TextInput
                placeholder="What's new?"
                multiline={true}
                theme={{ colors: {primary: 'transparent'} }}
            />
            <Appbar style={{justifyContent: 'space-around'}}>
                <Appbar.Action icon='image'/>
                <Appbar.Action icon='camera'/>
                <Appbar.Action icon='link'/>
                <Appbar.Action icon='send'/>
            </Appbar>
            <Card style={styles.cardStyle}>
                <Card.Title 
                    title="John Doe" 
                    subtitle="Male | 20"
                    left={props => <Avatar.Text {...props} label='JD'/>}
                    right={props => <IconButton {...props} icon='dots-vertical'/>}
                />
                
                <Card.Content>
                    <Title>Card title</Title>
                    <Card.Cover source={{ uri: 'https://picsum.photos/600/300' }} />
                    <Paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing...</Paragraph>
                </Card.Content>
                <Card.Actions style={{justifyContent: 'space-around'}}>
                    <IconButton icon='thumb-up'/>
                    <IconButton icon='comment'/>
                    <IconButton icon='share-variant'/>
                    <IconButton icon='download'/>
                </Card.Actions>
            </Card>
        </ScrollView>
        // <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        //     <Button>THIS IS THE HOME TAB/SCREEN!</Button>
        // </View>
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