import * as React from 'react'
import { IconButton, TextInput, ActivityIndicator, Avatar, useTheme, Text, Divider, Subheading, DataTable, FAB } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store';
import { View, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';

const Stack = createStackNavigator();

const profileScreen = () => {

    const theme = useTheme();
    const [userDetails, setUserDetails] = React.useState(null);
    const [fabIcon, setFabIcon] = React.useState('pencil')

    React.useEffect(() => {
        SecureStore.getItemAsync("token")
        .then(token => {
            Axios.get(`${SERVER_URI}/user/profile/`, {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => setUserDetails(res.data.data))
            .catch(err => alert(err.message))
        })
        .catch(console.log)
    },[]);

    const handleUserChange = target => value => {
        setUserDetails({...userDetails, [target]: value})
    }

    const BigTextInput = (label, target, editable) => (
        <TextInput
            label={<Text style={{color: theme.colors.placeholder}}>{label}</Text>}
            value={userDetails[target].toString()}
            underlineColor='none'
            style={{
                backgroundColor: 'none',
                fontSize: 40,
            }}
            editable={editable && true}
            theme={{ colors: {primary: 'transparent'} }}
            onChangeText={handleUserChange(target)}
            disabled={target==='age'}
        />
    )
    
    const updateProfile = () => {
        SecureStore.getItemAsync('token')
        .then(token => {
            setFabIcon('update')
            let newTags = ''
            userDetails.tags.forEach(val =>
                newTags = newTags + " " + val    
            )
            return Axios.patch(
                `${SERVER_URI}/user/profile/`,
                {...userDetails, tags: newTags},
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .catch(err => alert(err.message))
        .finally(() => setFabIcon('pencil'))
    }

    return(
        userDetails !== null 
        ?
        <>
        <ScrollView style={{ flex: 1, marginBottom: 34}}>
            <Avatar.Text
                size={150}
                label={userDetails.first_name[0] + userDetails.last_name[0]}
                style={{alignSelf: 'center', marginVertical: 20}}
            />
            <Divider/>
            <Subheading style={{marginLeft: '2.5%'}}>Public details</Subheading>
            {BigTextInput('First Name', 'first_name', true)}
            {BigTextInput('Last Name', 'last_name', true)}
            {BigTextInput('Gender', 'gender', true)}
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
                    <DataTable.Cell>{userDetails.email}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Date of birth</DataTable.Cell>
                    <DataTable.Cell>{userDetails.dob}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Date Joined</DataTable.Cell>
                    <DataTable.Cell>{userDetails.date_joined.split('T')[0]}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                    <DataTable.Cell>Last login</DataTable.Cell>
                    <DataTable.Cell>{userDetails.last_login.split('T')[0]}</DataTable.Cell>
                </DataTable.Row>
            </DataTable>
        </ScrollView>
        <FAB
            label={fabIcon === 'pencil' ? 'Update' : 'Updating'}
            icon={fabIcon}
            onPress={updateProfile}
            style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0
            }}
        />
        </> 
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