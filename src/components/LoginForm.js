import React from 'react'
import { View, TextInput, Text, Image, Button, AsyncStorage } from 'react-native'
// import '../App.css'
// import logo from '../logo2.png'
// import { black } from 'ansi-colors';

export default class LoginForm extends React.Component {
    state = {
        email: '',
        password: '', 
        emailErr: false,
        passwordErr: false,
        authErr: false,

    }

    logIn = async () => {
        this.props.navigation.navigate('Home')
        // const { email, password } = this.state
        // if (email === '') {
        //     this.setState({emailErr: true})
        // } else if (password === '') {
        //     this.setState({passwordErr: true})
        // } else {
        //     let url = AsyncStorage.getItem('url_g') + '/auth'
        //     let body = {
        //         email, password
        //     }

        //     fetch(url, {
        //         method: 'POST',
        //         body: JSON.stringify(body),
        //         headers: new Headers({
        //             'Content-Type': 'application/json'
        //         }),
        //     })
        //     .then(response => response.json())
        //     .then(json => { 
        //         if (json.status === 'success') {
        //             localStorage.setItem('user', JSON.stringify({email, password}));
        //             // to clear localStorage.clear()
        //             let path = `/home`
        //             this.props.history.push(path);
        //         } else {
        //             this.setState({authErr: true})
        //         }
        //     })
        //     .catch(error => console.error(error));
            
        // }
        
    }

    render() {
        return(
            <View >
                
                <View  style={{marginRight:60}}>
                        {this.state.emailErr ? <Text>Please type a valid email</Text> : null }
                        <TextInput type="email" placeholder="Enter E-mail" value={this.state.email} onChange={(text) => {
                            this.setState({email: text, emailErr:''})}
                        } />

                        {this.state.passwordErr ? <Text>Please type a password</Text> : null }
                        <TextInput secureTextEntry type="password" placeholder="Enter Password" value={this.state.password} onChange={(text) => {
                            this.setState({password: text, passwordErr:''})}
                        }/>

                        {this.state.authErr ? <Text>Authentication failed</Text> : null }
                        <Button title="Login"  onPress={()=>this.props.navigation.navigate('Add')}/>
                </View>
            </View>
        );
    }
}