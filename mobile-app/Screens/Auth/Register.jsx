import * as React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../Constants/Network';
import * as SecureStore from 'expo-secure-store'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, TextInput, HelperText, Caption, ActivityIndicator, Button, Chip } from 'react-native-paper';

const errPattern = {
    status: false,
    message: ''
};

export default ({ navigation }) => {
    
    const [sec, setSec] = React.useState(true)
    const [date, setDate] = React.useState(new Date());
    const [showDate, setShowDate] = React.useState(false)
    const [userDetails, setUserDetails] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        gender: '',
        country: ''
    })
    const [loading, setLoading] = React.useState(false)
    const [personality, setPersonality] = React.useState({
        productivity: false,
        self_help: false,
        self_improvement : false,
        personal_development: false,
        spirituality: false,
        motivation: false,
        positivity: false,
        career: false,
        discipline: false,
        relationships:false,
        success: false,
        depression: false,
        anxiety: false,
        ptsd: false,
        alcohol: false,
        internet_addiction: false,
        bipolar_disorder: false,
        social_anxiety_disorder: false,
        stress: false,
        sleep_disorder: false,
        empathy_deficit_disorder:false 
    })

    const [errors, setErrors] = React.useState({
        first_name: errPattern,
        last_name: errPattern,
        email: errPattern,
        password: errPattern,
        confirm_password: errPattern,
        gender: errPattern,
        country: errPattern,
        personalityErr: errPattern
    })

    const handleUserChange = target => value => {
        let tUD = {...userDetails}
        let tE = {...errors}
        tUD[target] = value
        tE[target] = value.length ? errPattern : { status: true, message: 'Field cannot be empty' };
        setUserDetails(tUD)
        setErrors(tE);

        if (target === 'email' && value.length) {
            tE[target] = (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) 
            ? 
            { status: true, message: 'Email address is invalid' } : 
            errPattern
            setErrors(tE)
        }

        if (target === 'password' && value.length) {
            var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
            tE[target] = 
            strongRegex.test(value) ? 
            errPattern : 
            {
                status: true,
                message: 'Password must have numbers, symbols, and alphabets of both cases, and consist of at least 8 characters'
            }
            
            setErrors(tE)
        }

        if (target === 'confirm_password' && value.length) {
            tE[target] = value !== userDetails.password ? 
            { status: true, message: 'Passwords must match' } : 
            errPattern
            setErrors(tE)
        }
    }

    const handlePersonalityChange = target => value => {
        let tP = {...personality}
        tP[target] = value
        setPersonality(tP)
    }

    const handleSubmit = () => {
        const persLength = Object.getOwnPropertyNames(personality).filter(keys => personality[keys]).length
        if (
            Object.getOwnPropertyNames(errors).some(val => errors[val][0]) ||
            Object.getOwnPropertyNames(userDetails).some(keys => userDetails[keys].length === 0) ||
            persLength === 0 || persLength > 10
        ) {
            // error handling
            alert('Empty fields detected!')
            if (persLength === 0 || persLength > 10) {
                let tE = {...errors}
                tE.personalityErr = {
                    status: true,
                    message: 'Selected tags must be between 1 and 10'
                }
                setErrors(tE)
            }
        }
        else {
            setLoading(true);
            const {confirm_password, ...user} = userDetails;
            let tags = ''
            Object.getOwnPropertyNames(personality).forEach(str => {
                if (personality[str])
                    tags += str + ' '
            })
            const data = {
                ...user,
                dob: date.toISOString().split('T')[0],
                tags
            }
            Axios.post(
                `${SERVER_URI}/user/register/`,
                data,
                {
                    headers: AXIOS_HEADERS
                }
            )
            .then(res => SecureStore.setItemAsync("token", res.data.token))
            .then(() => {
                navigation.navigate('Drawer')
            })
            .catch(err => {
                alert(err.message)
            })
            .finally(() => {
                setLoading(false)
            })
        }
    }

    return(
        <ScrollView style={styles.scrollView}>
            <SafeAreaView/>
            <Title style={styles.title}>
                Register
            </Title>
            {
                Object.getOwnPropertyNames(userDetails).map((key, index) => 
                    <React.Fragment key={index}>
                        <TextInput
                            placeholder={key === 'gender' ? 'Male/Female/Other' : ''}
                            label={key.split("_").join(" ").toUpperCase()}
                            style={styles.inputStyle}
                            value={userDetails[key]}
                            onChangeText={handleUserChange(key)}
                            error={errors[key].status}
                            secureTextEntry={key.includes('password') ? sec : false}
                            right={key.includes('password') && 
                                <TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={() => setSec(!sec)}/>
                            }
                        />
                        {
                            errors[key].status && 
                            <HelperText type='error' style={styles.helperText} key={index}>
                                {errors[key].message}
                            </HelperText>
                        }
                    </React.Fragment>
                )
            }
            <TextInput
                label="Date of Birth (YYYY-MM-DD)"
                right={ <TextInput.Icon name='calendar-month' onPress={() => setShowDate(true)}/> }
                style={styles.inputStyle}
                editable={false}
                value={date.toISOString().split('T')[0]}
            />
            <Caption style={{alignSelf: 'center', marginVertical: 10}}>Select topics of interest</Caption>
            {
                errors.personalityErr.status &&
                <HelperText type='error' style={{alignSelf: 'center'}}>{errors.personalityErr.message}</HelperText>
            }
            <View style={styles.personalityView}>
            {
                Object.getOwnPropertyNames(personality).map((val, index) => 
                    <Chip
                        key={index}
                        selected={personality[val]}
                        style={{margin: 10}}
                        onPress={() => handlePersonalityChange(val)(!personality[val])}
                    >
                        {val.split('_').join(' ')}
                    </Chip>
                )
            }
            </View>
            <Button
                mode='contained'
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={loading}
            >
                Register
            </Button>
            {
                showDate &&
                <DateTimePicker
                    value={date}
                    mode='date'
                    onChange={(e, d) => {
                        if (d)
                            setDate(d)
                        setShowDate(false)
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                />
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1
    },
    title: {
        fontSize: 40, 
        paddingVertical: 40, 
        alignSelf: 'center'
    },
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 15
    },
    helperText: {
        marginLeft: '5%',
        alignSelf: 'flex-start',
    },
    personalityView: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginHorizontal: 10
    },
    submitButton: {
        alignSelf: 'center', 
        width: '90%', 
        marginTop: 20,
    }
})