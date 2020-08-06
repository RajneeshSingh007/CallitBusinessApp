//reacts
import React from 'react';
import {FlatList, StatusBar, Text, AppState, SafeAreaView ,StyleSheet} from 'react-native';
//3rd party comps
import {Heading,  NavigationBar,  Screen,  View,} from '@shoutem/ui';

//utilties
import BusinessMenuChoices from './BusinessMenuChoices';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import { sizeWidth} from './../util/Size';
import NavigationActions from './../util/NavigationActions';
import PushNotificationAndroid from 'react-native-push-android';
//customComps
import OrderCard from '../Component/OrderCard';
// import {Loader} from './../customer/Loader';
//import LoaderInd from '../Component/LoaderInd';
import DoubleTab from '../Component/DoubleTab';
//time+date libraries
import momenttz from 'moment-timezone';
import Moment from 'moment';

export default class BusinessHomePage extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this._notificationEvent = null;
    const dates = Moment().format('YYYY-MM-DD');
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
    this.state = {
      bData: null,
      id: 0,
      progressView: true,
      searchVisibility: false,
      clone: [],
      restaurants: [],
      name: '',
      dates: dates,
      showMenu: false,
      appstate: AppState.currentState,
      token: '',
      branchInfo: {},
      firstTime: false,
      isRightChecked:true,
      // showLoader:false,
      fetched:false,
    };
  }

  componentDidMount() {
    // console.log("MOUNTED COMPONENT");
    AppState.addEventListener('change', this._handleAppStateChange);
    this.willFocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.fetchAllCat();
    });
    this._notificationEvent = PushNotificationAndroid.addEventListener(
      'notification',
      details => {
        PushNotificationAndroid.notify(details);
        this.setState({progressView: true});
        this.fetchAllCat();
        // console.log("remoteNotification => body", details.fcm.body);
      },
    );
  }

  componentWillUnmount() {
    // console.log("COMPONENT UNMOUNTED");
    AppState.removeEventListener('change', this._handleAppStateChange);
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this._notificationEvent !== undefined) {
      this._notificationEvent.remove();
    }
    if (this.willFocusListener !== undefined) {
      this.willFocusListener.remove();
    }
    // this.setState({showLoader:false});
  }

  _handleAppStateChange = async nextAppState => {
    const {appState} = this.state;
    //////console.log('nextAppState -->', nextAppState);
    //////console.log('appState -->', appState);
    if (appState === 'active') {
      // do this
    } else if (appState === 'background') {
      // do that
      this.setState({progressView: true});
      this.fetchOrderData(this.state.id, this.state.dates, this.state.token);
    } else if (appState === 'inactive') {
      // do that other thing
    }
    this.setState({appState: nextAppState});
  };

  /**
   * Fetch all category
   */
  fetchAllCat() {
    // this.setState({showLoader:true});
    // console.log("CALLED ALL CAT");
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Pref.getVal(Pref.branchSelected, value => {
        const pp = JSON.parse(value);
        Helper.networkHelperToken(
          Pref.BusinessDetailUrl + 0, //pp.idbranch,
          Pref.methodGet,
          removeQuotes,
          result => {
            //console.log('info',result);
            Pref.setVal(Pref.bData, JSON.stringify(result));
            Pref.setVal(Pref.bId, result.idbusiness);
            Pref.setVal(Pref.branchId, pp.idbranch);
            this.setState({
              branchInfo: pp,
              token: removeQuotes,
              name: result.name,
              bData: result,
              id: pp.idbranch,
            });
            // console.log("RESULT", result);
            this.fetchOrderData(this.state.id, this.state.dates, removeQuotes);
          },
          error => {
            this.setState({
                progressView: false,
                // showLoader:false,
                fetched:true
              });
          },
        );
      });
    });
  }

  fetchOrderData(id, dates, token) {
    let body;
    if(this.state.isRightChecked)
    {
      let yesterdayDate = momenttz
      .tz('Asia/Jerusalem')
      .subtract(1, 'days')
      .format()
      .split('T')[0];
      let tomorrowDate = momenttz
      .tz('Asia/Jerusalem')
      .add(1, 'days')
      .format()
      .split('T')[0];
      body = JSON.stringify({
        input: yesterdayDate + '?'+ tomorrowDate,
      }); 
    }
    else
    {
      body = JSON.stringify({
        input: '2020-02-16?' + dates,
      });
    }
    
    // const body = JSON.stringify({
    //   input: '2020-02-16?' + dates,
    // });
    
    Helper.networkHelperTokenPost(
      Pref.GetOrdersUrl + id,
      body,
      Pref.methodPost,
      token,
      result => {
        const value = Helper.orderData(result, false, true);
        this.setState({
          clone: value,
          restaurants: value,
          progressView: false,
          firstTime: true,
          // showLoader:false,
          fetched:true,
        });
      },
      error => {
        this.setState({fetched:true});
        //////console.log(error);
      },
    );
  }

  

  renderRow(item) {
    return (
      <OrderCard item={item} onClick={() =>
        NavigationActions.navigate('OrderManage', {
          item: item,
          mode: false,
        })}/>
    );
  }

  handleCheckedRight = (temp) => // true or false
  {
    this.setState({isRightChecked: temp});
    this.fetchAllCat();
  }


  render() {
    return (
      <SafeAreaView
        style={styles.container}>
          
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationBar 
          styleName="inline no-border"
          style={styleNavBar}
          rightComponent={
            <View style={{flexDirection: 'row', marginEnd: sizeWidth(5)}}>
              <BusinessMenuChoices />
            </View>
          }
          leftComponent={
            <View style={{marginStart: 12}}>
              <Heading
                style={styles.heading}>
                {this.state.branchInfo.name}
              </Heading>
            </View>
          }
        />
        <DoubleTab  LeftText={'כל ההזמנות'} RightText={'ההזמנות של היום'} MakeRightChecked={this.handleCheckedRight} />
        
        <View
          styleName="vertical"
          style={styles.listContainer}>
          <FlatList
              extraData={this.state}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={this.state.fetched === true ?  <Text style={{alignSelf:'center'}}>אין הזמנות פעילות..</Text> : null}
              data={this.state.restaurants}
              keyExtractor={(item, index) => item.title.toString()}
              renderItem={({item: item}) =>
                this.renderRow(item, )
              }
          />
          
          {/* <DummyLoader
            visibilty={this.state.progressView}
            center={
              this.state.restaurants.length > 0 ? (
                <FlatList
                  extraData={this.state}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  data={this.state.restaurants}
                  keyExtractor={(item, index) => item.title.toString()}
                  renderItem={({item: item, index}) =>
                    this.renderRow(item, index)
                  }
                />
              ) : (
                <Subtitle style={{alignSelf: 'center'}}>
                  אין הזמנות פעילות...
                </Subtitle>
              )
            }
          /> */}
          {/* <LoaderInd ShowLoader={this.state.progressView}/> */}
        </View>
      </SafeAreaView>
    );
  }
}

const styleNavBar = {
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
};


const styles = StyleSheet.create({
  container:{
    backgroundColor: 'white',flex:1,
  },
  heading:{
    fontSize: 18,
    color: '#292929',
    fontFamily: 'Rubik',
    fontWeight: '700',
    alignSelf: 'center',
  },
  listContainer:{
    flex: 1,
    backgroundColor: 'white',
  },
});