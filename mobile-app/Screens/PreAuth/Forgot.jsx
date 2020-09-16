import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, useTheme, HelperText } from 'react-native-paper'
import { View, ImageBackground } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import Axios from 'axios';
import { SERVER_URI } from '../../config';

const styles = StyleSheet.create({
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 15
    },
    helperText: {
        marginLeft: '2%',
        marginBottom: '2%'
    }
})

const errPattern = {
    value: '',
    error: false,
    message: ''
};

export default ({navigation}) => {

    const theme = useTheme()
    const [userDetails, setUserDetails] = React.useState({
        email: errPattern,
        otp: errPattern,
        password: errPattern,
        confpass: errPattern
    })

    const [level, setLevel] = React.useState(0);
    const [sec, setSec] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleUserChange = target => value => {
        let details = {...userDetails[target], value};
        details.error = false;
        details.message = '';

        if (value === '') {
            details.error = true;
            details.message = 'This field cannot be empty'
        }
        else if (target === 'password') {
            var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
            if (!strongRegex.test(value)) {
                details.error = true;
                details.message = 'Password must have numbers, symbols, and alphabets of both cases, and consist of at least 8 characters'
            }
        }
        else if (target === 'confpass') {
            if (value !== userDetails.password) {
                details.error = true;
                details.message = 'Passwords must match'
            }
        }
        setUserDetails({...userDetails, [target]: details})
    }

    const HelperTextInput = (message, label, userDetail, userDetailStr, index) => (
        <>
            {   message.length > 0 && level >= index &&
                <HelperText style={styles.helperText}>
                    {message}
                </HelperText>
            }
            <TextInput
                label={label}
                style={level >= index ? styles.inputStyle : {display: 'none'}}
                value={userDetail.value}
                error={userDetail.error}
                onChangeText={handleUserChange(userDetailStr)}
                disabled={index < level}
                secureTextEntry={sec && index === 2}
                right={index === 2 && <TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={(e) => setSec(!sec)}/>}
            />
            {
                userDetail.error && level >= index &&
                <HelperText 
                    style={styles.helperText} 
                    type='error'
                >
                    {userDetail.message}
                </HelperText>
            }
        </>
    )

    const handleSubmit = () => {
        // setLevel((level+1)%3)
        switch (level) {
            case 0:
                getOTP();
                break;
            case 1:
                validateOTP();
                break;
            default:
                setNewPass();
                break;
        }
    }

    const getOTP = () => {
        if (userDetails.email.error) {
            alert('Email must be filled!')
        }
        else {
            Axios.post(
                `${SERVER_URI}/user/otp/`,
                {
                    "email": userDetails.email.value
                },
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type" : "application/json"
                    }
                }
            )
            .then(res => {
                setLevel(1);
                setLoading(false);
            })
            .catch(err => {
                setUserDetails({...userDetails, email: {
                    ...userDetails.email,
                    error: true,
                    message: 'Email does not exist!'
                }});
                setLoading(false);
            })
        }
    }

    const validateOTP = () => {
        if(userDetails.otp.error) {
            alert('OTP must be filled')
        }
        else {
            Axios.post(
                `${SERVER_URI}/user/verify/`,
                {
                    "email": userDetails.email.value,
                    "otp": userDetails.otp.value
                },
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type" : "application/json"
                    }
                }
            )
            .then(res => {
                setLevel(2);
                setLoading(false);
            })
            .catch(err => {
                setUserDetails({...userDetails, otp: {
                    ...userDetails.otp,
                    error: true,
                    message: 'Invalid OTP!'
                }});
                setLoading(false);
            })
        }
    }

    const setNewPass = () => {
        if (userDetails.password.error || userDetails.confpass.error) {
            alert('Password error, please rectify!')
        }
        else {
            setLoading(true);
            Axios.post(
                `${SERVER_URI}/user/forgot/`,
                {
                    "email": userDetails.email.value,
                    "new_password": userDetails.password.value
                },
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type" : "application/json"
                    }
                }
            )
            .then(res => {
                alert("Password reset successfully!");
                navigation.navigate("Login");
                setLoading(false);
            })
            .catch(err => {
                alert("Network Error, please try again!");
                setLoading(false);
            })
        }
    }

    return(
        <ScrollView style={{ flex: 1, paddingTop: 20, backgroundColor: theme.dark ? 'black' : 'white'}}>
            {HelperTextInput('Enter your email to generate OTP', 'Email', userDetails.email, 'email', 0)}
            {HelperTextInput('Enter OTP received in email', 'OTP', userDetails.otp, 'otp', 1)}
            {HelperTextInput('Choose a password that is safe and easy to remember', 'Password', userDetails.password, 'password', 2)}
            {HelperTextInput('', 'Confirm Password', userDetails.confpass, 'confpass', 2)}
            <Button 
                mode='contained' 
                style = {{alignSelf: 'center', width: '90%', marginTop: 15}}
                onPress={handleSubmit}
            >
                {level === 0 ? "GET OTP" : level === 1 ? "VERIFY OTP" : "CHANGE PASSWORD"}
            </Button>
        </ScrollView>
    )
}