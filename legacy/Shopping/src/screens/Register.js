import React from 'react';
import { connect } from 'react-redux';
import CountryPicker, {
    getAllCountries
  } from 'react-native-country-picker-modal'
import { 
    emailChanged,
    passwordChanged, 
    nameChanged, 
    phoneChanged, 
    zipChanged, 
    streetChanged,
    cityChanged,
    countryChanged,
    signUpUser 
} from '../actions';
import {  Spinner, CardSection,  Header } from '../components/common';
import {View, Text,ScrollView} from 'react-native';
import {Card, Button , Input} from 'react-native-elements';
import COLOR from '../constants/Colors';

import KeyboardSpacer from 'react-native-keyboard-spacer';

class Register extends React.Component {
  state = {
      cca2: 'PS',
      emailError: '',
      passwordError: '',
      cityError: '',
      phoneError: '',
      zipError: '',
      streetError: '',
      nameError: '',
      phoneError: '',
      submit: false
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldRedirect) {
        this.props.navigation.navigate('Login');  
    }
  }
    
  static navigationOptions = {
    title: 'Login',
  };

  onEmailChange(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
    if (reg.test(text)) {
      this.setState({emailError: '' });
    } else {
      this.setState({emailError: 'Invalid Email !!', submit:true});
    }
    this.props.emailChanged(text);
  }

  onPasswordChange(text) {
    if (text.length < 6) {
        this.setState({ passwordError: 'Password at least 6 characters !!'});
    } else {
        this.setState({ passwordError: '' });
    }
    this.props.passwordChanged(text);
  }

  onNameChange(text) {
    if (text.length < 4) {
        this.setState({ nameError: 'Name must be at least 4 chars !!'});
    } else {
        this.setState({ nameError: ''});
    }
    this.props.nameChanged(text)
  }

  onStreetChange(text) {
    if (text.length < 1) {
        this.setState({ streetError: 'Street cannot be empty !!'});
    } else {
        this.setState({ streetError: ''});
    }
    this.props.streetChanged(text)
  }

  onCityChange(text) {
    if (text.length < 1) {
        this.setState({ cityError: 'City cannot be empty !!' });
    } else if (/\d/.test(text)) {
        this.setState({ cityError: 'Invalid city name' });
    } else {
        this.setState({ cityError: '' });
    }
    this.props.cityChanged(text)
  }

  onPhoneChange(text) {
    if (text.length < 1 ) {
        this.setState({ phoneError: 'Phone code cannot be empty !!' });
    } else if (text.length > 10) {
        this.setState({ phoneError: 'Invalid phone code !!' });
    } else if (!/\d/.test(text)) {
        this.setState({ phoneError: 'Invalid phone code' });
    } else {
        this.setState({ phoneError: '' });
    }
    this.props.phoneChanged(text)
  }

  onZipChange(text) {
    if (text.length < 1 ) {
        this.setState({ zipError: 'Zip code cannot be empty !!' });
    } else if (text.length > 5) {
        this.setState({ zipError: 'Invalid zip code !!' });
    } else if (!/\d/.test(text)) {
        this.setState({ zipError: 'Invalid zip code' });
    } else {
        this.setState({ zipError: '' });
    }
    this.props.zipChanged(text)
  }


  onButtonPress() {
    const { email, password, name, zip, phone, country, street, city } = this.props;
  
    this.props.signUpUser({ email, password, name, zip, phone, country, street, city });
    
  }

  selectCountryChange(val) {
    this.props.countryChanged(val.name);
    this.setState({cca2:val.cca2});
    //val.name to retrieve country name

  }

  renderButton() {

    const { emailError, nameError, passwordError, cityError, streetError, phoneError, zipError, submit } = this.state;

    if( emailError === '' &&
        nameError === '' &&
        passwordError === '' &&
        cityError === '' &&
        streetError === '' &&
        phoneError === '' &&
        zipError === '' && submit ) {

        if(this.props.loading) {
            return <Spinner size="large" />;
        } else {
            return (
                <Button 
                title='Sign Up' 
                raised
                titleStyle={styles.btnText}
                buttonStyle={styles.btnStyle}
                onPress={this.onButtonPress.bind(this)}
                />
                
            );
        }
   
      } else {
        return (
          <Button 
            title='Sign Up' 
            raised
            titleStyle={styles.btnText}
            buttonStyle={styles.btnStyle}
            onPress={this.onButtonPress.bind(this)}
            />
        );
    }
  }
  renderEmailError() {
    if(this.state.emailError !== '') {
      return (
      
          <Text style={styles.errorTextStyle}>{this.state.emailError}</Text>
       
      );
    }
  }

  renderNameError() {
    if(this.state.nameError !== '') {
        return(
                <Text style={styles.errorTextStyle}>{this.state.nameError}</Text>
        
        );
    }
  }

  renderPasswordError() {
      if(this.state.passwordError !== '' ) {
        return(
            
                <Text style={styles.errorTextStyle}>{this.state.passwordError}</Text>
           
        );
      }
  }

  renderStreetError() {
      if(this.state.streetError !== '') {
        return(
                <Text style={styles.errorTextStyle}>{this.state.streetError}</Text>
         
        );
      }
  }

  renderCityError() {
    if(this.state.cityError !== '') {
        return(
                <Text style={styles.errorTextStyle}>{this.state.cityError}</Text>
        
        );
      }
  }

  renderZipError() {
    if(this.state.zipError !== '') {
        return(
                <Text style={styles.errorTextStyle}>{this.state.zipError}</Text>
          
        );
      }
  }

  renderPhoneError() {
    if(this.state.phoneError !== '') {
        return(
                <Text style={styles.errorTextStyle}>{this.state.phoneError}</Text>
            
        );
      }
  }

  render() {
    return (
      <View style={styles.Wrapper}>
     <ScrollView >
     <View style={styles.formContainer}>
        <View style={styles.formStyle}>
            <Input
                placeholder="FullName"
                onChangeText={this.onNameChange.bind(this)}
                value= { this.props.name }
                inputContainerStyle={{borderBottomWidth: 0}}
            />
        </View>

        {this.renderNameError()}

        <View style={styles.formStyle}>
          <Input
            placeholder="user@gmail.com"
            onChangeText={this.onEmailChange.bind(this)}
            value= { this.props.email }
            inputContainerStyle={{borderBottomWidth: 0}}
          />
        </View>
        
        {this.renderEmailError()}

        <View style={styles.formStyle}>
          <Input
            placeholder = "Password"
            secureTextEntry = {true}
            onChangeText= {this.onPasswordChange.bind(this) }
            value = {this.props.password}
            inputContainerStyle={{borderBottomWidth: 0}}
          />
        </View>

        {this.renderPasswordError()}

        <View style={styles.contryStyle}>
            <Text style={styles.selectCountryStyle}>Select Country</Text>
            <CountryPicker 
                onChange={(val) => this.selectCountryChange(val)}
                cca2= {this.state.cca2}
            />
        </View>    

        <View style={styles.formStyle}>
            <Input
                placeholder="Street"
                onChangeText={this.onStreetChange.bind(this)}
                value= { this.props.street }
                inputContainerStyle={{borderBottomWidth: 0}}
            />
        </View>

        {this.renderStreetError()}

        <View style={styles.formStyle}>
            <Input
                onChangeText={this.onCityChange.bind(this)}
                value= { this.props.city }
                placeholder="City"
                inputContainerStyle={{borderBottomWidth: 0}}
            />
        </View>

        {this.renderCityError()}

        <View style={styles.formStyle}>
            <Input
                placeholder="Zip Code"
                onChangeText={this.onZipChange.bind(this)}
                value= { this.props.zip }
                inputContainerStyle={{borderBottomWidth: 0}}
            />
        </View>

        {this.renderZipError()}

        <View style={styles.formStyle}>
            <Input
                placeholder="Phone"
                onChangeText={this.onPhoneChange.bind(this)}
                value= { this.props.phone }
                inputContainerStyle={{borderBottomWidth: 0}}
            />
        </View>

        {this.renderPhoneError()}
        
        {/* <Text style={styles.errorTextStyle}>
          {this.props.error}
        </Text> */}

          <View style={styles.btnContainer}>
             {this.renderButton()}
          </View>
        </View>
        <KeyboardSpacer />
        </ScrollView>
        </View>
    );
  }
}

const styles = {
  errorTextStyle: {
      fontSize: 20,
      alignSelf: 'center',
      color: '#ff8484'
  }, 
  selectCountryStyle: {
      fontSize: 18,
      alignSelf: 'center',
      paddingRight: 25,
  }, 
  formStyle:{
    flexDirection: 'row-reverse',
    backgroundColor:'#f1e4e4',
    marginBottom: 5,
    marginHorizontal: 16,
    padding:5, 
    width:'90%', 
    borderRadius:8
  }, 
  Wrapper:{
    justifyContent:'center', 
    alignItems:'center', 
    felx:1, 
    height:'100%', 
    backgroundColor:COLOR.primary, 
  
  },
  formContainer:{
    marginTop:20, 
  }, 
  btnStyle:{
    backgroundColor:COLOR.secondary,
    width:'100%',
    borderRadius:10,
    borderColor:COLOR.secondary,
    borderWidth:1 
  }, 
  btnContainer:{
    backgroundColor:COLOR.secondary,
    marginHorizontal:15,
    borderRadius:10,
    borderColor:COLOR.secondary,
    borderWidth:1
  }, 
  btnText:{
    textAlign:'center', 
    fontSize:20, 
    fontWeight:'500', 
    color:'#f1e4e4'
  }, 
  contryStyle:{
    backgroundColor:'#f1e4e4',
    marginBottom: 5,
    marginHorizontal: 16,
    padding:5, 
    width:'90%', 
    borderRadius:8, 
    flexDirection:'row', 
  }
};

const mapStateToProps = ({auth}) => {
  const { email, password, name, phone, error, loading, shouldRedirect, zip, country, street, city } = auth;

  return { email, password, error, name, phone, loading, shouldRedirect, zip, country, street, city };
};

export default connect(mapStateToProps, {
    emailChanged, 
    passwordChanged, 
    nameChanged,    
    phoneChanged, 
    zipChanged, 
    streetChanged,
    cityChanged, 
    countryChanged,
    signUpUser
})(Register);
