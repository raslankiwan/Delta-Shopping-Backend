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

    componentDidMount = async () => {
        const user = await AsyncStorage.getItem('user')
        console.log('user: ', user)
        if (user) {
            this.props.navigation.navigate('Home')
        }
    }

    logIn = async () => {
        let email = this.state.email
        let password = this.state.password
        if (email === '') {
            this.setState({emailErr: true})
        } else if (password === '') {
            this.setState({passwordErr: true})
        } else {
            let url = await AsyncStorage.getItem('url_g') + '/auth'
            let body = {
                email, password
            }
            console.log(email, password)

            fetch(url, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
            })
            .then(response => response.json())
            .then(async json => { 
                console.log(json)
                if (json.status === 'success') {
                    await AsyncStorage.setItem('user', JSON.stringify({email, password}));
                    // to clear localStorage.clear()
                    this.props.navigation.navigate('Home')
                } else {
                    this.setState({authErr: true})
                }
            })
            .catch(error => console.error(error));
            
        }
        
    }

    render() {
        return(
            <View >
                
                <View  style={{marginRight:60}}>
                        {this.state.emailErr ? <Text>Please type a valid email</Text> : null }
                        <TextInput type="email" placeholder="Enter E-mail" value={this.state.email} onChangeText={(text) => {
                            this.setState({email: text, emailErr:''})}
                        } />

                        {this.state.passwordErr ? <Text>Please type a password</Text> : null }
                        <TextInput secureTextEntry type="password" placeholder="Enter Password" value={this.state.password} onChangeText={(text) => {
                            this.setState({password: text, passwordErr:''})}
                        }/>

                        {this.state.authErr ? <Text>Authentication failed</Text> : null }
                        <Button title="Login"  onPress={()=>this.logIn()}/>
                </View>

                <View>
                        <Text>Or: load products from local storage</Text>
                        <Button title="Use local storage"  onPress={()=>this.props.navigation.navigate('LocalData')}/>
                </View>
            </View>
        );
    }
}