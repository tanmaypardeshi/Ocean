import React, { useEffect, useState } from 'react'
import { View, ImageBackground, Alert } from 'react-native'
import BeachDark from '../../assets/beachDark.png'
import BeachLight from '../../assets/beachLight.png'
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const styles = StyleSheet.create({
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 15
    },
    helperText: {
        marginLeft: '5%'
    }
})

const errPattern = {
    value: '',
    error: false,
    message: ''
}

export default ({navigation}) => {

    useEffect(() => {
        SecureStore.getItemAsync("token")
		.then((res) => {
			if (res !== null)
				navigation && navigation.navigate("DrawerParent");
			setLoading(false);
		})
		.catch(err => {
			alert(err);
			setLoading(false);
		})
    },[])

    const theme = useTheme();

    const [sec, setSec] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loginDetails, setLoginDetails] = useState({
        email: errPattern,
        password: errPattern
    })

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

    const nav = destination => event => {
        navigation.navigate(destination);
    }

    const handleSubmit = () => {
        if (!loginDetails.password.error && !loginDetails.email.error) {
            setLoading(true);
            const data = {
                "email": loginDetails.email.value,
                "password": loginDetails.password.value
            }
            console.log(data);
            Axios.post(
                "http://192.168.29.126:8000/api/login/",
                data,
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type" : "application/json"
                    }
                }
            )
            .then(res => {
                SecureStore
                .setItemAsync("token", res.data.token)
                .then(() => {
                    setLoading(false);
                    navigation.navigate('DrawerParent');
                })
                .catch(() => {
                    setLoading(false);
                    alert('Token storage failure');
                });
            })
            .catch(err => {
                setLoading(false);
                alert(err.message);
                setLoginDetails({...loginDetails, password: {...loginDetails.password, error: true, message: err.message}});
            })
        }
        else {
            alert('Invalid fields detected, please rectify.')
        }
    }

    return(
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.dark ? 'black' : 'white'}}>
            <TextInput
                label="Email"
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
                secureTextEntry={sec}
                left={<TextInput.Icon name='lock'/>}
                right={<TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={(e) => setSec(!sec)}/>}
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
                mode='text' 
                style = {{alignSelf: 'flex-end', width: '50%'}}
                onPress = {nav('Forgot Password')}
            >
                Forgot Password?
            </Button>
            {
                loading
                ?
                <ActivityIndicator animating={true}/>
                :
                <Button 
                    mode='contained' 
                    style = {{alignSelf: 'center', width: '90%', marginTop: 15}}
                    onPress={handleSubmit}
                >
                    Login
                </Button>
                }
            <Button 
                mode='text' 
                style = {{alignSelf: 'center', width: '90%', marginTop: 7}}
                onPress = {nav('Register')}
            >
                Create an account instead?
            </Button>
        </View>
    )
}