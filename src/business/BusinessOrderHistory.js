import React from "react";
import {Platform, FlatList, StatusBar, Text, TouchableWithoutFeedback,StyleSheet,BackHandler } from "react-native";
import { Divider, Heading, NavigationBar, Title, Row, Screen, Subtitle, TouchableOpacity, View, Image } from "@shoutem/ui";
import DummyLoader from "../util/DummyLoader";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Card, List, Button, TextInput, Portal, Modal,Colors} from 'react-native-paper';
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';
import Moment from "moment";
import NavigationActions from "./../util/NavigationActions";
import { Loader } from "./../customer/Loader";
import DateTimePicker from "react-native-modal-datetime-picker";
import BusinessMenuChoices from "./BusinessMenuChoices";
import Lodash from 'lodash';
import Icon from "react-native-vector-icons/MaterialIcons";

export default class BusinessOrderHistory extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this
      .renderRow
      .bind(this);
    this.renderExtraRow = this.renderExtraRow.bind(this);
    this.backclick = this.backclick.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    const dates = Moment().format("YYYY-MM-DD");
    this.state = {
      progressView: false,
      searchVisibility: false,
      clone: [],
      stDate:dates,
      restaurants: [],
      cp:false,
      inputDStartDateTime: dates,
      inputDEndDateTime: "",
      connectChoice:false,
      datePicker:false,
      datePicker1:false,
      filterView:false,
      close:false,
      filterid:0,
      viewid:1,
    };
  }

  _handleSDatePicked = (date) => {
    this.setState({
      inputDStartDateTime: Moment(date).format("YYYY-MM-DD"),
      passStartDate: Moment(date).format(),
      datePicker: false
    });
  };

  _handleEDatePicked = (date) => {
    this.setState({
      inputDEndDateTime: Moment(date).format("YYYY-MM-DD"),
      passEndDate: Moment(date).format(),
      datePicker1: false
    });
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backclick);
    //this.fetchAllCat();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({ progressView: true });
      this.fetchAllCat();
    });
  }

  componentWillUnmount() {
    if(this.focusListener !== undefined){this.focusListener.remove();}
    BackHandler.removeEventListener('hardwareBackPress', this.backclick);
  }

  backclick(){
    if (this.state.connectChoice || this.state.filterView){
      this.fetchAllCat();
      return true;
    }else{
      return false;
    }
  }

  /**
   * Fetch all category
   */
  fetchAllCat() {
    let isn = this.state.inputDStartDateTime;
    if(this.state.inputDEndDateTime !== ""){
      isn += "?"+this.state.inputDEndDateTime;
    }
    const body = JSON.stringify({
      input: isn
    })
    Pref.getVal(Pref.bBearerToken, val=>{
      const removeQuotes = Helper.removeQuotes(val);
      Pref.getVal(Pref.branchId, id => {
        Helper.networkHelperTokenPost(
          Pref.GetOrdersUrl + id,
          body,
          Pref.methodPost,
          removeQuotes,
          result => {
            const sumclone = Lodash.filter(result, function (o) {
              return o.status >= 3;
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
                    isHistory: true,
                  });
                });
              }
            }
            const fl = allDatas.sort((a, b) => {
              return Moment(a.title, 'YYYY/MM/DD HH:mm:ss').isAfter(Moment(b.title, 'YYYY/MM/DD HH:mm:ss')) ? -1 : 1
            })
            this.setState({ inputDStartDateTime: this.state.stDate, inputDEndDateTime: '', cp: false, connectChoice: false, clone: fl, restaurants: fl, progressView: false,viewid:1,});
          },
          error => {
          }
        );
      });
    })
  }

  renderExtraRow(item, index) {
    return (
      <View style={{
        flexDirection: 'column',
      }}>
        {index === 0 ? <View style={{
          backgroundColor: '#d9d9d9',
          height: 1,
        }} /> : null}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', marginVertical: sizeHeight(1.5)
        }}>
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

  date1() {
    this.setState({
      datePicker: !this.state.datePicker,
    })
  }
  date2() {
    this.setState({
      datePicker1: !this.state.datePicker1,
    })
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
        }} onPress={() => NavigationActions.navigate('OrderManage', { item: item, mode: true })}>
          {/* <Image
							styleName="medium-square"
							//source={{ uri: `http://192.236.162.188/${item.imageurl}` }}
							source={{ uri: 'https://picsum.photos/700' }}
							style={{
								width:'100%',
								borderTopLeftRadius: 8,
								borderTopEndRadius: 8,
								borderTopRightRadius: 8,
								borderTopStartRadius: 8,
					}}
					/> */}
          <View style={{ flexDirection: 'column', marginTop: 8, marginHorizontal: sizeWidth(2.5), marginBottom: sizeWidth(1), }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'column', flex: 1 }}>
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
                fontWeight: 'bold'
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
            <View style={{ flexDirection: 'column', marginTop: sizeHeight(0.4),}}>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`${item.name} :שם לקוח`}</Subtitle>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`פלאפון: ${item.customertelephone}`}</Subtitle>
              {item.address !== '' ? 
              <Subtitle style={{
                color: '#6DC124',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`כתובת:`} <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                  }}>{`${item.address}`}</Subtitle></Subtitle> : null}
              {/* <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}><Subtitle style={{
                color: '#6DC124',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                }}>{`${item.address} `}</Subtitle>
                :כתובת</Subtitle> */}
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
              }}>{`אמצעי תשלום:`} <Subtitle style={{
                color: 'red',
                fontFamily: 'Rubik',
                fontSize: 15,
              }}>{item.paid === 0 ? 'מזומן' : 'אשראי'}</Subtitle></Subtitle>
            </View>

            <View style={{
              height: 1,
              marginEnd: 6,
              backgroundColor: '#dedede',
              paddingHorizontal: sizeWidth(2),
              marginTop: sizeHeight(1)

            }} />
            <Subtitle style={{
              color: '#C18D24',
              fontFamily: 'Rubik',
              alignSelf: 'flex-start',
              fontSize: 14,
              paddingVertical:2
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


  onFilterClick = () => {
    const ogData = this.state.clone;
    ////console.log('ogData', ogData);
    let sortedData = [];
    if (this.state.filterid !== '') {
      sortedData = ogData.filter(element => {
        const tu = element.data;
        let ret = false;
        tu.map(ele =>{
          if (ele.idorder === Number(this.state.filterid)){
            ret = true;
          }
        });
        return element;
      });
      this.setState({
        viewid:1,
        restaurants: sortedData,
        close: false,
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
                flex: 0.5,
              },
              centerComponent: {
                flex: 0.1,
              },
              componentsContainer: {
                flex: 1,
              }
            }
          }
          rightComponent={
            !this.state.close ? <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
              {/* <TouchableOpacity onPress={() => this.setState({ filterView: true, close: true, viewid:2 })}>
                <Image source={require('./../res/images/search.png')}
                  style={{ width: 24, height: 24, marginEnd: 16, }}
                />
              </TouchableOpacity> */}
              <BusinessMenuChoices />
            </View> : <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
                <TouchableOpacity onPress={() => this.setState({ filterView: false, close: false, viewid:1 })}>
                  <Icon
                    name={'close'}
                    size={36}
                    color={'#292929'} />
                </TouchableOpacity>
              </View>
          }
          leftComponent={<View style={{ marginStart: 12 }}>
            <Heading style={{
              fontSize: 20, color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
              alignSelf:'center'
            }}>היסטוריית הזמנות</Heading>
          </View>}
        />
        {this.state.viewid == 2 ? <View style={{ flexDirection: 'column', marginTop: sizeHeight(3),marginHorizontal:sizeWidth(1) }}>
          <TextInput
            mode='flat'
            label={"Search by id"}
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={styles.inputStyle}
            placeholderTextColor={'#DEDEDE'}
            placeholder={"שם התוספת"}
            onChangeText={value => this.setState({ filterid: value })}
            value={this.state.filterid}
          />
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            loading={false}
            style={{
              color: "white",
              bottom: 0,
              paddingVertical: sizeWidth(2),
              marginHorizontal: sizeWidth(4),
              marginBottom: sizeHeight(2),
              top: sizeHeight(4),
              backgroundColor: '#3daccf',
              textAlign: "center",
            }}
            onPress={this.onFilterClick}
          >

            <Subtitle
              style={{
                color: "white"
              }}
            >חפש</Subtitle>
          </Button>
        </View> : null}
        {this.state.viewid === 1 ? <View
          styleName="vertical"
          style={{
            flex: 1,
            backgroundColor: "white"
          }}>
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            style={styles.loginButtonStyle}
            onPress={() => this.setState({ connectChoice: true })}
          >
            <Subtitle
              style={{ color: "white" }}>{'סינון'}</Subtitle>
          </Button>
          <DummyLoader
            visibilty={this.state.progressView}
            center={this.state.restaurants.length > 0
              ? <FlatList
                extraData={this.state}
                data={this.state.restaurants}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item: item, index }) => this.renderRow(item, index)} />
              : <Subtitle
                style={{
                  alignSelf: "center"
                }}>אין היסטורית הזמנות...</Subtitle>} />
        </View>:null}
        <DateTimePicker
          isVisible={this.state.datePicker}
          onConfirm={this._handleSDatePicked}
          mode={'date'}
          datePickerModeAndroid={'default'}
          onCancel={() => {
            this.setState({ datePicker: false });
          }}
        />

        <DateTimePicker
          isVisible={this.state.datePicker1}
          onConfirm={this._handleEDatePicked}
          mode={'date'}
          datePickerModeAndroid={'default'}
          onCancel={() => {
            this.setState({ datePicker1: false });
          }}
        />

        <Loader isShow={this.state.cp} />
        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.connectChoice}
            onDismiss={() => this.setState({ connectChoice: false })}
            contentContainerStyle={{
              marginHorizontal: sizeWidth(4),
              backgroundColor: 'white',
            }}>
            <View styleName="vertical" style={{ backgroundColor: 'white'}}>
              <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(1), color: '#292929', fontSize: 16,alignSelf:'center',fontWeight:'bold', marginVertical:sizeHeight(1),paddingVertical:sizeHeight(2) }} styleName="bold">
                סינון
              </Subtitle>
              <View style={{ flexDirection: 'row',}}>
                <TextInput
                  style={[styles.inputStyle, { flex: 0.5, }]}
                  mode={"flat"}
                  password={false}
                  returnKeyType='next'
                  multiline={true}
                  label={'תאריך התחלה'}
                  value={this.state.inputDStartDateTime}
                  onFocus={() => this.date1()}
                  underlineColor={"transparent"}
                  underlineColorAndroid={"transparent"}
                />
                <TextInput
                  style={[styles.inputStyle, { flex: 0.5, }]}
                  mode={"flat"}
                  label={'תאריך סיום'}
                  password={false}
                  returnKeyType='done'
                  multiline={true}
                  value={this.state.inputDEndDateTime}
                  onFocus={() => this.date2()}
                  underlineColor={"transparent"}
                  underlineColorAndroid={"transparent"}
                />
              </View>
              <Button
                styleName=" muted border"
                mode={"contained"}
                uppercase={true}
                dark={true}
                style={{
                  color: "white",
                  bottom: 0,
                  paddingVertical: sizeHeight(1),
                  marginVertical: sizeHeight(2),
                  marginHorizontal: sizeWidth(1),
                  backgroundColor: '#3daccf',
                  textAlign: "center",
                  margin: 0,
                }}
                onPress={() => {
                  this.setState({ connectChoice: false,cp:true });
                  this.fetchAllCat();
                }}
              >
                <Subtitle
                  style={{ color: "white" }}>{'סיום'}</Subtitle>
              </Button>
            </View>
          </Modal>
        </Portal>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    marginHorizontal: sizeWidth(2),
    fontWeight: '700',
  },
  loginButtonStyle: {
    color: "white",
    bottom: 0,
    paddingVertical: sizeHeight(1),
    marginVertical: sizeHeight(2),
    marginHorizontal:sizeWidth(4),
    backgroundColor: '#3daccf',
    textAlign: "center",
    margin: 0,
  }
});

            