import React from 'react';
import { Text, TouchableWithoutFeedback } from 'react-native';
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
import { Button, Spinner, Card, CardSection, Input, Header } from '../components/common';


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
            <CardSection>
                <Button  onPress={this.onButtonPress.bind(this)}>
                    Sign Up
                </Button>
            </CardSection>
            );
        }
    
    } else {
        return (
            <CardSection style={{flexDirection: 'column'}}>
                <Text style={styles.errorTextStyle}>Please fill the required fields</Text>
                <Button >
                    Sign Up
                </Button>
            </CardSection>
        );
    }

    
  }

  renderEmailError() {
    if(this.state.emailError !== '') {
      return (
        <CardSection>
          <Text style={styles.errorTextStyle}>{this.state.emailError}</Text>
        </CardSection>
      );
    }
  }

  renderNameError() {
    if(this.state.nameError !== '') {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.nameError}</Text>
            </CardSection>
        );
    }
  }

  renderPasswordError() {
      if(this.state.passwordError !== '' ) {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.passwordError}</Text>
            </CardSection>
        );
      }
  }

  renderStreetError() {
      if(this.state.streetError !== '') {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.streetError}</Text>
            </CardSection>
        );
      }
  }

  renderCityError() {
    if(this.state.cityError !== '') {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.cityError}</Text>
            </CardSection>
        );
      }
  }

  renderZipError() {
    if(this.state.zipError !== '') {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.zipError}</Text>
            </CardSection>
        );
      }
  }

  renderPhoneError() {
    if(this.state.phoneError !== '') {
        return(
            <CardSection>
                <Text style={styles.errorTextStyle}>{this.state.phoneError}</Text>
            </CardSection>
        );
      }
  }

  render() {
    return (
     
      <Card>
        <CardSection>
          <Header headerText="Register"></Header>
        </CardSection>
        
        <CardSection>
            <Input
                label="Name"
                placeholder="FirstName LastName"
                onChangeText={this.onNameChange.bind(this)}
                value= { this.props.name }
            />
        </CardSection>

        {this.renderNameError()}

        <CardSection>
          <Input
            placeholder="user@gmail.com"
            label="Email"
            onChangeText={this.onEmailChange.bind(this)}
            value= { this.props.email }
          />
        </CardSection>
        
        {this.renderEmailError()}

        <CardSection>
          <Input
            placeholder = "Password"
            label = "Password"
            secureTextEntry = {true}
            onChangeText= {this.onPasswordChange.bind(this) }
            value = {this.props.password}
          />
        </CardSection>

        {this.renderPasswordError()}

        <CardSection>
            <Text style={styles.selectCountryStyle}>Select Country</Text>
            <CountryPicker 
                onChange={(val) => this.selectCountryChange(val)}
                cca2= {this.state.cca2}
            />
        </CardSection>    

        <CardSection>
            <Input
                label="Street"
                onChangeText={this.onStreetChange.bind(this)}
                value= { this.props.street }
            />
        </CardSection>

        {this.renderStreetError()}

        <CardSection>
            <Input
                onChangeText={this.onCityChange.bind(this)}
                value= { this.props.city }
                label="City"
            />
        </CardSection>

        {this.renderCityError()}

        <CardSection>
            <Input
                label="Zip Code"
                onChangeText={this.onZipChange.bind(this)}
                value= { this.props.zip }
            />
        </CardSection>

        {this.renderZipError()}

        <CardSection>
            <Input
                label="Phone"
                onChangeText={this.onPhoneChange.bind(this)}
                value= { this.props.phone }
            />
        </CardSection>

        {this.renderPhoneError()}
        
        <Text style={styles.errorTextStyle}>
          {this.props.error}
        </Text>

        {this.renderButton()}

      </Card>
    );
  }
}

const styles = {
  errorTextStyle: {
      fontSize: 20,
      alignSelf: 'center',
      color: 'red'
  }, 
  selectCountryStyle: {
      fontSize: 18,
      alignSelf: 'center',
      paddingRight: 25,
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
