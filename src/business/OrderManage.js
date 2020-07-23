import React from 'react';
import {
  Linking,
  Platform,
  Alert,
  FlatList,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Divider,
  Heading,
  NavigationBar,
  Title,
  Row,
  Screen,
  Subtitle,
  TouchableOpacity,
  View,
  Image,
} from '@shoutem/ui';
import DummyLoader from '../util/DummyLoader';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {
  Checkbox,
  Portal,
  Dialog,
  Card,
  List,
  TextInput,
  Button,
  Modal,
} from 'react-native-paper';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import Moment from 'moment';
import momenttz from 'moment-timezone';
import NavigationActions from './../util/NavigationActions';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {Loader} from './../customer/Loader';
import Lodash from 'lodash';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import xml2js from 'xml2js';

let word = 'עדכון: הזמנה מוכנה';
let declineMsg = '';

export default class OrderManage extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.ordemm = this.ordemm.bind(this);
    this.locationOpen = this.locationOpen.bind(this);
    this.renderExtraRow = this.renderExtraRow.bind(this);
    this.decline = this.decline.bind(this);
    this.state = {
      branchId: null,
      ogData: [],
      token: '',
      bData: null,
      id: 0,
      idxx: 0,
      progressView: true,
      searchVisibility: false,
      clone: [],
      restaurants: [],
      displayList: [],
      bData: [],
      name: '',
      time: '',
      message: '',
      wse: 0,
      showp: false,
      bid: null,
      showApprove: false,
      status: 0,
      mode: false,
      allMessages: '',
      expand: false,
      isDelivery: false,
      showDecline: false,
      isHistory: false,
      printmodeon: false,
      firstTime: true,
      terminalNumber: '',
      cardSessionID: '',
      shovar: '',
      combinePriced:'',
    };
  }

  objectsEqual = (o1, o2) => {
    if (o1.length !== o2.length) return false;
    let count = 0;
    for (let index = 0; index < o1.length; index++) {
      const e1 = o1[index];
      const e2 = o2[index];
      if (e1.name === e2.name) {
        count += 1;
      }
    }
    return count === o1.length;
  };

  fetchCG() {
    Pref.getVal(Pref.branchId, va => {
      Pref.getVal(Pref.bBearerToken, token => {
        const rm = Helper.removeQuotes(token);
        Helper.networkHelperToken(
          Pref.BusinessOwnerUrl + va,
          Pref.methodGet,
          rm,
          result => {
            //console.log('terminalNumber', result.terminalNumber);
            this.setState({terminalNumber: result.terminalNumber});
          },
          error => {
            //
          },
        );
      });
    });
    Pref.getVal(Pref.bBearerToken, v => {
      const oop = Helper.removeQuotes(v);
      this.setState({token: oop});
      Helper.networkHelperToken(
        Pref.GetSessionCardUrl,
        Pref.methodGet,
        oop,
        op => {
          //console.log(op);
          this.setState({cardSessionID: op});
        },
        error => {
          console.log('ERROR IN FETCHING Session CardURL', error);
        },
      );
    });
  }

  componentDidMount() {
    this.fetchCG();
    Pref.getVal(Pref.bId, v => {
      this.setState({bid: v});
    });
    Pref.getVal(Pref.branchId,brID=>{
      this.setState({branchId: brID});
    });
    Pref.getVal(Pref.printon, value => {
      const oop = Helper.removeQuotes(value);
      this.setState(
        {printmodeon: oop !== undefined && oop === '1' ? true : false},
        () => {
          //console.log('value', this.state.printmodeon);
        },
      );
    });
    const {state} = this.props.navigation;
    const data = state.params.item;
    //console.log('data', data);
    const mm = state.params.mode;
    const pppp = data.status;
    console.log(`pppp`, pppp);
    const allDatas = data.data;
    let allMessages = '';

    const finalDisplayData = [];
    Lodash.map(allDatas, firspos => {
      const {
        extras,
        message,
        price,
        serviceName,
        orderdate,
        quantity,
      } = firspos;
      let total = Number(price);
      const exstr = Helper.groupExtraWithCountString(extras, false);
      finalDisplayData.push({
        orderdate: orderdate,
        serviceName: serviceName,
        extraDisplayArray: exstr,
        message: message,
        price: total,
        counter: quantity || 0,
      });
    });

    this.setState({
      customerfkO: data.customerfkO,
      allMessages: allMessages,
      ogData: data,
      idxx: data.idorder,
      mode: mm,
      status: pppp,
      clone: allDatas,
      displayList: finalDisplayData,
      restaurants: allDatas,
      progressView: false,
      isDelivery: data.isDelivery,
      shovar: data.shovar || '',
      combinePriced: Helper.getCombinedprice(
        data.totalPrice,
        data.deliveryprice,
      ),
    });
  }

  declineWithOutOfStock = () => {
    declineMsg = ` לקוחות יקרים, חלק מהמוצרים שבחרתם אינם במלאי, נא להתעדכן בתפריט ולהזמין מחדש. סליחה ותודה על ההבנה `;
    this.decline();
  };
  declineWithBusy = () => {
    declineMsg = ` לקוחות יקרים, עקב עומס רב בהזמנות בבית העסק שלנו, אנחנו לא יכולים לקבל את ההזמנה שלך. סליחה ותודה על ההבנה `;
    this.decline();
  };
  declineWithNothing = () => {
    declineMsg = ``;
    this.decline();
  };

  printText = async () => {
    const {restaurants} = this.state;
    let parseString = `<html><head><title>Order</title></head><body style="width:80mm; height:80mm;direction: rtl;">`;
    if (restaurants !== undefined && restaurants.length > 0) {
      parseString +=
        '<strong>' +
        `מספר הזמנה: ${this.last3digitorder()}` +
        '</strong><br><br>';
      restaurants.map(item => {
        parseString +=
          '<strong>' + Lodash.capitalize(item.serviceName) + `   ${item.quantity}x`+ '</strong>';
          //console.log("items", item);
        if (item.extras !== undefined && item.extras.length > 0) {
          let manisps = `<p>`;
          this.filterExtrasCat(item.extras).map(elex => {
            const too = elex.data;
            //console.log('extras', elex.data);
            manisps += `${too}<br>`;
            // if(too.length > 40){
            // const sp = too.split(':');
            // const catss = sp[0];
            // let countchar = catss.length;
            // const rests = sp[1];
            // parseString += "<br>"+catss + ":";
            // const agaisps = rests.split(',');
            // for (let index = 0; index < agaisps.length; index++) {
            //     const element = agaisps[index];
            //     const elcharlen = element.length;
            //     countchar += elcharlen;
            //     if (countchar <40){
            //         manisps += element + ",";
            //     }else{
            //         manisps += "<br>" + element+",";
            //         countchar = elcharlen;
            //     }
            // }
            // manisps += "</p>";
            // parseString += manisps;
            // }else{
            //     parseString += elex.data + "<br>";
            // }
          });
          manisps += `</p>`;
          parseString += manisps;
          //parseString += "<br>";
        } else {
          parseString += `<p></p>`;
        }
        //parseString += "<br>";
        if (
          item.message !== null &&
          item.message !== '' &&
          item.message !== undefined
        ) {
          parseString += 'הערה:' + item.message + '';
        }
        parseString += '<br>';
      });
      // parseString += "<br>";
      parseString += `שם לקוח: ${this.state.ogData.name}` + '<br>';
      parseString += `פלאפון: ${this.state.ogData.customertelephone}` + '<br>';
      if (this.state.ogData.address !== '') {
        parseString += `כתובת: ${this.state.ogData.address}` + '<br>';
      }
      parseString += `סכום לתשלום:₪${this.state.combinePriced}` + '<br>';
      parseString += `אמצעי תשלום:${
        this.state.ogData.paid === 0 ? 'מזומן' : 'אשראי'
      }`;
      parseString += '</body></html>';
      //console.log('parseString', parseString);
      await RNPrint.print({
        html: parseString,
      });
    }
  };

  renderExtraRow(item, index) {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{flex: 0, flexDirection: 'row'}}>
          <Title
            styleName="bold"
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 16,
              fontWeight: '400',
            }}>
            {`${Lodash.capitalize(item.category)}:`}
          </Title>

          <View style={{flex: 2, flexDirection: 'row', flexWrap: 'wrap'}}>
            {item.data.map((ele, index) => {
              return (
                <Title
                  styleName="bold"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '400',
                    paddingHorizontal: 2,
                  }}>
                  {index === 0
                    ? `${Lodash.capitalize(ele.name)}`
                    : index === item.data.length - 1
                    ? `${Lodash.capitalize(ele.name)},`
                    : `,${Lodash.capitalize(ele.name)}`}
                </Title>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  filterExtrasCat(result) {
    let groupedExtra = Lodash.groupBy(result, function(exData) {
      if (exData.category !== '') {
        return exData.category;
      }
    });
    let fias = [];
    //console.log('groupedExtra', groupedExtra);
    Object.keys(groupedExtra).map(key => {
      let filterExtras = key + ': ';
      const datass = groupedExtra[key];
      Lodash.map(datass, (ele, index) => {
        if (index === datass.length - 1) {
          filterExtras += ele.name;
        } else {
          filterExtras += ele.name + ',';
        }
      });
      fias.push({data: filterExtras});
    });
    //console.log('fias', fias);
    return fias;
  }

  renderRow(item, index) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginHorizontal: sizeWidth(2),
        }}>
        <View style={{flexDirection: 'row', flex: 1}}>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
              marginStart: sizeWidth(2),
              marginBottom: sizeWidth(1),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Title
                styleName="bold"
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 15,
                  alignSelf: 'flex-start',
                  fontWeight: '700',
                }}>
                {item.serviceName}
                {item.counter > 0 ? (
                  <Title
                    styleName="bold"
                    style={{
                      color: 'green',
                      fontFamily: 'Rubik',
                      fontSize: 18,
                      alignSelf: 'flex-start',
                      fontWeight: 'bold',
                    }}>
                    {`   ${item.counter}x`}
                  </Title>
                ) : null}
              </Title>
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  multiline: false,
                  alignSelf: 'flex-start',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>{`₪${item.price}`}</Subtitle>
            </View>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                <Title
                  styleName="wrap"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '400',
                    paddingHorizontal: 2,
                    writingDirection: 'ltr',
                  }}>
                  {`${Lodash.capitalize(item.extraDisplayArray.trim())}`}
                </Title>
              </View>
            </View>
            {item.message !== null &&
            item.message !== '' &&
            item.message !== undefined ? (
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 15,
                }}>{`הערה: ${item.message}`}</Subtitle>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  /**
   * search category
   * @param {Search} text
   */
  filterSearch(text) {
    if (text === '') {
      this.setState({restaurants: this.state.clone});
    } else {
      const newData = this.state.clone.filter(item => {
        const itemData = item.name.toLowerCase();
        const textData = text.toLowerCase();
        return itemData.includes(textData);
      });
      this.setState({
        restaurants: newData.length > 0 ? newData : this.state.clone,
      });
    }
  }
  //Asia/Jerusalem
  getExpectedTime = time => {
    let minsToadd = time;
    if (minsToadd !== '') {
      let dateTime = momenttz
        .tz('Asia/Jerusalem')
        .add(minsToadd, 'minutes')
        .format();
      let timeTemp = dateTime.replace('T', ' ');
      let splited = timeTemp.split('+');
      // console.log(splited[0]);
      return splited[0];
    }
    return `00001-01-01 00:00:00`;
  };

  ordemm = () => {
    // this.getExpectedTime(20);
    // return;
    //console.log("BRANCH ID", this.state.branchId);
    let status = this.state.status;
    //console.log("STATUS:", status);
    const oldSta = status;
    let newStatus = status + 1;
    //////console.log('newStatus', newStatus);
    this.setState({showApprove: false, showp: true});
    const datas = [];
    const minToBeReady = this.state.time;
    const message = this.state.message;
    const bid = this.state.branchId;
    const curTime = this.getExpectedTime(0);
    const exp_date = this.getExpectedTime(minToBeReady);
    Lodash.map(this.state.restaurants, ele => {
      datas.push({
        Id_order: ele.idorder,
        customerfkO: ele.fkcustomerO,
        Expected_date: exp_date,
        Mins: `${minToBeReady}`,
        Message: message,
        Status: newStatus,
        Id_branch: Number(bid),
      });
    });
    //console.log(`datas`, datas);
    const body = JSON.stringify(datas);
    //console.log('body', body);
    const ppp = this.state.token;

    if (oldSta === 1) {
      const data = this.state.clone;
      const paid = data[0].paid;
      const cgUid = data[0].cgUid;
      //console.log(`paid`, paid, cgUid);
      const terminalNumber = this.state.terminalNumber;
      if (paid === 1) {
        if (terminalNumber !== '') {
          const total = this.state.combinePriced;
          //console.log(`total`, total)
          let parstotal = '';
          if (total.toString().includes('.')) {
            parstotal = total.toString().replace('.', '');
          } else {
            parstotal = `${total.toString()}00`;
          }
          //console.log(`parstotal`, parstotal)
          //const timeformat = `${this.state.convertTime}:${time}:00`
          const sendXml = `<ashrait><request><version>2000</version><language>ENG</language><dateTime>${curTime}</dateTime><command>doDeal</command><requestId></requestId><doDeal><terminalNumber>${terminalNumber}</terminalNumber><cardNo></cardNo><cardExpiration></cardExpiration><cvv></cvv><total>${parstotal}</total><transactionType>Debit</transactionType><creditType>RegularCredit</creditType><currency>ILS</currency><transactionCode>Phone</transactionCode><validation>AutoCommRelease</validation><cgUid>${cgUid}</cgUid><customerData/></doDeal></request></ashrait>`;
          //console.log(`sendXml`, sendXml)
          fetch(
            `${Pref.CreditCardUrl}?int_in=${sendXml}&sessionId=${
              this.state.cardSessionID
            }`,
            {method: Pref.methodPost},
          )
            .then(response => {
              return response.text();
            })
            .then(out => {
              this.setState({smp: false});
              const parsexml = xml2js
                .parseStringPromise(out, {
                  explicitArray: false,
                })
                .then(result => {
                  const {ashrait} = result;
                  const {response} = ashrait;
                  const {message, doDeal} = response;
                  //console.log(`message`, message, result);
                  if (message === `Permitted transaction`) {
                    Helper.networkHelperTokenPost(
                      Pref.UpdateStatusUrl,
                      body,
                      Pref.methodPost,
                      ppp,
                      result => {
                        //////console.log(result);
                        if (newStatus === 4) {
                          NavigationActions.goBack();
                        }
                        if (oldSta === 1) {
                          if (this.state.printmodeon) {
                            this.printText();
                          }
                        }
                        this.setState({
                          showApprove: false,
                          showp: false,
                          status: newStatus,
                          firstTime: false,
                        });
                      },
                      error => {
                        this.setState({showApprove: false, showp: false});
                      },
                    );
                  }
                });
            })
            .catch(e => {
              console.log(`e`, e);
            });
        }
      } else {
        Helper.networkHelperTokenPost(
          Pref.UpdateStatusUrl,
          body,
          Pref.methodPost,
          ppp,
          result => {
            //console.log("RESULT 1" ,body);
            if (newStatus === 4) {
              NavigationActions.goBack();
            }
            if (oldSta === 1) {
              if (this.state.printmodeon) {
                this.printText();
              }
            }
            this.setState({
              showApprove: false,
              showp: false,
              status: newStatus,
              firstTime: false,
            });
          },
          error => {
            //console.log("ERROR",error);
            this.setState({showApprove: false, showp: false});
          },
        );
      }
    } else {
      Helper.networkHelperTokenPost(
        Pref.UpdateStatusUrl,
        body,
        Pref.methodPost,
        ppp,
        result => {
          //console.log("RESULT 2",result);
          if (newStatus === 4) {
            NavigationActions.goBack();
          }
          if (oldSta === 1) {
            if (this.state.printmodeon) {
              this.printText();
            }
          }
          this.setState({
            showApprove: false,
            showp: false,
            status: newStatus,
            firstTime: false,
          });
        },
        error => {
          //console.log("ERROR2:", error);
          this.setState({showApprove: false, showp: false});
        },
      );
    }
  };

  last3digitorder() {
    var orderid = this.state.idxx.toString();
    const size = orderid.length;
    if (size > 3) {
      const start = size - 2;
      return orderid.substr(start - 1, size);
    } else {
      return orderid;
    }
  }

  decline = () => {
    this.setState({showDecline: false, showp: true});
    const datas = [];
    //const time = this.state.time;
    const newmsg = (this.state.status) === -2 ?  "" : declineMsg || '';    
    const message = this.state.message + newmsg;
    const bid = this.state.bid;
    const customerfkOx = this.state.customerfkO;
    const curTime = this.getExpectedTime(0);
    //const timeformat = `${this.state.convertTime}:00:00`;

    Lodash.map(this.state.restaurants, ele => {
      datas.push({
        Id_order: ele.idorder,
        customerfkO: ele.fkcustomerO,
        Expected_date: curTime,
        //Expected_date: "",
        Mins: '1',
        Message: message,
        Status: -1,
        Id_branch: Number(bid),
      });
    });
    const body = JSON.stringify(datas);
    //console.log('body', body);
    const ppp = this.state.token;

    const data = this.state.clone;
    const paid = data[0].paid;
    const cgUid = data[0].cgUid;
    //console.log(`paid`, paid, cgUid);
    const terminalNumber = this.state.terminalNumber;
    if (paid === 1) {
      if (terminalNumber !== '') {
        //1
        //Moment().format('YYYY-MM-DD HH:MM')
        const sendXml = `<ashrait><request><command>cancelDeal</command><requesteId></requesteId><dateTime/><version>2000</version><language>Eng</language><cancelDeal><terminalNumber>${terminalNumber}</terminalNumber><cgUid>${cgUid}</cgUid></cancelDeal></request></ashrait>`;
        console.log(`sendXml`, sendXml);
        fetch(
          `${Pref.CreditCardUrl}?int_in=${sendXml}&sessionId=${
            this.state.cardSessionID
          }`,
          {method: Pref.methodPost},
        )
          .then(response => {
            return response.text();
          })
          .then(out => {
            this.setState({smp: false});
            const parsexml = xml2js
              .parseStringPromise(out, {
                explicitArray: false,
              })
              .then(result => {
                const {ashrait} = result;
                const {response} = ashrait;
                const {message, cancelDeal, additionalInfo} = response;
                //console.log(`message`, message, additionalInfo);
                if (additionalInfo.toString().includes('SUCCESS')) {
                  Helper.networkHelperTokenPost(
                    Pref.UpdateStatusUrl,
                    body,
                    Pref.methodPost,
                    ppp,
                    result => {
                      this.setState({showp: false});
                      //console.log(result);
                      NavigationActions.goBack();
                    },
                    error => {
                      this.setState({showp: false});
                    },
                  );
                }
              });
          })
          .catch(e => {
            console.log(`e`, e);
          });
      }
    } else {
      Helper.networkHelperTokenPost(
        Pref.UpdateStatusUrl,
        body,
        Pref.methodPost,
        ppp,
        result => {
          this.setState({showp: false});
          console.log(result);
          NavigationActions.goBack();
        },
        error => {
          this.setState({showp: false});
        },
      );
    }
  };

  locationOpen = () => {
    const data = this.state.clone;
    const lat = data[0].geolat;
    const lng = data[0].geolng;
    const scheme = Platform.select({ios: 'maps:0,0?q=', android: 'geo:0,0?q='});
    const latLng = `${lat},${lng}`;
    const label = 'Callit';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (this.state.ogData.address === '') {
      Linking.openURL(url);
    }
  };


  getTitle = (status) =>
  {
    if(status === 1)
      return `הזמנה ממתינה`;
    if(status === 2)
      return 'הזמנה בטיפול';
    if(status === 3 )
      return 'הזמנה מוכנה';
    if(status === 4)
      return 'הזמנה הסתיימה';
    if(status === -2 || status === -1)
      return 'הזמנה בוטלה';
    return 'הזמנה';
  }
  
  render() {
    
    return (
      <Screen
        style={{
          backgroundColor: 'white',
        }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationBar
          styleName="inline no-border"
          style={{
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
            },
          }}
          rightComponent={
            <Subtitle
              style={{
                color: '#292929',
                alignSelf: 'flex-start',
                fontSize: 15,
                fontWeight: '700',
                marginStart: sizeWidth(6.5),
              }}>{`מספר הזמנה: ${this.last3digitorder()}`}</Subtitle>
          }
          leftComponent={
            <View style={{marginStart: 12, flexDirection: 'row'}}>
              <TouchableOpacity onPress={() => NavigationActions.goBack()}>
                <Icons
                  name="arrow-forward"
                  size={28}
                  style={{marginEnd: 12, alignSelf: 'center'}}
                />
              </TouchableOpacity>
              <Heading
                style={{
                  fontSize: 20,
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontWeight: '700',
                  alignSelf: 'center',
                }}>
                {this.getTitle(this.state.status)}
              </Heading>
            </View>
          }
        />
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}>
          <View
            styleName="vertical"
            style={{
              backgroundColor: 'white',
            }}>
            {this.state.status === -2 ? (
              <Subtitle
                style={{
                  color: 'red',
                  alignSelf: 'flex-start',
                  fontSize: 15,
                  fontWeight: '700',
                  marginStart: sizeWidth(3),
                  lineHeight: 32,
                }}>{`הזמנה זו בוטלה על ידי הלקוח`}</Subtitle>
            ) : null}

            <DummyLoader
              visibilty={this.state.progressView}
              center={
                this.state.restaurants != null &&
                this.state.restaurants.length > 0 &&
                this.state.restaurants !== undefined ? (
                  <FlatList
                    extraData={this.state}
                    showsVerticalScrollIndicator={true}
                    showsHorizontalScrollIndicator={false}
                    data={this.state.displayList}
                    nestedScrollEnabled={true}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={({item: item, index}) =>
                      this.renderRow(item, index)
                    }
                  />
                ) : null
              }
            />
            {this.state.restaurants != null &&
            this.state.restaurants.length > 0 &&
            this.state.restaurants !== undefined ? (
              <View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#dedede',
                    marginVertical: sizeHeight(1),
                  }}
                />
                <View
                  style={{
                    flexDirection: 'column',
                    marginVertical: sizeHeight(0.4),
                    marginHorizontal: sizeWidth(3.7),
                  }}>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'flex-start',
                      fontSize: 15,
                    }}>{`שם לקוח: ${this.state.ogData.name}`}</Subtitle>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      const phoneNumber = this.state.ogData
                        .customertelephone;
                      Linking.openURL(`tel:${phoneNumber}`);
                    }}>
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                      }}>
                      {`פלאפון: `}
                      <Subtitle
                        style={{
                          color: '#3daccf',
                          fontFamily: 'Rubik',
                          alignSelf: 'flex-start',
                          fontSize: 15,
                        }}>{`${
                        this.state.ogData.customertelephone
                      }`}</Subtitle>
                    </Subtitle>
                  </TouchableWithoutFeedback>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                      }}>
                      כתובת:{' '}
                      <TouchableWithoutFeedback onPress={this.locationOpen}>
                        <Subtitle
                          style={{
                            color: '#6DC124',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 15,
                          }}>
                          {this.state.ogData.address !== ''
                            ? `${this.state.ogData.address}`
                            : this.state.ogData.isdelivery === 1 ? 'נשלחה מיקום הלקוח, לבדוק במפה' : 'איסוף עצמי'
                            }
                        </Subtitle>
                      </TouchableWithoutFeedback>
                    </Subtitle>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        const data = this.state.clone;
                        const lat = data[0].geolat;
                        const lng = data[0].geolng;
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
                          marginEnd: 4,
                        }}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                  {this.state.ogData.deliveryprice !== undefined &&
                  this.state.ogData.deliveryprice !== null &&
                  this.state.ogData.deliveryprice !== '' &&
                  Number(this.state.ogData.deliveryprice > 0) ? (
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontWeight: '400',
                        fontSize: 15,
                      }}>{`עלות משלוח: ₪${
                      this.state.ogData.deliveryprice
                    }`}</Subtitle>
                  ) : null}
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'flex-start',
                      fontSize: 15,
                    }}>
                    {`סכום לתשלום:`}{' '}
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontWeight: '700',
                        fontSize: 15,
                      }}>{`₪${this.state.combinePriced}`}</Subtitle>
                  </Subtitle>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'flex-start',
                      fontSize: 15,
                    }}>
                    {`אמצעי תשלום: `}
                    <Subtitle
                      style={{
                        color: 'red',
                        fontFamily: 'Rubik',
                        fontSize: 15,
                      }}>
                      {this.state.ogData.paid === 0 ? 'מזומן' : 'אשראי'}
                    </Subtitle>
                  </Subtitle>
                  {this.state.shovar !== '' ? (
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 15,
                      }}>
                      {`מספר שובר: `}
                      <Subtitle
                        style={{
                          color: 'orange',
                          fontFamily: 'Rubik',
                          fontSize: 15,
                        }}>
                        {this.state.shovar}
                      </Subtitle>
                    </Subtitle>
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {this.state.ogData.orderdate !== undefined &&
                    this.state.ogData.orderdate !== '' &&
                    this.state.ogData.orderdate !== null ? (
                      <Subtitle
                        style={{
                          color: '#292929',
                          fontFamily: 'Rubik',
                          alignSelf: 'flex-start',
                          fontWeight: '600',
                          fontSize: 15,
                        }}>{`תאריך הזמנה: ${Moment(
                        this.state.ogData.orderdate,
                      ).format('YYYY/DD/MM HH:mm')}`}</Subtitle>
                    ) : null}
                    <TouchableWithoutFeedback onPress={this.printText}>
                      <Icons
                        name={'print'}
                        size={28}
                        style={{
                          alignSelf: 'center',
                          padding: 4,
                          marginEnd: 4,
                        }}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              </View>
            ) : null}
            {!this.state.mode ? (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#dedede',
                    marginVertical: sizeHeight(1),
                  }}
                />
                {Number(this.state.status) !== -2 ? (
                  <View>
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontSize: 16,
                        marginTop: sizeHeight(1),
                        marginHorizontal: sizeWidth(4),
                        fontWeight: '400',
                      }}>{`כמה זמן יקח? (בדקות) - אופציונלי`}</Subtitle>
                    <View
                      styleName="horizontal"
                      style={{
                        flexDirection: 'row-reverse',
                        marginVertical: sizeHeight(1),
                        marginHorizontal: sizeWidth(4),
                        borderColor: '#dedede',
                        borderStyle: 'solid',
                        borderWidth: 1,
                        color: '#000000',
                        flex: 8,
                      }}>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({time: '5', wse: oo === 1 ? 0 : 1});
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 1 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 1 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            5
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '10',
                            wse: oo === 2 ? 0 : 2,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 2 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 2 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            10
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '15',
                            wse: oo === 3 ? 0 : 3,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 3 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 3 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            15
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '20',
                            wse: oo === 4 ? 0 : 4,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 4 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 4 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            20
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '30',
                            wse: oo === 5 ? 0 : 5,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 5 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 5 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            30
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '40',
                            wse: oo === 6 ? 0 : 6,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 6 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 6 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            40
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '50',
                            wse: oo === 7 ? 0 : 7,
                          });
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 7 ? '#3daccf' : 'white',
                          }}>
                          <View
                            style={{
                              width: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 7 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 13,
                            }}>
                            50
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          const oo = this.state.wse;
                          this.setState({
                            time: '60',
                            wse: oo === 8 ? 0 : 8,
                          });
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            height: sizeHeight(6.5),
                            width: sizeWidth(10),
                            backgroundColor:
                              this.state.wse == 8 ? '#3daccf' : 'white',
                          }}>
                          <Subtitle
                            style={{
                              color:
                                this.state.wse !== 8 ? '#292929' : 'white',
                              fontSize: 16,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginStart: 5,
                            }}>
                            60
                          </Subtitle>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    <TextInput
                      style={[
                        styles.inputStyle,
                        {
                          height: 42,
                          marginVertical: sizeHeight(1),
                          width: 90,
                          justifyContent: 'center',
                          alignSelf: 'center',
                        },
                      ]}
                      mode={'flat'}
                      //label={"message"}
                      password={false}
                      keyboardType={'number-pad'}
                      value={this.state.time}
                      onChangeText={text => this.setState({time: text})}
                      underlineColor={'transparent'}
                      underlineColorAndroid={'transparent'}
                    />
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontSize: 16,
                        marginTop: sizeHeight(1),
                        marginHorizontal: sizeWidth(4),
                      }}>{`הערה ללקוח - אופציונלי`}</Subtitle>
                    <TextInput
                      style={[styles.inputStyle, {height: 100}]}
                      mode={'flat'}
                      //label={"message"}
                      password={false}
                      returnKeyType="next"
                      multiline={true}
                      value={this.state.message}
                      onChangeText={text => this.setState({message: text})}
                      underlineColor={'transparent'}
                      underlineColorAndroid={'transparent'}
                    />
                  </View>
                ) : null}

                {Number(this.state.status) === -2 ? (
                  <View
                    styleName="horizontal"
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginVertical: sizeHeight(6),
                    }}>
                    <Button
                      styleName=" muted border"
                      mode={'contained'}
                      uppercase={true}
                      dark={true}
                      style={styles.loginButtonStyle}
                      onPress={this.decline}>
                      <Subtitle style={{color: 'white'}}>
                        {'ביטול וסגירת הזמנה'}
                      </Subtitle>
                    </Button>
                  </View>
                ) : Number(this.state.status) === 1 ? (
                  <View
                    styleName="horizontal"
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginVertical: sizeHeight(6),
                    }}>
                    <Button
                      styleName=" muted border"
                      mode={'contained'}
                      uppercase={true}
                      dark={true}
                      style={styles.loginButtonStyle}
                      onPress={() => this.setState({showApprove: true})}>
                      <Subtitle style={{color: 'white'}}>
                        {'אשר הזמנה'}
                      </Subtitle>
                    </Button>
                    <TouchableWithoutFeedback
                      onPress={() => this.setState({showDecline: true})}>
                      <Subtitle
                        style={{
                          color: '#292929',
                          fontSize: 16,
                          alignSelf: 'center',
                          marginHorizontal: sizeWidth(8),
                        }}>
                        בטל הזמנה
                      </Subtitle>
                    </TouchableWithoutFeedback>
                  </View>
                ) : (
                  <Button
                    styleName=" muted border"
                    mode={'contained'}
                    uppercase={true}
                    dark={true}
                    style={[
                      styles.loginButtonStyle,
                      {
                        marginHorizontal: sizeWidth(4),
                        marginVertical: sizeHeight(6),
                      },
                    ]}
                    onPress={this.ordemm}>
                    <Subtitle style={{color: 'white'}}>
                      {this.state.status === 2
                        ? `${word}`
                        : this.state.status === 3
                        ? 'עדכון: ההזמנה טופלה'
                        : this.state.isDelivery
                        ? 'עדכון: ההזמנה מוכנה לאיסוף'
                        : 'עדכון: ההזמנה טופלה'}
                    </Subtitle>
                  </Button>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginVertical: sizeHeight(2),
                  }}>
                  <Checkbox
                    status={
                      this.state.printmodeon ? 'checked' : 'unchecked'
                    }
                    color={'#3daccf'}
                    onPress={() => {
                      const checkers = this.state.printmodeon;
                      this.setState({printmodeon: !checkers}, () => {
                        Pref.setVal(
                          Pref.printon,
                          this.state.printmodeon ? '1' : '0',
                        );
                      });
                    }}
                  />
                  <Subtitle style={{color: '#292929', fontSize: 15}}>
                    {'הדפס עם אישור ההזמנה'}
                  </Subtitle>
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.showApprove}
            style={{backgroundColor: 'white'}}
            onDismiss={() => this.setState({showApprove: false})}>
            <View
              styleName="vertical sm-gutter"
              style={{
                backgroundColor: 'white',
                marginHorizontal: sizeWidth(6),
                flexDirection: 'column',
              }}>
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginVertical: sizeHeight(1.5),
                  marginBottom: sizeHeight(2),
                  paddingBottom: 8,
                }}>
                {'האם אתה בטוח?'}
              </Subtitle>
              <Button
                styleName=" muted border"
                mode={'contained'}
                uppercase={true}
                dark={true}
                style={[
                  styles.loginButtonStyle,
                  {marginVertical: 0, marginHorizontal: sizeWidth(3)},
                ]}
                onPress={this.ordemm}>
                <Subtitle style={{color: 'white'}}>{'כן'}</Subtitle>
              </Button>
              <TouchableWithoutFeedback
                onPress={() => this.setState({showApprove: false})}>
                <Subtitle
                  style={{
                    marginTop: sizeHeight(1.5),
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'center',
                    fontSize: 15,
                    paddingBottom: 8,
                  }}>
                  {'לא'}
                </Subtitle>
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.showDecline}
            onDismiss={() => this.setState({showDecline: false})}>
            <View
              styleName="vertical sm-gutter"
              style={{
                backgroundColor: 'white',
                marginHorizontal: sizeWidth(6),
                flexDirection: 'column',
              }}>
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginVertical: sizeHeight(1.5),
                  marginBottom: sizeHeight(1),
                  paddingBottom: 8,
                }}>
                {`בטל הזמנה`}
              </Subtitle>
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                  paddingBottom: 8,
                }}>
                {'סיבת הסירוב:'}
              </Subtitle>
              <View
                style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button
                  styleName=" muted border"
                  mode={'contained'}
                  uppercase={true}
                  dark={true}
                  style={[
                    styles.loginButtonStyle,
                    {marginVertical: 0, marginHorizontal: sizeWidth(3)},
                  ]}
                  onPress={this.declineWithNothing}>
                  <Subtitle style={{color: 'white'}}>{'כללי'}</Subtitle>
                </Button>
                <Button
                  styleName=" muted border"
                  mode={'contained'}
                  uppercase={true}
                  dark={true}
                  style={[
                    styles.loginButtonStyle,
                    {marginVertical: 0, marginHorizontal: sizeWidth(3)},
                  ]}
                  onPress={this.declineWithBusy}>
                  <Subtitle style={{color: 'white'}}>{'עמוס'}</Subtitle>
                </Button>
                <Button
                  styleName=" muted border"
                  mode={'contained'}
                  uppercase={true}
                  dark={true}
                  style={[
                    styles.loginButtonStyle,
                    {marginVertical: 0, marginHorizontal: sizeWidth(3)},
                  ]}
                  onPress={this.declineWithOutOfStock}>
                  <Subtitle style={{color: 'white'}}>{'לא במלאי'}</Subtitle>
                </Button>
              </View>
              <TouchableWithoutFeedback
                onPress={() => this.setState({showDecline: false})}>
                <Subtitle
                  style={{
                    marginTop: sizeHeight(5),
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'center',
                    fontSize: 18,
                    paddingBottom: 8,
                  }}>
                  {'חזור'}
                </Subtitle>
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        </Portal>

        <Loader isShow={this.state.showp} />
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
    marginHorizontal: sizeWidth(4),
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: '700',
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: sizeWidth(2),
    backgroundColor: '#3daccf',
    textAlign: 'center',
    margin: 0,
  },
});
