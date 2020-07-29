import React from "react";
import {
  StatusBar, StyleSheet, View,
  Share, Linking, TouchableWithoutFeedback, Platform,SafeAreaView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Colors,Button} from "react-native-paper";
import {
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
} from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import NavigationActions from "../util/NavigationActions";
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';


export default class BusinessInfo extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    parsetime = (time) => {
        if (time == undefined || time == null) {
          return '';
        }
        if (this.state.isTimeExpanded === true) {
          if(time.includes('#')){
            return time.replace(/#/g, ':');
          }else{
            const g = time.split("\n");
            let data = "";
            for (let index = 0; index < g.length; index++) {
              if (now === index) {
                data = g[index];//+ '-' + g[index + 1] + " :" + g[index+2];
                break;
              }
            }
            return data.trim();
          }
        }
        if (time.includes('#')) {
          const g = time.split("\n");
          let data = "";
          for (let index = 0; index < g.length; index++) {
            if (now === index) {
              data = g[index];//+ '-' + g[index + 1] + " :" + g[index+2];
              break;
            }
          }
          return data.replace(/#/g, ':').trim();
        } else {
          return time.replace(/#/g, ':');
        }
      }

    render()
    {
        return(
            <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row', marginStart: sizeWidth(3), marginVertical: sizeHeight(2), paddingHorizontal: sizeWidth(2), justifyContent: 'space-between', backgroundColor: 'white' }}>
                  <View style={{ flexDirection: 'column' }}>
                    <Title styleName='bold' style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 20,
                      alignSelf: 'flex-start',
                      fontWeight: '700',
                    }}> {this.state.item.name}</Title>
                    <View style={{ flexDirection: 'row' }}>
                      <Subtitle style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 16,
                      }}>{this.state.item.description}</Subtitle>
                      <View style={{ width: 8, height: 8, backgroundColor: '#292929', borderRadius: 8, alignSelf: 'center', margin: 6 }} />
                      <Subtitle style={{
                        color: this.state.item.isOpen=== "open" ? '#1BB940' : this.state.item.isOpen === 'closed' ? '#B72727'  : Colors.deepOrange500 ,
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 16,
                      }}>{this.state.item.isOpen === 'open' ?  `${openBiz}` : this.state.item.isOpen === 'closed' ? `${closedBiz}` : `${busyBiz}`}</Subtitle>
                    </View>
                    {/* </Subtitle> */}
                  </View>
                </View>
                <View style={{
                  backgroundColor: '#dedede',
                  height: 1,
                }} />
                <View style={{
                  flexDirection: 'row', marginStart: sizeWidth(4), marginVertical: sizeHeight(1), paddingHorizontal: sizeWidth(2), marginTop: sizeHeight(3)
                }}>
                  <Image source={require('./../res/images/Tracking.png')}
                    style={{ width: 22, height: 17, alignSelf: 'center', }}
                  />
                  <Subtitle style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'center',
                    fontSize: 14,
                    marginStart: sizeWidth(2)
                  }}>{this.state.item.message}</Subtitle>
                </View>
                <View style={{
                  flexDirection: 'row', marginStart: sizeWidth(4),
                  paddingHorizontal: sizeWidth(2), marginVertical: sizeHeight(1),
                }}>
                  <Image source={require('./../res/images/call.png')}
                    style={{ width: 17, height: 17, alignSelf: 'center', }}
                  />
                  <TouchableWithoutFeedback onPress={this.phoneCalls}>
                    <Subtitle style={{
                      color: '#3DACCF',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      marginStart: sizeWidth(2)
                    }}>{this.state.item.phone}</Subtitle>
                  </TouchableWithoutFeedback>
                         </View>
                <View style={{
                  flexDirection: 'row', marginStart: sizeWidth(4),
                  paddingHorizontal: sizeWidth(2), marginVertical: sizeHeight(1),
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('./../res/images/smileydark.png')}
                      style={{ width: 18, height: 18, alignSelf: 'center', }}
                    />
                    <Subtitle style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      marginStart: sizeWidth(2)
                    }}>{`${this.state.item.rating} :דירוג`}</Subtitle>
                  </View>
                  <TouchableWithoutFeedback onPress={() => NavigationActions.navigate('ReviewsPage', { item: this.state.item })}>
                    <Subtitle style={{
                      color: '#3DACCF',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      marginEnd: sizeWidth(2)
                    }}>{`ביקורות`}</Subtitle>
                  </TouchableWithoutFeedback>
                </View>
                <View style={{
                  flexDirection: 'row', marginStart: sizeWidth(4),
                  paddingHorizontal: sizeWidth(2), marginVertical: sizeHeight(1),
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('./../res/images/circulardark.png')}
                      style={{ width: 18, height: 18, alignSelf: 'center', }}
                    />
                    <Subtitle style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      marginStart: sizeWidth(2)
                    }}>{this.parsetime(this.state.item.fullOpeningHours)}</Subtitle>
                  </View>
                  <TouchableWithoutFeedback onPress={() => this.setState({ isTimeExpanded: !this.state.isTimeExpanded })}>
                    <Subtitle style={{
                      color: '#3DACCF',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      marginEnd: sizeWidth(2)
                    }}>{`שעות פתיחה`}</Subtitle>
                  </TouchableWithoutFeedback>
                </View>
                <View style={{
                  flexDirection: 'row', marginStart: sizeWidth(4.5),
                  paddingHorizontal: sizeWidth(2),
                  marginVertical: sizeHeight(1),
                  marginBottom: sizeHeight(3),
                  justifyContent: 'space-between'
                }}>
                  <View style={{flexDirection:'row'}}>
                    <Image source={require('./../res/images/placeholder.png')}
                      style={{ width: 16, height: 22, alignSelf: 'center', }}
                    />
                    <TouchableWithoutFeedback onPress={this.locationOpen}>
                      <Subtitle style={{
                        color: '#3DACCF',
                        fontFamily: 'Rubik',
                        alignSelf: 'center',
                        fontSize: 14,
                        marginStart: sizeWidth(2)
                      }}>{this.state.item.address}</Subtitle>

                    </TouchableWithoutFeedback>
                  </View>
                  <TouchableWithoutFeedback onPress={() => {
                    const lat = this.state.item.lat;
                    const lng = this.state.item.lon;
                    const url = `https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`
                    Linking.openURL(url);
                  }}>
                    <Image source={require('./../res/images/waze.png')}
                      style={{ width: 24, height: 22, alignSelf: 'center', padding: 4,marginEnd:8}}
                    />
                  </TouchableWithoutFeedback>
                </View>
              </View>
        );
    }
}

const styles = StyleSheet.create({

});