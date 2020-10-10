import * as React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Avatar, Button, TextInput, Title, useTheme, ActivityIndicator, HelperText } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../Constants/Network'

const styles = StyleSheet.create({
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 15
    },
    helperText: {
        marginLeft: '5%',
        alignSelf: 'flex-start'
    }
})

const errPattern = {
    value: '',
    error: false,
    message: ''
}


export default ({navigation}) => {

    const theme = useTheme()

    const [sec, setSec] = React.useState(true)
    const [postLoading, setPostLoading] = React.useState(false)
    const [loginDetails, setLoginDetails] = React.useState({
        email: errPattern,
        password: errPattern
    })

    const [authError, setAuthError] = React.useState(false)
    const [authErrMsg, setAuthErrMsg] = React.useState('')

    const handleChange = target => value => {
        setLoginDetails({
            ...loginDetails,
            [target]: {
                value,
                error: value.length === 0,
                message:  value.length === 0 ? 'Field cannot be empty' : ''
            }
        })
    }

    const handleSubmit = () => {
        if (loginDetails.password.value.length === 0 || loginDetails.email.value.length === 0) {
            handleChange('email')(loginDetails.email.value)
            handleChange('password')(loginDetails.password.value)
        }
        else {
            setPostLoading(true)
            setAuthError(false)
            const data = {
                "email": loginDetails.email.value,
                "password": loginDetails.password.value
            }
            console.log(data)
            Axios.post(
                `${SERVER_URI}/user/login/`,
                data,
                {
                    headers: AXIOS_HEADERS
                }
            )
            .then(res => {
                return SecureStore.setItemAsync("token", res.data.token)
            })
            .then(() => {
                navigation.navigate('Drawer')
            })
            .catch(err => {
                console.log(err)
                setAuthError(true)
                setAuthErrMsg(err.message + '\n' + "Swipe right to reset password or left to create an account")
            })
            .finally(() => {
                setPostLoading(false)
            })
        }
    }

    return(
        <ScrollView style = {{flex: 1}} contentContainerStyle = {{alignItems: 'center'}}>
            <SafeAreaView/>
            {
                postLoading 
                ?
                <ActivityIndicator size={200} animating={true}/> 
                :
                <Avatar.Icon 
                    icon='waves' 
                    size={200} 
                    color={theme.colors.text} 
                    style={{backgroundColor: 'transparent'}}
                />
            }
            <Title style={{fontSize: 40, paddingVertical: 40}}>
                Ocean
            </Title>
            <TextInput
                label="Email"
                autoCompleteType="email"
                left={<TextInput.Icon name='email'/>}
                style={styles.inputStyle}
                value={loginDetails.email.value}
                error={loginDetails.email.error}
                onChangeText={handleChange('email')}
            />
            {
                loginDetails.email.error &&
                <HelperText type='error' style={styles.helperText}>
                    {loginDetails.email.message}
                </HelperText> 
            }
            <TextInput
                label="Password"
                autoCompleteType="password"
                secureTextEntry={sec}
                left={<TextInput.Icon name='lock'/>}
                right={<TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={() => setSec(!sec)}/>}
                style={styles.inputStyle}
                value={loginDetails.password.value}
                error={loginDetails.password.error}
                onChangeText={handleChange('password')}
            />
            {
                loginDetails.password.error &&
                <HelperText type='error' style={styles.helperText}>
                    {loginDetails.password.message}
                </HelperText> 
            }
            <Button 
                mode='contained' 
                style = {{justifyContent: 'center', alignSelf: 'center', width: '90%', height: 50}}
                onPress = {handleSubmit}
            >
                Login
            </Button>
            {
                authError && 
                <HelperText type='error' style={styles.helperText}>
                    {authErrMsg}
                </HelperText> 
            }
        </ScrollView>
    )
}