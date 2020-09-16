import * as React from 'react'
import { IconButton, TextInput, ActivityIndicator, Avatar, useTheme, Text, Portal, Dialog, RadioButton, Button, Chip, Divider, Caption, Subheading, DataTable } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store';
import { View, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import { SERVER_URI } from '../../../config';

const Stack = createStackNavigator();

const profileScreen = () => {

    const theme = useTheme();
    const [userDetails, setUserDetails] = React.useState(null);
    const [showDialog, setShowDialog] = React.useState(false);

    React.useEffect(() => {
        SecureStore.getItemAsync("token")
        .then(token => {
            Axios.get(`${SERVER_URI}/user/profile/`, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => setUserDetails(res.data.data))
            .catch(err => alert(err.message))
        })
        .catch(console.log)
    },[]);

    const handleUserChange = target => value => {
        setUserDetails({...userDetails, user: {...userDetails.user, [target]: value}})
    }

    const BigTextInput = (label, target, editable) => (
        <TextInput
            label={<Text style={{color: theme.colors.placeholder}}>{label}</Text>}
            value={userDetails.user[target].toString()}
            underlineColor='none'
            style={{
                backgroundColor: 'none',
                fontSize: 40,
            }}
            editable={editable && true}
            theme={{ colors: {primary: 'transparent'} }}
            onChangeText={handleUserChange(target)}
            // left={
            //     <TextInput.Icon 
            //         name='eye'
            //         style={{marginTop: 30}}
            //         onPress={() => setShowDialog(true)}
            //     />
            // }
            right={
                !editable && target === 'gender' &&
                <TextInput.Icon 
                    name='human-male-female'
                    size={30}
                    style={{marginTop: 30}}
                    onPress={() => setShowDialog(true)}
                />
            }
            disabled={target==='age'}
        />
    ) 

    return(
        userDetails !== null 
        ?
        <ScrollView style={{ flex: 1, marginBottom: 34}}>
            <Avatar.Text
                size={150}
                label={userDetails.user.first_name.slice(0, 1) + userDetails.user.last_name.slice(0, 1)}
                style={{alignSelf: 'center', marginVertical: 20}}
            />
            <Divider/>
            <Subheading style={{marginLeft: '2.5%'}}>Public details</Subheading>
            {BigTextInput('First Name', 'first_name', true)}
            {BigTextInput('Last Name', 'last_name', true)}
            {BigTextInput('Gender', 'gender', false)}
            {BigTextInput('Age', 'age', false)}
            {BigTextInput('Country', 'country', true)}
            <Divider/>
            <Subheading style={{margin: '2.5%'}}>Personal details</Subheading>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Detail</DataTable.Title>
                    <DataTable.Title>Value</DataTable.Title>
                </DataTable.Header>
                <DataTable.Row>
                    <DataTable.Cell>Email</DataTable.Cell>
                    <DataTable.Cell>{userDetails.user.email}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Date of birth</DataTable.Cell>
                    <DataTable.Cell>{userDetails.user.dob}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Date Joined</DataTable.Cell>
                    <DataTable.Cell>{userDetails.user.date_joined}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Last login</DataTable.Cell>
                    <DataTable.Cell>{userDetails.user.last_login}</DataTable.Cell>
                </DataTable.Row>
            </DataTable>
            
            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                    <Dialog.Title>Change gender</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group
                            onValueChange={handleUserChange('gender')}
                            value={userDetails.user.gender}
                        >
                            <RadioButton.Item label="Male" value="Male"/>
                            <RadioButton.Item label="Female" value="Female"/>
                            <RadioButton.Item label="Other" value="Other"/>
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDialog(false)}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView> 
        :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}

export default ({navigation}) => {

    return(
        <Stack.Navigator initialRouteName="ProfileStack">
            <Stack.Screen
                name="ProfileStack"
                options={{
                    headerTitle: 'Profile',
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
                component={profileScreen}
            />
        </Stack.Navigator>
        
    )
}