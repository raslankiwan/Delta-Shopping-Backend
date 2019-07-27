import React from 'react'
import { View, Text, TextInput, Button, Image, AsyncStorage, TouchableOpacity } from 'react-native'
import { postRequest } from '../requestFetch'
import { ScrollView,  } from 'react-native-gesture-handler';

class LocalData extends React.Component {

    static navigationOptions = ({ navigation, navigationOptions }) => {
        return ({
          title: 'Local',
          headerRight:  <Button
                            title ="Add"
                            onPress={()=>{navigation.navigate('Add')}}
                        />,
          headerLeft:  <Button
                            title ="Logout"
                            onPress={async ()  =>{
                                await AsyncStorage.removeItem('user')
                                navigation.navigate('Login')
                            }}
                        />
      });
    }

    constructor() {
        super()
        this.state = {
            name: '',
            id: '',
            desc: '',
            prod: '',
            exp: '',
            addErr: '',
            available: '',
            products: [],
        }

    }

    componentDidMount = async () => {
       
        let products =  await AsyncStorage.getItem('products', products)
        if(products !== null) {
            this.setState({products})
        }
    }



    render() {
        return(
            this.state.products && this.state.products.length === 0 ? 
            <Text>No items available</Text>
            :
            <ScrollView>
                <View>                
                    { this.state.products && this.state.products.map((item) => {
                    
                        return (
                            
                            <View>
                                <TouchableOpacity onPress= {() => {this.onItemClicked(item)}}>
                                    <View>
                                        <Text>ProductID:</Text>
                                        <Text>Name:</Text> 
                                        <Text>Description:</Text>
                                        <Text>Production:</Text>
                                        <Text>Expiration:</Text>
                                        <Text>Available:</Text>
                                    </View>
                                    <View key={item.ID}>
                                        <TextInput type="number" value={item.ID} onChangeText={(text) => {
                                                item.ID = text
                                                this.setState({id: text})
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Name} onChangeText={(text) => {
                                                item.Name = text
                                                this.setState({name: text})
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Description} onChangeText={(text) => {
                                                item.Description = text
                                                this.setState({desc: text})
                                            }
                                        }></TextInput>

                                        <TextInput type="date" value={item.Production} onChangeText={(text) => {
                                                item.Production = text
                                                this.setState({prod: text})
                                            }
                                        }></TextInput>

                                        <TextInput type="date" value={item.Expiration} onChangeText={(text) => {
                                                item.Expiration= text
                                                this.setState({exp: text})
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Available} onChangeText={(text) => {
                                                item.Available= text
                                                this.setState({available: text})
                                            }
                                        }></TextInput>
                                    </View>
                                    <View onPress= {() => {this.onItemClicked(item)}}>
                                        <Image style={{width: 200, height:130}} source={{uri:"http://localhost:8080/load_image?src="+item.image}}/>
                                    </View>
                                </TouchableOpacity>    
                                <View >                            
                                    <Button style={{marginRight:10}} onPress={()=> this.delete(item.ID)}  title="Delete" /> 
                                    <Button onPress={()=> this.update(currentItem)} title="Update"/>
                                </View> 
                            </View>                   
                        )
                    })}
                </View>
            </ScrollView>
        );
    }
}

export default LocalData;