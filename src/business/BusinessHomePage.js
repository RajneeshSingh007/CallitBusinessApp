import React from "react";
import { Platform, FlatList, StatusBar, Text, AppState} from "react-native";
import { Divider, Heading, NavigationBar,Title, Row, Screen, Subtitle,TouchableOpacity, View ,Image} from "@shoutem/ui";
import BusinessMenuChoices from "./BusinessMenuChoices";
import NavigationAction from "./../util/NavigationActions";
import DummyLoader from "../util/DummyLoader";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import {Card, List,Colors} from 'react-native-paper';
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';
import Moment from "moment";
import NavigationActions from "./../util/NavigationActions";
import PushNotificationAndroid from "react-native-push-android";
import * as Lodash from "lodash";

export default class BusinessHomePage extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this
      .renderRow
      .bind(this);
    this.renderExtraRow = this.renderExtraRow.bind(this);
    this._notificationEvent = null;
    const dates = Moment().format("YYYY-MM-DD");
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
    //////console.log('dates', dates);
    this.state = {
      bData:null,
      id:0,
      progressView: true,
      searchVisibility: false,
      clone: [],
      restaurants: [],
      bData:[],
      name:'',
      dates: dates,
      showMenu:false,
      appstate: AppState.currentState,
      token:'',
      branchInfo:{},
      firstTime:false,
    };
  }

  componentDidMount() {
    //this.fetchAllCat();
    AppState.addEventListener('change', this._handleAppStateChange);
    this.willFocusListener = this.props.navigation.addListener('willFocus', () =>{
      this.setState({ progressView: true });
    });
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.fetchAllCat();
    });
    this._notificationEvent = PushNotificationAndroid.addEventListener(
      "notification",
      details => {
        PushNotificationAndroid.notify(details);
        this.setState({ progressView: true });
        this.fetchAllCat();
        //////console.log("remoteNotification => ", details);
      }
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    if(this.focusListener !== undefined){this.focusListener.remove();}
    if (this._notificationEvent !== undefined) {
      this._notificationEvent.remove();
    }
    if (this.willFocusListener !== undefined) { this.willFocusListener.remove(); }
  }

  _handleAppStateChange = async nextAppState => {
    const { appState } = this.state;
    //////console.log('nextAppState -->', nextAppState);
    //////console.log('appState -->', appState);
    if (appState === 'active') {
      // do this
    } else if (appState === 'background') {
      // do that
      this.setState({ progressView: true });
      this.fetchOrderData(this.state.id, this.state.dates, this.state.token);
    } else if (appState === 'inactive') {
      // do that other thing
    }

    this.setState({ appState: nextAppState });
  };


  
  /**
   * Fetch all category
   */
  fetchAllCat() {
    Pref.getVal(Pref.bBearerToken, value => {
       const removeQuotes = Helper.removeQuotes(value);
       Pref.getVal(Pref.branchSelected, value =>{
         const pp = JSON.parse(value);
         Helper.networkHelperToken(
           Pref.BusinessDetailUrl +0,//pp.idbranch,
           Pref.methodGet,
           removeQuotes,
           result => {
             //console.log('info',result);
             Pref.setVal(Pref.bData, JSON.stringify(result));
             Pref.setVal(Pref.bId, result.idbusiness);
             Pref.setVal(Pref.branchId, pp.idbranch);
             this.setState({ branchInfo: pp, token: removeQuotes, name: result.name, bData: result, id: pp.idbranch });
             this.fetchOrderData(this.state.id, this.state.dates, removeQuotes);
           },
           error => {
             this.setState({ progressView: false });
           }
         );
       });
    });
  }

  fetchOrderData(id, dates, token){
    const body = JSON.stringify({
      input: '2020-02-16?' + dates
    })
    //console.log('body', body, id, token);
    Helper.networkHelperTokenPost(
      Pref.GetOrdersUrl + id,
      body,
      Pref.methodPost,
      token,
      result => {
      //console.log('result', result);
        const pp = new Promise(function (resolve, reject) {
          const sumclone = Lodash.filter(result, function (o) {
            return o.status <= 3;
          });
          let groupedExtrax = Lodash.groupBy(sumclone, function (exData) {
            return exData.fkcustomerO;
          });
          let allDatas = [];
          for (var keyx in groupedExtrax) {
            const value = groupedExtrax[keyx];
            if (value !== undefined) {
              let groupedExtra = Lodash.groupBy(JSON.parse(JSON.stringify(value)), (ele) => {
                const parseDate = Moment(ele.orderdate).format('YYYY/MM/DD HH:mm');
                return parseDate;
              })
              Object.keys(groupedExtra).map(key => {
                const st = groupedExtra[key][0].status;

                let servicelist = [];
                var result = groupedExtra[key].reduce(function (p, c) {
                  var defaultValue = {
                    name: c.serviceName,
                    count: 0
                  };
                  p[c.serviceName] = p[c.serviceName] || defaultValue
                  p[c.serviceName].count++;
                  return p;
                }, {});
                for (var k in result) {
                  const uuu = result[k];
                  let count = uuu.count;
                  let jjj = '';
                  if (count > 1) {
                    jjj = uuu.name + " " + uuu.count + "x";
                  } else {
                    jjj = uuu.name;
                  }
                  servicelist.push(jjj);
                }
                let finalPricess = Lodash.sumBy(groupedExtra[key], function (o) { return o.price; });
                const iii = groupedExtra[key][0];
                if (iii.deliveryprice !== undefined && iii.deliveryprice !== null) {
                  if (Number(iii.deliveryprice) > 0) {
                    finalPricess += iii.deliveryprice;
                  }
                }
                allDatas.push({
                  title: key,
                  name: groupedExtra[key][0].firstname + " " + groupedExtra[key][0].lastname,
                  address: groupedExtra[key][0].address,
                  customertelephone: groupedExtra[key][0].customertelephone,
                  totalPrice: finalPricess,
                  status: st,
                  deliveryprice: groupedExtra[key][0].deliveryprice,
                  orderdate: groupedExtra[key][0].orderdate,
                  paid: groupedExtra[key][0].paid,
                  data: groupedExtra[key],
                  servicelist: servicelist,
                  isHistory: false,
                });
              });
            }
          }
          
          const sortt = allDatas.sort((a, b) => {
            return Moment(a.title, 'YYYY/MM/DD HH:mm:ss').isAfter(Moment(b.title, 'YYYY/MM/DD HH:mm:ss')) ? -1 : 1
          })

          resolve(sortt);
        });
        pp.then(value => {
          this.setState({ clone: value, restaurants: value, progressView: false, firstTime:true });
        });
      },
      error => {
        //////console.log(error);
      }
    );
  }

  renderExtraRow(item, index){
    return (
      <View style={{
        flexDirection: 'column',
      }}>
        {index === 0 ? <View style={{
          backgroundColor: '#d9d9d9',
          height: 1,
        }} /> : null}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', marginVertical: sizeHeight(1.5) }}>
          <Title styleName='bold' style={{
            color: '#292929',
            fontFamily: 'Rubik',
            fontSize: 16,
            alignSelf: 'flex-start',
            fontWeight: '700',
          }}>{item.name}</Title>
          <Subtitle style={{
            color: '#292929',
            fontFamily: 'Rubik',
            alignSelf: 'flex-start',
            fontSize: 14,
            fontWeight: 'bold'
          }}>{`₪${item.price}`}</Subtitle>
        </View>
              </View>
    );
  }

  renderRow(item, index) {
    return (
      <View style={{
        flexDirection: 'column',
        marginHorizontal: sizeWidth(5),
        marginVertical: sizeHeight(2)
      }}>
        <Card style={{
          borderColor: '#dedede',
          ...Platform.select({
            android: {
              elevation: 2,
            },
            default: {
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 1,
              shadowRadius: 1,
            },
          }),
        }} onPress={() => NavigationActions.navigate('OrderManage', { item: item,mode:false })}>
          <View style={{ flexDirection: 'column', marginTop: 8, marginHorizontal: sizeWidth(2.5), marginBottom: sizeWidth(1), }}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}> 
              <View style={{ flexDirection: 'column',flex:1}}>
                {item.servicelist !== null && item.servicelist !== undefined ? item.servicelist.map((ele, index) => {
                  return index < 3 ? <Title styleName='bold' style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      alignSelf: 'flex-start',
                      fontWeight: '700',
                  }}>{`${Lodash.capitalize(ele)}`}</Title> : null
                  }) : null}
              </View>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 16,
                fontWeight: '700',
                fontWeight:'bold'
              }}>{`₪${item.totalPrice}`}</Subtitle>
            </View>
            {/* {item.extras !== null && item.extras.length > 0 ? <List.Accordion title={'extra'} style={{ marginVertical: -10, marginHorizontal: -16, }} titleStyle={{ marginHorizontal: -1 }}>
              <FlatList
                extraData={this.state}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                data={item.extras}
                ItemSeparatorComponent={()=>{
                  return <View style={{
                    backgroundColor: '#d9d9d9',
                    height: 1,
                  }} />;
                }}
                keyExtractor={(item, index) => item.name}
                renderItem={({ item: item, index }) => this.renderExtraRow(item, index)} />
            </List.Accordion> : null} */}
            <View style={{ flexDirection: 'column', marginTop: sizeHeight(0.4), }}>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`${item.name}`}</Subtitle>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`פלאפון: ${item.customertelephone}`}</Subtitle>
              {item.address !== '' ? <Subtitle style={{
                color: '#6DC124',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`כתובת:`}<Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                }}>{`${item.address}`}</Subtitle></Subtitle> : null}
              <Subtitle style={{
                color: 'red',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}><Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                }}>אמצעי תשלום: </Subtitle> {item.paid === 0 ? 'מזומן' : 'אשראי'}</Subtitle>
            </View>
            <View style={{
              height: 1,
              marginEnd: 6,
              backgroundColor: '#dedede',
              paddingHorizontal:sizeWidth(2),
              marginTop:sizeHeight(1)

            }} />
              <Subtitle style={{
                color: '#C18D24',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 14,
              paddingVertical: 2
            }}>{item.status === 1 ? `ההזמנה שלך התקבלה במערכת ומחכה לאישור` : item.status === 2 ? 'התחילו לטפל בהזמנה שלך, לא יקח הרבה זמן' : item.status === 3 ? `ההזמנה בדרך אליך` : `תודה רבה שבחרת בשירותינו`}</Subtitle>
          </View>
        </Card>
      </View>
    );
  }

  /**
   * search category
   * @param {Search} text
   */
  filterSearch(text) {
    if (text === "") {
      this.setState({ restaurants: this.state.clone });
    } else {
      const newData = this
        .state
        .clone
        .filter((item) => {
          const itemData = item
            .name
            .toLowerCase();
          const textData = text.toLowerCase();
          return itemData.includes(textData);
        });
      this.setState({
        restaurants: newData.length > 0
          ? newData
          : this.state.clone
      });
    }
  }


  render() {
    return (
      <Screen style={{
        backgroundColor: "white"
      }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
        <NavigationBar
          styleName="inline no-border"
          style={
            {
              rightComponent: {
                flex: 0.4,
              },
              leftComponent: {
                flex: 0.4,
              },
              centerComponent: {
                flex: 0.2,
              },
              componentsContainer: {
                flex: 1,
              }
            }
          }
          rightComponent={
            <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
              {/* <TouchableOpacity onPress={() => this.setState({ isCatgegoryClicked: 2, filterView: true, })}>
                <Image source={require('./../res/images/search.png')}
                  style={{ width: 24, height: 24, marginEnd: 16, }}
                />
              </TouchableOpacity> */}
              <BusinessMenuChoices />
            </View>
          }
          leftComponent={<View style={{ marginStart: 12 }}>
            <Heading style={{
              fontSize: 18, 
              color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
              alignSelf:'center'
            }}>{this.state.branchInfo.name}</Heading>
          </View>}
        />
        <View
          styleName='vertical'
          style={{
            flex:1,
            backgroundColor: "white",
          }}>
          <DummyLoader
            visibilty={this.state.progressView}
            center={
              this.state.restaurants.length > 0
                ? <FlatList
                  extraData={this.state}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  data={this.state.restaurants}
                  keyExtractor={(item, index) => item.title.toString()}
                  renderItem={({ item: item, index }) => this.renderRow(item, index)}/>
                : <Subtitle style={{ alignSelf: "center" }}>אין הזמנות פעילות...</Subtitle>}

          />
        </View>
      </Screen>
    );
  }
}
