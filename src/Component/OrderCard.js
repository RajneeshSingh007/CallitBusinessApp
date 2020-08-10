import React from "react";
import {Platform,StyleSheet } from "react-native";
import { NavigationBar, Subtitle, View } from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import { Card} from 'react-native-paper';
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';
import Lodash from 'lodash';

export default class OrderCard extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    componentDidMount()
    {

    }

    render()
    {
        const { item, onClick } = this.props;
        return(
            <View
                style={styles.container}>
                <Card
                    style={styles.card}
                    onPress={onClick}>
                <View
                    style={{
                    flexDirection: 'column',
                    marginTop: 8,
                    marginHorizontal: sizeWidth(2.5),
                    marginBottom: sizeWidth(1),
                    }}>
                    <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'column', flex: 1}}>
                        {item.data !== null && item.data !== undefined
                        ? item.data.map((ele, index) => {
                            return index < 3 ? (
                                <Subtitle
                                styleName="bold"
                                style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 15,
                                    alignSelf: 'flex-start',
                                    fontWeight: 'bold',
                                }}>
                                {`${Lodash.capitalize(ele.serviceName)}  ${
                                    ele.quantity
                                }x`}
                                </Subtitle>
                            ) : null;
                            })
                        : null}
                    </View>
                    <Subtitle
                        style={styles.priceStyle}>{`₪${Helper.getCombinedprice(
                        item.totalPrice,
                        item.deliveryprice,
                    )}`}</Subtitle>
                    </View>
                    <View
                    style={{flexDirection: 'column', marginTop: sizeHeight(0.4)}}>
                    <Subtitle
                        style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                        }}>{`${item.name}`}</Subtitle>
                    <Subtitle
                        style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                        }}>{`פלאפון: ${item.customertelephone}`}</Subtitle>
                    {item.address !== '' || item.isdelivery === 1 ? (
                        <Subtitle
                        style={{
                            color: '#6DC124',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 15,
                        }}>
                        {`כתובת:`}
                        <Subtitle
                            style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 15,
                            }}>{item.address !== ''
                            ? `${item.address}`
                            : 'נשלחה מיקום הלקוח, לבדוק במפה' 
                            }</Subtitle>
                        </Subtitle>
                    ) : null}
                    <Subtitle
                        style={{
                        color: 'red',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                        }}>
                        <Subtitle
                        style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 15,
                        }}>
                        אמצעי תשלום:
                        </Subtitle>
                        {item.paid === 0 ? 'מזומן' : 'אשראי'}
                    </Subtitle>
                    </View>
                    <View
                    style={{
                        height: 1,
                        marginEnd: 6,
                        backgroundColor: '#dedede',
                        paddingHorizontal: sizeWidth(2),
                        marginTop: sizeHeight(1),
                    }}
                    />
                    <Subtitle
                    style={{                                 //making rdy                   //item rdy to pickup/to deliver
                        color: item.status === 1 ? 'green' : item.status === 2 ? '#C18D24' : item.status === 3 ? 'purple' : item.status === 4 ? '#3daccf' :'red',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 14,
                        paddingVertical: 2,
                        fontWeight:'bold'
                    }}>
                    {this.textBelowOrder(item.status,item.isdelivery)}
                    </Subtitle>
                </View>
                </Card>
            </View>
        );
    }

    textBelowOrder = (status, isDelivery ) =>
    {
        if(status === 1)
        return `התקבלה הזמנה חדשה ומחכה לאישור`;
        if(status === 2)
        return 'הזמנה בטיפול';
        if(status === 3 && isDelivery)
        return 'הזמנה מוכנה למשלוח';
        if(status === 3 && !isDelivery)
        return 'הזמנה מוכנה לאיסוף';
        if(status === 4)
        return 'הזמנה הסתיימה';
        if(status === -2)
        return 'הזמנה בוטלה על ידי לקוח';
        if(status === -1 )
        return 'הזמנה בוטלה על ידי בית עסק';
    }
}

const styles = StyleSheet.create({
    container:{
        flexDirection: 'column',
        marginHorizontal: sizeWidth(5),
        marginVertical: sizeHeight(2),
    },
    card:{
        borderColor: '#dedede',
        ...Platform.select({
        android: {
            elevation: 2,
        },
        default: {
            shadowColor: 'rgba(0,0,0, .2)',
            shadowOffset: {height: 0, width: 0},
            shadowOpacity: 1,
            shadowRadius: 1,
        },
        }),
    },
    priceStyle:{
        color: '#292929',
        fontFamily: 'Rubik',
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: '700',
        fontWeight: 'bold',
    },
});