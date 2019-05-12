import React from 'react';
import {View, Text , ScrollView, Image} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';
import Colors from '../constants/Colors'
import I18n from '../language/i18n';

items=[
    {
        id:1, 
        name:'item1', 
        desc:'desc1', 
        img:'https://images-na.ssl-images-amazon.com/images/I/81b5agEMpUL._SY679_.jpg'
    },
    {
        id:2, 
        name:'item2', 
        desc:'desc2', 
        img:'https://images-na.ssl-images-amazon.com/images/I/81b5agEMpUL._SY679_.jpg'
    },
    {
        id:3, 
        name:'item3', 
        desc:'desc3', 
        img:'https://images-na.ssl-images-amazon.com/images/I/81b5agEMpUL._SY679_.jpg'
    },
    {
        id:4, 
        name:'item4', 
        desc:'desc4', 
        img:'https://images-na.ssl-images-amazon.com/images/I/81b5agEMpUL._SY679_.jpg'
    },
]
class SellScreen extends React.Component {

    componentWillMount() {
        //fetch all products selled by this user and put them in items array
    }
    render() {
        return(
            <View style={styles.mainContainer}>
                <View style={styles.topContainer}>
                    <Icon
                        type='material-community'
                        name='plus-circle'
                        size={35}
                        color={Colors.primary}
                        style={styles.IconStyle}
                        onPress={()=>{this.props.navigation.navigate('SellForm')}}
                    />
                    <Text style={styles.AddTitle}>
                        {I18n.t('SellScreen.add')}
                    </Text>
                </View>
                <ScrollView>
                    <View style={styles.productsContainer}>
                        {
                            items.map((item)=>{
                                return(
                                    <View key={item.id} style={styles.AvatarContainer}>
                                        <Avatar
                                            rounded
                                            size='xlarge'
                                            source={{uri:item.img}}
                                            
                                        />
                                        <Text style={styles.productTitle}>{item.name}</Text>
                                    </View>
                                )
                            })
                        }
                    </View>

                 </ScrollView>
            </View>
        );
    }
}
const styles={
    mainContainer:{
        backgroundColor:'white'
    },
    topContainer:{
        flexDirection:'row', 
        justifyContent:'flex-start', 
        padding:5,
        height:'20%' 
    }, 
    AddTitle:{
        color:Colors.primary, 
        fontSize:20, 
        fontWeight:'500', 
        margin:5
    }, 
    IconStyle:{
        margin:5
    }, 
    productsContainer:{
        flexDirection:'row', 
        justifyContent:'center', 
        height:'80%', 
        flexWrap:'wrap'
    },
    AvatarContainer:{
        width:'44%', 
        justifyContent:'center', 
        alignItems:'center', 
        padding:6, 
        backgroundColor:Colors.primary, 
        margin:8
    }, 
    productTitle:{
        fontSize:18, 
        fontWeight:'400', 
        color:Colors.secondary
    }
}
export default SellScreen;