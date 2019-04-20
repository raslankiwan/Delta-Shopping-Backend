import React from 'react';
import firebase from 'firebase';
import { Text, TouchableWithoutFeedback, View, Image } from 'react-native';
import { connect } from 'react-redux';
import { emailChanged, passwordChanged, loginUser } from '../actions';
import { Spinner} from '../components/common';
import {Button, Input, Divider, Avatar} from 'react-native-elements'
import COLOR from '../constants/Colors'

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
            <Button
            raised
            title='Login'
            titleStyle={styles.btnText}
            buttonStyle={styles.btnStyle}
            containerStyle={styles.btnContainer}
          
           />
            );
        }
    
    } else if (!(emailError === '' &&
        passwordError === '')) {
        return (
              <Button
              raised
              title='Login'
              titleStyle={styles.btnText}
              buttonStyle={styles.btnStyle}
              containerStyle={styles.btnContainer}
            
          />
                   
        );
    } else {
        return (
          <Button
              raised
              title='Login'
              titleStyle={styles.btnText}
              buttonStyle={styles.btnStyle}
              containerStyle={styles.btnContainer}
            />
        );
    }
  }


 
  render() {
    return (
     
      <View style={styles.Wrapper}>
        <View style={styles.headerStyle}>
         <Image source={require('../assets/images/header.png')} />
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formStyle}>
            <Input
              placeholder="user@gmail.com"
              onChangeText={this.onEmailChange.bind(this)}
              value= { this.props.email }
              inputContainerStyle={{borderBottomWidth: 0}}
              rightIcon={{ type: 'material-community', name:'account', color:'#ceb7b7' }}
            />
          </View>
          <View style={styles.formStyle}>
            <Input
              placeholder = "Password"
              secureTextEntry = {true}
              inputContainerStyle={{borderBottomWidth: 0}}
              onChangeText= {this.onPasswordChange.bind(this) }
              value = {this.props.password}
              rightIcon={{ type: 'material-community', name:'lock', color:'#ceb7b7' }}
            
              />
          </View>
         {this.state.passwordError !== ''?
            (<View>
                <Text style={styles.errorTextStyle}>
                {this.state.passwordError}
                </Text>
            </View>):null 
          }
           {this.state.emailError !== ''?
            (<View>
                <Text style={styles.errorTextStyle}>
                {this.state.emailError}
                </Text>
            </View>):null 
          }
         {this.renderButton()}
          <TouchableWithoutFeedback onPress={this.onRegisterPress.bind(this)}>
            <Text style={{color:'#f1e4e4', margin:20, fontSize:14, }}>Create account?</Text>
          </TouchableWithoutFeedback>
        </View>
        {/* <Divider style={{width:'80%', height:1, backgroundColor:'#35234b'}} /> */}
        <View style={styles.SignUp}>
          
          <View style={{flexDirection:'column', justifyContent:'center'}}>
            <Text style={{color:'#f1e4e4', fontSize:14, margin:8}}>OR Login with: </Text>
            <Avatar
            rounded
            size='medium'
            icon={{type: 'material-community', name:'facebook', color:COLOR.primary}}
            overlayContainerStyle={{backgroundColor:'#f1e4e4', margin:8}}
            />
           </View>
        </View>


      </View>
    );
  }
}

const styles = {
  Wrapper:{
    justifyContent:'center', 
    alignItems:'center', 
    felx:1, 
    height:'100%', 
    backgroundColor:COLOR.primary
  },
  errorTextStyle: {
      fontSize: 15,
      alignSelf: 'center',
      color: '#ff8484'
  }, 
  headerStyle:{
    height:'30%', 
    justifyContent:'flex-start', 
    alignItems:'center', 
    paddingTop:30,
    marginTop:30
  },
  formStyle:{
    flexDirection: 'row-reverse',
    backgroundColor:'#f1e4e4',
    marginBottom: 5,
    marginHorizontal: 16,
    padding:5, 
    width:'80%', 
    borderRadius:8
  }, 
  formContainer:{
    marginTop:0, 
    height:'25%', 
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
  SignUp:{
    marginTop:0, 
    height:'30%', 
    alignItems:'flex-start', 
    width:'90%', 
    padding:20
  }

};



const mapStateToProps = ({auth}) => {
  const { email, password, error, loading, shouldRedirect } = auth;

  return { email, password, error, loading, shouldRedirect };
};

export default connect(mapStateToProps, {emailChanged, passwordChanged, loginUser})(LoginScreen);
