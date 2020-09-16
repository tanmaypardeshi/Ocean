import React, {useState, useEffect } from 'react'
import {View, InteractionManager} from 'react-native'
import { TextInput, IconButton, Button, RadioButton, Caption, Portal, Dialog, Text, Menu, Chip, ActivityIndicator, HelperText } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import Axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import { SERVER_URI } from '../../config'

const styles = StyleSheet.create({
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 15
    },
    helperText: {
        marginLeft: '5%'
    }
})

const errPattern = [false, ''];

export default ({navigation}) => {

    const theme = useTheme();

    const [render, setRender] = useState(false);
    const [sec, setSec] = useState(true);
    const [date, setDate] = useState(new Date('July 2, 2000'));
    const [showDate, setShowDate] = useState(false);
    const [userDetails, setUserDetails] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confpass: '',
        gender: 'Male',
        country: ''
    })
    const [showCountry, setShowCountry] = useState(false);
    const [countryList, setCountryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [personality, setPersonality] = useState({
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

    const [errors, setErrors] = useState({
        first_name: errPattern,
        last_name: errPattern,
        email: errPattern,
        password: errPattern,
        confpass: errPattern,
        country: errPattern,
        personalityErr: errPattern
    })

    useEffect(() => {
        //console.log(new Date(new Date().setFullYear(new Date().getFullYear()-13)));
        InteractionManager.runAfterInteractions(() => {
            Axios
            .get('https://restcountries.eu/rest/v2/all')
            .then(res => {
                // handleUserChange('country', res.data[0].name)
                setCountryList(res.data.map(val => val.name))
            })
            .catch(err => alert(err));
        })
        .then(() =>setRender(true))
    }, [])


    const handleUserChange = target => value => {
        setUserDetails({...userDetails, [target]: value});
        setErrors({...errors, [target]: value.length ? errPattern : [true, 'Field cannot be left empty']});
        
        if (target === 'email' && value.length) {
            setErrors({
                ...errors, 
                [target]: 
                (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) 
                ? 
                [true, 'Email address is invalid'] 
                :
                errPattern
            })
        }

        if (target === 'password' && value.length) {
            var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
            setErrors({
                ...errors,
                [target]: !strongRegex.test(value) 
                ? 
                [true, 'Password must have numbers, symbols, and alphabets of both cases, and consist of at least 8 characters'] 
                :
                errPattern
            })
        }

        if (target === 'confpass' && value.length) {
            setErrors({
                ...errors, 
                [target]: value !== userDetails.password 
                ? 
                [true, 'Passwords must match'] 
                :
                errPattern
            })
        }
    }

    const handlePersonalityChange = (target, value) => {
        setPersonality({...personality, [target]: value})
    }

    const handleSubmit = () => {
        if (!Object.getOwnPropertyNames(errors).filter(val => errors[val][0]).length) {
            const {confpass, ...user} = userDetails;
            const data = {
                ...personality,
                "user": {...user, dob: date.getUTCFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()}
            }
            console.log(data);
            Axios.post(
                `${SERVER_URI}/user/register/`,
                data,
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type" : "application/json"
                    },
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
                alert(err.message)
            })
        }
        else {
            alert('Invalid fields detected, please rectify.')
        }
    }

    return(
        render ?
        <ScrollView style={{ flex: 1, paddingTop: 20, backgroundColor: theme.dark ? 'black' : 'white'}}>
            <TextInput
                label="First Name"
                style={styles.inputStyle}
                value={userDetails.first_name}
                onChangeText={handleUserChange('first_name')}
                error={errors.first_name[0]}
            />
            {
                errors.first_name[0] && 
                <HelperText 
                    type='error'
                    style={styles.helperText}
                >
                    {errors.first_name[1]}
                </HelperText>
            }
            <TextInput
                label="Last Name"
                style={styles.inputStyle}
                value={userDetails.last_name}
                onChangeText={handleUserChange('last_name')}
                error={errors.last_name[0]}
            />
            {
                errors.last_name[0] && 
                <HelperText 
                    type='error'
                    style={styles.helperText}
                >
                    {errors.last_name[1]}
                </HelperText>
            }
            <TextInput
                label="Email"
                style={styles.inputStyle}
                value={userDetails.email}
                onChangeText={handleUserChange('email')}
                error={errors.email[0]}
            />
            {
                errors.email[0] && 
                <HelperText 
                    type='error'
                    style={styles.helperText}
                >
                    {errors.email[1]}
                </HelperText>
            }
            <TextInput
                label="Password"
                secureTextEntry={sec}
                right={<TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={(e) => setSec(!sec)}/>}
                style={styles.inputStyle}
                value={userDetails.password}
                onChangeText={handleUserChange('password')}
                error={errors.password[0]}
            />
            {
                errors.password[0] && 
                <HelperText 
                    type='error'
                    style={styles.helperText}
                >
                    {errors.password[1]}
                </HelperText>
            }
            <TextInput
                label="Confirm Password"
                secureTextEntry={sec}
                right={<TextInput.Icon name={sec ? 'eye-off' : 'eye'} onPress={(e) => setSec(!sec)}/>}
                style={styles.inputStyle}
                value={userDetails.confpass}
                onChangeText={handleUserChange('confpass')}
                error={errors.confpass[0]}
            />
            {
                errors.confpass[0] && 
                <HelperText 
                    type='error'
                    style={styles.helperText}
                >
                    {errors.confpass[1]}
                </HelperText>
            }
            <TextInput
                label="Date of birth"
                right={
                    <TextInput.Icon 
                        name='calendar-month' 
                        onPress={(e) => {
                            setShowDate(true);
                        }}
                    />
                }
                style={styles.inputStyle}
                editable={false}
                value={date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getUTCFullYear()}
            />
            {/* <Menu
                visible={userDetails.country.length}
                anchor={ */}
                    <TextInput
                        label='Country'
                        style={styles.inputStyle}
                        value={userDetails.country}
                        onChangeText={handleUserChange('country')}
                        error={errors.country[0]}
                    />
                {/* }
            >
                {
                    countryList.filter(val => val.includes(userDetails.country)).slice(0, 3).map((val, index) => (
                        <Menu.Item key={index} title = {val} onPress={console.log}/>
                    ))
                }
            </Menu> */}
            <Caption style={{marginLeft: '5%', marginTop: 30}}>Gender</Caption>
            <RadioButton.Group 
                onValueChange={handleUserChange('gender')} 
                value={userDetails.gender}
            >
                <RadioButton.Item label="Male" value="Male" style={{...styles.inputStyle, marginBottom: 0}}/>
                <RadioButton.Item label="Female" value="Female" style={{...styles.inputStyle, marginBottom: 0}}/>
                <RadioButton.Item label="Other" value="Other" style={{...styles.inputStyle, marginBottom: 0}}/>
            </RadioButton.Group>
            {
                userDetails.gender === 'Other' && 
                <TextInput
                    label='Gender'
                    style={styles.inputStyle}
                    value={userDetails.gender}
                    onChangeText={handleUserChange('gender')}
                />
            }

            <Caption style={{alignSelf: 'center', marginVertical: 10}}>Select topics of interest</Caption>
            <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginHorizontal: 10
            }}>
            {
                Object.keys(personality).filter(val => personality[val]).map((val, index) => (
                    <Chip 
                        key={index} 
                        selected={true}
                        style={{margin: 10}}
                        onPress={() => handlePersonalityChange(val, !personality[val])}
                    >{val.split('_').join(' ')}</Chip>
                ))
            }
            {
                Object.keys(personality).filter(val => !personality[val]).map((val, index) => (
                    <Chip 
                        key={index} 
                        selected={false}
                        style={{margin: 10}}
                        onPress={() => handlePersonalityChange(val, !personality[val])}
                    >{val.split('_').join(' ')}</Chip>
                ))
            }
            </View>
            {
                loading
                ?
                <ActivityIndicator animating={true} color='white'/>
                :
                <Button 
                    mode='contained' 
                    style = {{alignSelf: 'center', width: '90%', marginTop: 30, marginBottom: 70}}
                    onPress={handleSubmit}
                >
                    Register
                </Button>
            }
            {
                showDate ?
                <DateTimePicker
                    value={date}
                    minimumDate={new Date('January 2, 1900')}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear()-13))}
                    mode='date'
                    onChange={(e, date) => {
                        setShowDate(false);
                        if (typeof date !== 'undefined')
                            setDate(date); 
                    }}
                />
                :
                null
            }
        </ScrollView>
        :
        <ActivityIndicator animating={true} size='large' style={{flex: 1, justifyContent: 'center', alignSelf: 'center'}}/>
    )
}