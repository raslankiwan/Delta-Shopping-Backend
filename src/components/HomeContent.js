import React from 'react'
import { View, Text, TextInput, Button, Image, AsyncStorage, TouchableOpacity } from 'react-native'
import { postRequest } from '../requestFetch'
import { ScrollView,  } from 'react-native-gesture-handler';

class HomeContent extends React.Component {

    static navigationOptions = ({ navigation, navigationOptions }) => {
        return ({
          title: 'Home',
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
            url_g: '',
            products: [],
        }

        this.onSuccess = this.onSuccess.bind(this)
        this.onDeleteSuccess = this.onDeleteSuccess.bind(this)
        this.onFail = this.onFail.bind(this)
    }

    componentDidMount = async () => {
        let url_g = await AsyncStorage.getItem('url_g')
        this.setState({url_g})
        var url = `${url_g}/get_item`
        postRequest(url, null, 'GET', this.onSuccess, this.onFail)
    }

    async onSuccess(json) {
        this.setState({products: json.data})
        await AsyncStorage.setItem('products', products)
    }

    onUpdateSuccess() {
        this.props.navigation.navigate('Home');s
    }

    onDeleteSuccess = async (json) => {
        let url_g = await AsyncStorage.getItem('url_g')
        var url = `${url_g}/get_item`
        postRequest(url, null, 'GET', this.onSuccess, this.onFail)
    }

    onFail(json) {

    }

    delete = async (dID) => {
        let url_g = await AsyncStorage.getItem('url_g')
        var url = `${url_g}/delete_item/${dID}`;
        postRequest(url, null, 'DELETE', this.onDeleteSuccess, this.onFail)
    }

    update = async (item) => {
        
        
        const { name, desc, exp, prod, id, available } = item
        var jsonObj = {
            name, desc, exp, prod, available
        }
        let url_g = await AsyncStorage.getItem('url_g')
        var url = `${url_g}/post_item/${id}`;
        postRequest(url, jsonObj, 'POST', this.onUpdateSuccess, this.onFail)
    }

    onItemClicked(item) {
        this.props.navigation.navigate('Add', {item});
    }

    render() {
        return(
            this.state.products && this.state.products.length === 0 ? 
            <Text>No items available</Text>
            :
            <ScrollView>
                <View>                
                    { this.state.products && this.state.products.map((item) => {

                        console.log(item)

                    let currentItem = {
                            id:item.ID,
                            name: item.Name,
                            desc: item.Description,
                            prod: item.Production,
                            exp: item.Expiration,
                            available: item.Available
                        }
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
                                                currentItem.id = text
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Name} onChangeText={(text) => {
                                                item.Name = text
                                                this.setState({name: text})
                                                currentItem.name = text
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Description} onChangeText={(text) => {
                                                item.Description = text
                                                this.setState({desc: text})
                                                currentItem.desc = text
                                            }
                                        }></TextInput>

                                        <TextInput type="date" value={item.Production} onChangeText={(text) => {
                                                item.Production = text
                                                this.setState({prod: text})
                                                currentItem.prod = text
                                            }
                                        }></TextInput>

                                        <TextInput type="date" value={item.Expiration} onChangeText={(text) => {
                                                item.Expiration= text
                                                this.setState({exp: text})
                                                currentItem.exp = text
                                            }
                                        }></TextInput>

                                        <TextInput type="text" value={item.Available} onChangeText={(text) => {
                                                item.Available= text
                                                this.setState({available: text})
                                                currentItem.available = text
                                            }
                                        }></TextInput>
                                    </View>
                                    <View onPress= {() => {this.onItemClicked(item)}}>
                                        <Image style={{width: 200, height:130}} source={{uri:`${this.state.url_g}/load_image?src=${item.image}`}}/>
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

export default HomeContent;