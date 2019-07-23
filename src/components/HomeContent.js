import React from 'react'
import { View, Text, TextInput, Button, Image } from 'react-native'
import { postRequest } from '../requestFetch'

class HomeContent extends React.Component {

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

        this.onSuccess = this.onSuccess.bind(this)
        this.onDeleteSuccess = this.onDeleteSuccess.bind(this)
        this.onFail = this.onFail.bind(this)
    }

    componentDidMount() {
        // let url_g = localStorage.getItem('url_g')
        // var url = `${url_g}/get_item`
        // postRequest(url, null, 'GET', this.onSuccess, this.onFail)
    }

    onSuccess(json) {
        
        this.setState({products: json.data})
    }

    onUpdateSuccess() {
        let path = `/home`
        this.props.history.push(path);
    }

    onDeleteSuccess(json) {
        let url_g = localStorage.getItem('url_g')
        var url = `${url_g}/get_item`
        postRequest(url, null, 'GET', this.onSuccess, this.onFail)
    }

    onFail(json) {

    }

    delete(dID) {
        let url_g = localStorage.getItem('url_g')
        var url = `${url_g}/delete_item/${dID}`;
        postRequest(url, null, 'DELETE', this.onDeleteSuccess, this.onFail)
    }

    update(item) {
        const { name, desc, exp, prod, id, available } = item
        var jsonObj = {
            name, desc, exp, prod, available
        }
        let url_g = localStorage.getItem('url_g')
        var url = `${url_g}/post_item/${id}`;
        postRequest(url, jsonObj, 'POST', this.onUpdateSuccess, this.onFail)
    }

    onItemClicked(item) {

        this.props.history.push({
            pathname: '/Add',
            state : {item}
        });
    }

    render() {
        return(
            this.state.products && this.state.products.length === 0 ? 
            <Text>No items available</Text>
            :
            <View>                
                { this.state.products && this.state.products.map((item) => {
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
                            <View>
                                <View onPress= {() => {this.onItemClicked(item)}}>
                                    <Text>ProductID:</Text>
                                    <Text>Name:</Text> 
                                    <Text>Description:</Text>
                                    <Text>Production:</Text>
                                    <Text>Expiration:</Text>
                                    <Text>Available:</Text>
                                </View>
                                <View key={item.ID}>
                                    <TextInput type="number" value={item.ID} onChange={(text) => {
                                            item.ID = text
                                            this.setState({id: text})
                                            currentItem.id = text
                                        }
                                    }></TextInput>

                                    <TextInput type="text" value={item.Name} onChange={(text) => {
                                            item.Name = text
                                            this.setState({name: text})
                                            currentItem.name = text
                                        }
                                    }></TextInput>

                                    <TextInput type="text" value={item.Description} onChange={(text) => {
                                            item.Description = text
                                            this.setState({desc: text})
                                            currentItem.desc = text
                                        }
                                    }></TextInput>

                                    <TextInput type="date" value={item.Production} onChange={(text) => {
                                            item.Production = text
                                            this.setState({prod: text})
                                            currentItem.prod = text
                                        }
                                    }></TextInput>

                                    <TextInput type="date" value={item.Expiration} onChange={(text) => {
                                            item.Expiration= text
                                            this.setState({exp: text})
                                            currentItem.exp = text
                                        }
                                    }></TextInput>

                                    <TextInput type="text" value={item.Available} onChange={(text) => {
                                            item.Available= text
                                            this.setState({available: text})
                                            currentItem.available = text
                                        }
                                    }></TextInput>
                                </View>
                                <View onPress= {() => {this.onItemClicked(item)}}>
                                    <Image style={{width: 200, height:130}} source={{uri:"http://localhost:8080/load_image?src="+item.image}}/>
                                </View>
                            </View>    
                            <View >                            
                                <Button style={{marginRight:10}} onPress={()=> this.delete(item.ID)}> Delete </Button> 
                                <Button onPress={()=> this.update(currentItem)}> Update </Button>
                            </View> 
                        </View>                   
                    )
                })}
            </View>
        );
    }
}

export default HomeContent;