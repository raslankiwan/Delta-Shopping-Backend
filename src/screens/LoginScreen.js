import React from 'react';
import firebase from 'firebase';
import { Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { emailChanged, passwordChanged, loginUser } from '../actions';
import { Button, Spinner, Card, CardSection, Input, Header } from '../components/common';


class LoginScreen extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldRedirect) {
      this.props.navigation.navigate('Main');  
    }
  }

  state = { 
    emailError: '',
    passwordError: '',
  };

  static navigationOptions = {
    title: 'Login',
  };
  onEmailChange(text) {
    
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
    if(reg.test(text)) {
      this.setState({emailError: '', submit: true });
    } else if (text.length < 1) {
      this.setState({emailError: 'This field cannot be empty !!'});
    } else {
      this.setState({emailError: 'Invalid Email !!'});
    }

  this.props.emailChanged(text);
  }

  onPasswordChange(text) {
    if (text.length !== 0){
      this.setState({ passwordError: '' });
    } else {
      this.setState({ passwordError: 'This field cannot be empty !!'})
    }
    this.props.passwordChanged(text);
  }

  onButtonPress() {
    
    this.props.loginUser(this.props);
  }

  onRegisterPress() {
    this.props.navigation.navigate('Register');

  }

  renderButton() {
    const { emailError, passwordError, submit} = this.state;

    if( emailError === '' &&
        passwordError === '' ) {

        if(this.props.loading) {
            return <Spinner size="large" />;
        } else {
            return (
            <CardSection>
                <Button  onPress={this.onButtonPress.bind(this)}>
                    Login
                </Button>
            </CardSection>
            );
        }
    
    } else if (!(emailError === '' &&
        passwordError === '')) {
        return (
            <CardSection style={{flexDirection: 'column'}}>
                <Text style={styles.errorTextStyle}>Please fill the required fields</Text>
                <Button >
                    Login
                </Button>
            </CardSection>
        );
    } else {
        return (
          <CardSection>
              <Button >
                 Login
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

  renderPasswordError() {
    if (this.state.passwordError !== '') {
      return (
        <CardSection>
          <Text style={styles.errorTextStyle}>{this.state.passwordError}</Text>
        </CardSection>
      ); 
    }
  }
 
  render() {
    return (
     
      <Card>
        <CardSection>
          <Header headerText="Login"></Header>
        </CardSection>
        
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

        <Text style={styles.errorTextStyle}>
          {this.props.error}
        </Text>

        {this.renderButton()}

        <CardSection>
          <TouchableWithoutFeedback onPress={this.onRegisterPress.bind(this)}>
            <Text>Create account?</Text>
          </TouchableWithoutFeedback>
        </CardSection>

      </Card>
    );
  }
}

const styles = {
  errorTextStyle: {
      fontSize: 20,
      alignSelf: 'center',
      color: 'red'
  }
};



const mapStateToProps = ({auth}) => {
  const { email, password, error, loading, shouldRedirect } = auth;

  return { email, password, error, loading, shouldRedirect };
};

export default connect(mapStateToProps, {emailChanged, passwordChanged, loginUser})(LoginScreen);
