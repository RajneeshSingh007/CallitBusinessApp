import React from "react";
import { StatusBar, StyleSheet, Text } from "react-native";
import { Image, Screen, Subtitle, View,Heading,Icon } from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Button, Snackbar, Menu,Divider  } from "react-native-paper";
import messaging from '@react-native-firebase/messaging';

import FloatingLabelInput from '../Component/FloatingLabelInput';

import momenttz from 'moment-timezone';
//import Icon from "react-native-vector-icons/MaterialIcons";
import { sizeWidth, sizeHeight } from "../util/Size";

export default class BusinessWelcomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      progressView: false,
      message: "",
      visible:false,
      type:'עסק',
    };
  }

  componentDidMount(){
    try {
      Helper.requestPermissions();
    } catch (e) {
      ////console.log(e);
    }
  }

  getUserNameWithType(selected_ut)
  {
    //console.log(selected_ut);
    if(selected_ut === "עסק")
    {
      return "us-" +this.state.username;
    }
    return "ud-" + this.state.username;
  }
  
  registerTime = () =>
  {
    let dateTime = momenttz.tz('Asia/Jerusalem').add(1, 'months').format(momenttz.HTML5_FMT.DATE);
    //let dateTime = momenttz.tz('Asia/Jerusalem').add(1, 'days').format(momenttz.HTML5_FMT.DATE);
    return dateTime;
  }

  closeMenu = () => this.setState({visible: false});
  openMenu = () => this.setState({visible:true});
  /**
   * signIn
   */
  signIn(selected_ut) {
    let dateLogin = this.registerTime();
    if (this.state.username === "" && this.state.password === "") {
      this.setState({ message: "נא למלא שם משתמש וסיסמא" });
    } else if (this.state.username === "") {
      this.setState({ message: "נא למלא שם משתמש" });
    } else if (this.state.password === "") {
      this.setState({ message: "נא למלא סיסמא" });
    } else {
      this.setState({ progressView: true });
      messaging().getToken()
        .then(fcmToken => {
          //console.log('fcmToken', fcmToken);
          if (fcmToken) {
            const jsonData = JSON.stringify({
              "username": this.getUserNameWithType(selected_ut),
              "password": this.state.password,
              "deviceid": fcmToken
            });
            //added  selected_ut.type === "עסק" ? Pref.UserOwnerLoginUrl : Pref.UserDilveryLoginUrl
            Helper.networkHelperTokenPost( selected_ut === "עסק" ? Pref.UserOwnerLoginUrl : Pref.UserDilveryLoginUrl, jsonData, Pref.methodPost,
            Pref.LASTTOKEN,
               (result) => {
              this.setState({ progressView: false });
              //console.log('result', result);
              if (Helper.checkJson(result)) {
                const bToken = result["token"];
                if (bToken !== "") {
                  //set token
                  Pref.setVal(Pref.bBearerToken, bToken);
                  Pref.setVal(Pref.bLoggedStatus, true);
                  Pref.setVal(Pref.dateToLogout,dateLogin);
                  //need to set record for when registered after that each time logged need to check...
                  //after each month kick away
                  
                  //homepage
                  // NavigationActions.navigate('Home');
                  Helper.itemClick(this.props, "HomeList");
                } else {
                  this.setState({ message: "ההתחברות נכשלה" });
                }
              } else {
                this.setState({ message: 'משתמש זה מחובר כבר' });
              }

            }, (error) => {
              this.setState({ progressView: false });
              
            });
          } else {
            alert('ההתחברות נכשלה');
            // user doesn't have a device token yet
          }
        });
    }
  };


  anchor = () =>
  {
    const {type} = this.state;
    return (
        <Button onPress={this.openMenu}>
          <Icon name="down-arrow" style={{ color: '#3daccf'}} />
          <Text
            style={{ color: '#3daccf',fontSize: 21}}>
              {type}
          </Text>
          {/* <Image 
            styleName="small"
            style={{ width: 20, height: 20,}} 
            source={require('../res/images/shop.png')} 
          /> */}
        </Button>
    );
  }

  handleType = (type) =>
  {
    // const {type} = this.state;
    if(type === 'עסק')
    {
      this.setState({type:'עסק'});
    }
    else
    {
      this.setState({type:'שליח'});
    }
    this.closeMenu();
  }


  render() {
    // const selected_ut = this.state.selected_ut || this.state.user_type[0];
    const { visible ,type } = this.state;
    return (
      <View style={styles.main}>
        <Screen style={{ backgroundColor: "white", }}>
        <StatusBar barStyle="dark-content" backgroundColor='white'/>
        <View styleName='space-between fill-parent vertical'>
          <Heading styleName='xl-gutter bold v-center h-center' style={{  color: "#292929", fontWeight: '700', fontSize: 24, }}>התחבר למערכת</Heading>
          <View style={{alignContent:'center',alignItems:'center',marginBottom:20, }}>
            <Menu
              visible={visible}
              onDismiss={this.closeMenu}
              anchor={this.anchor()}
            >
              <Menu.Item icon={require('../res/images/shop.png')} onPress={() => this.handleType('עסק')} title='עסק' />
              <Divider />
              <Menu.Item icon={require('../res/images/Tracking.png')} onPress={() => this.handleType('שליח')} title="שליח" />
            </Menu>
          </View>
              
          <FloatingLabelInput 
            label="שם משתמש"
            mode='flat'
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            onChangeText={value => this.setState({ username: value })}
            value={this.state.username}></FloatingLabelInput>
          <View style={{marginTop:16}}>
            <FloatingLabelInput 
              label="סיסמה"
              mode='flat'
              underlineColor='transparent'
              underlineColorAndroid='transparent'
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={value => this.setState({ password: value })}
              value={this.state.password}></FloatingLabelInput>
          </View>          
          <Image
            styleName="md-gutter large-wide v-center h-center"
            source={require('./../res/images/loginbg.png')}/>
          <Button 
            styleName="muted border"
            mode={"flat"}
            uppercase={true}
            dark={true}
            loading={this.state.progressView}
            style={styles.loginButtonStyle}
            onPress={() =>{ this.signIn(type);} }>
            <Subtitle
                style={{ color: "white" }}>{this.state.progressView === true ? "נא להמתין..." :  'התחבר' }</Subtitle>
          </Button>
        
        </View>
        <Snackbar
        visible={
          this.state.message === "" ? false : true
        }
        duration={1000}
        onDismiss={() =>
          this.setState({
            message: ""
          })
        }
        >
          {this.state.message}
        </Snackbar>
      </Screen>
    </View>
    );
  }
}

/**
 * styles
 */
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
    marginHorizontal:24,
    fontWeight: '700',
  },
  loginButtonStyle: {
    color: "white",
    bottom:0,
    paddingVertical:6,
    width:'100%',
    backgroundColor: '#3daccf',
    textAlign: "center"
  },
  main: {
   flex: 1   
  }
});

