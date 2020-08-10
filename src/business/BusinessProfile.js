import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Share,
  Linking,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors, Button} from 'react-native-paper';
import {
  Image,
  NavigationBar,
  Subtitle,
  Title,
  TouchableOpacity,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import ProfileBusinessPp from './ProfileBusinessPp';
import DummyLoader from '../util/DummyLoader';
//import * as Animatable from "react-native-animatable";
//import { showLocation } from "react-native-map-link";
//import * as Lodash from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import TabSectionList from '../Component/TabSectionList';
import {SafeAreaView} from 'react-navigation';

var now = new Date().getDay();
const openBiz = `פתוח`;
const closedBiz = `סגור`;
const busyBiz = `עמוס`;

export default class BusinessProfile extends React.Component {
  constructor(props) {
    super(props);
    this.shareBusiness = this.shareBusiness.bind(this);
    this.parsetime = this.parsetime.bind(this);
    //this.checkStatusBiz = this.checkStatusBiz.bind(this);
    this.phoneCalls = this.phoneCalls.bind(this);
    this.locationOpen = this.locationOpen.bind(this);
    this.state = {
      favData: [],
      item: null,
      progressView: false,
      isFav: false,
      favIndex: 0,
      counter: 0,
      showOrderNo: false,
      cartDatas: [],
      branchid: 0,
      tabNames: null,
      eachTabData: null,
      deliveryPrice: '',
      customerdt: '',
      isTimeExpanded: false,
      hasDelivery: 0,
    };
  }

  componentDidMount() {
    //this.work();
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
      },
    );

    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.work();
    });
  }

  componentWillUnmount() {
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.focusListener.remove();
    }
  }

  shareBusiness = () => {
    if (this.state.item !== null && this.state.item !== undefined) {
      Pref.getVal(Pref.bData, value => {
        const vv = JSON.parse(value);
        //////console.log('websiteUrl', vv.websiteUrl);
        if (vv.websiteUrl !== undefined) {
          Share.share({
            title: this.state.item.name,
            message: this.state.item.message,
            url: vv.websiteUrl,
            subject: 'CallIt',
          });
        } else {
          // alert('Website url not found');
        }
      });
    }
  };

  phoneCalls = () => {
    const phoneNumber = this.state.item.phone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  locationOpen = () => {
    const lat = this.state.item.lat;
    const lng = this.state.item.lon;
    const scheme = Platform.select({ios: 'maps:0,0?q=', android: 'geo:0,0?q='});
    const latLng = `${lat},${lng}`;
    const label = 'Callit';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };

  parsetime = time => {
    if (time == undefined || time == null) {
      return '';
    }
    if (this.state.isTimeExpanded === true) {
      if (time.includes('#')) {
        return time.replace(/#/g, ':');
      } else {
        const g = time.split('\n');
        let data = '';
        for (let index = 0; index < g.length; index++) {
          if (now === index) {
            data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
            break;
          }
        }
        return data.trim();
      }
    }
    if (time.includes('#')) {
      const g = time.split('\n');
      let data = '';
      for (let index = 0; index < g.length; index++) {
        if (now === index) {
          data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
          break;
        }
      }
      return data.replace(/#/g, ':').trim();
    } else {
      return time.replace(/#/g, ':');
    }
  };

  work() {
    Pref.getVal(Pref.branchId, va => {
      Pref.getVal(Pref.bBearerToken, token => {
        //console.log("TOKEN:\n",token);
        const rm = Helper.removeQuotes(token);
        Helper.networkHelperToken(
          Pref.BusinessOwnerUrl + va,
          Pref.methodGet,
          rm,
          result => {
            ////console.log('re', result);
            this.setState({
              progressView: false,
              item: result,
              hasDelivery: result.hasDelivery === null ? 0 : result.hasDelivery,
            });
          },
          error => {
            //
          },
        );
      });
    });
  }

  // render()
  // {
  //   return (
  //     <SafeAreaView style={{flex:1}}>
  //       {/* <ScrollView stickyHeaderIndices={[0]}> */}

  //         <View style={{flex:1}}>

  //           <TabSectionList myHeader={this.aboveList()}></TabSectionList>

  //         </View>
  //       {/* </ScrollView> */}
  //     </SafeAreaView>
  //   );
  // }

  // aboveList = () =>
  // {
  //   return(
  //     <View style={{flex:1}}>
  //       <Subtitle style={{fontSize:20}}>TEST</Subtitle>
  //       <Subtitle style={{fontSize:20}}>TEST</Subtitle>
  //       <Subtitle style={{fontSize:20}}>TEST</Subtitle>
  //       <Subtitle style={{fontSize:20}}>TEST</Subtitle>
  //       <Subtitle style={{fontSize:20}}>TEST</Subtitle>
  //     </View>
  //   );
  // }

  render() {
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <View style={styles.maincontainer}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}>
            <View>
              {this.state.item !== null && this.state.item !== undefined ? (
                <Image
                  // styleName="large-wide"
                  style={{height: sizeHeight(24), resizeMode: 'contain'}}
                  source={{uri: `${Pref.BASEURL}${this.state.item.imageurl}`}}
                />
              ) : null}
              <View
                style={{position: 'absolute', backgroundColor: 'transparent'}}>
                <NavigationBar
                  styleName="inline no-border clear"
                  leftComponent={
                    <View
                      styleName="horizontal space-between"
                      style={{marginStart: 12}}>
                      <TouchableOpacity
                        onPress={() => NavigationActions.goBack()}>
                        <Icon
                          name="arrow-forward"
                          size={36}
                          color="black"
                          style={{
                            padding: 4,
                            backgroundColor: 'transparent',
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
              <Button
                styleName=" muted border"
                mode={'contained'}
                uppercase={true}
                dark={true}
                loading={false}
                style={[styles.loginButtonStyle]}
                onPress={() =>
                  NavigationActions.navigate('BranchDetailEdit', {
                    data: this.state.item,
                  })
                }>
                <Subtitle
                  style={{
                    color: 'white',
                  }}>
                  עריכת פרופיל
                </Subtitle>
              </Button>
              <View>
                {this.state.item !== null && this.state.item !== undefined ? (
                  <View style={{flexDirection: 'column'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(3),
                        marginVertical: sizeHeight(2),
                        paddingHorizontal: sizeWidth(2),
                        justifyContent: 'space-between',
                        backgroundColor: 'white',
                      }}>
                      <View style={{flexDirection: 'column'}}>
                        <Title
                          styleName="bold"
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            fontSize: 20,
                            alignSelf: 'flex-start',
                            fontWeight: '700',
                          }}>
                          
                          {this.state.item.name}
                        </Title>
                        <View style={{flexDirection: 'row'}}>
                          <Subtitle
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 16,
                            }}>
                            {this.state.item.description}
                          </Subtitle>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: '#292929',
                              borderRadius: 8,
                              alignSelf: 'center',
                              margin: 6,
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.item.isOpen === 'open'
                                  ? '#1BB940'
                                  : this.state.item.isOpen === 'closed'
                                  ? '#B72727'
                                  : Colors.deepOrange500,
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 16,
                            }}>
                            {this.state.item.isOpen === 'open'
                              ? `${openBiz}`
                              : this.state.item.isOpen === 'closed'
                              ? `${closedBiz}`
                              : `${busyBiz}`}
                          </Subtitle>
                        </View>
                        {/* </Subtitle> */}
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#dedede',
                        height: 1,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(4),
                        marginVertical: sizeHeight(1),
                        paddingHorizontal: sizeWidth(2),
                        marginTop: sizeHeight(3),
                      }}>
                      <Image
                        source={require('./../res/images/Tracking.png')}
                        style={{width: 22, height: 17, alignSelf: 'center'}}
                      />
                      <Subtitle
                        style={{
                          color: '#292929',
                          fontFamily: 'Rubik',
                          alignSelf: 'center',
                          fontSize: 14,
                          marginStart: sizeWidth(2),
                        }}>
                        {this.state.item.message}
                      </Subtitle>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(4),
                        paddingHorizontal: sizeWidth(2),
                        marginVertical: sizeHeight(1),
                      }}>
                      <Image
                        source={require('./../res/images/call.png')}
                        style={{width: 17, height: 17, alignSelf: 'center'}}
                      />
                      <TouchableWithoutFeedback onPress={this.phoneCalls}>
                        <Subtitle
                          style={{
                            color: '#3DACCF',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginStart: sizeWidth(2),
                          }}>
                          {this.state.item.phone}
                        </Subtitle>
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(4),
                        paddingHorizontal: sizeWidth(2),
                        marginVertical: sizeHeight(1),
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Image
                          source={require('./../res/images/smileydark.png')}
                          style={{width: 18, height: 18, alignSelf: 'center'}}
                        />
                        <Subtitle
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginStart: sizeWidth(2),
                          }}>{`${this.state.item.rating} :דירוג`}</Subtitle>
                      </View>
                      <TouchableWithoutFeedback
                        onPress={() =>
                          NavigationActions.navigate('ReviewsPage', {
                            item: this.state.item,
                          })
                        }>
                        <Subtitle
                          style={{
                            color: '#3DACCF',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginEnd: sizeWidth(2),
                          }}>{`ביקורות`}</Subtitle>
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(4),
                        paddingHorizontal: sizeWidth(2),
                        marginVertical: sizeHeight(1),
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Image
                          source={require('./../res/images/circulardark.png')}
                          style={{width: 18, height: 18, alignSelf: 'center'}}
                        />
                        <Subtitle
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginStart: sizeWidth(2),
                          }}>
                          {this.parsetime(this.state.item.fullOpeningHours)}
                        </Subtitle>
                      </View>
                      <TouchableWithoutFeedback
                        onPress={() =>
                          this.setState({
                            isTimeExpanded: !this.state.isTimeExpanded,
                          })
                        }>
                        <Subtitle
                          style={{
                            color: '#3DACCF',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginEnd: sizeWidth(2),
                          }}>{`שעות פתיחה`}</Subtitle>
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: sizeWidth(4.5),
                        paddingHorizontal: sizeWidth(2),
                        marginVertical: sizeHeight(1),
                        marginBottom: sizeHeight(3),
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Image
                          source={require('./../res/images/placeholder.png')}
                          style={{width: 16, height: 22, alignSelf: 'center'}}
                        />
                        <TouchableWithoutFeedback onPress={this.locationOpen}>
                          <Subtitle
                            style={{
                              color: '#3DACCF',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginStart: sizeWidth(2),
                            }}>
                            {this.state.item.address}
                          </Subtitle>
                        </TouchableWithoutFeedback>
                      </View>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const lat = this.state.item.lat;
                          const lng = this.state.item.lon;
                          const url = `https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
                          Linking.openURL(url);
                        }}>
                        <Image
                          source={require('./../res/images/waze.png')}
                          style={{
                            width: 24,
                            height: 22,
                            alignSelf: 'center',
                            padding: 4,
                            marginEnd: 8,
                          }}
                        />
                      </TouchableWithoutFeedback>
                    </View>
                  </View>
                ) : null}
              </View>
              <DummyLoader
                visibilty={this.state.progressView}
                center={<ProfileBusinessPp />}
                //center={<TabSectionList />}
              />
              <View />
              {/* <TabSectionList /> */}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

/**
 * StyleSheet
 */
const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: sizeWidth(2),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: '#3daccf',
    textAlign: 'center',
  },
});
