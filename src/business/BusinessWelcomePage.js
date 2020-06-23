import React from "react";
import { StatusBar, StyleSheet,TouchableOpacity } from "react-native";
import { Image, Screen, Subtitle, Title, View,Heading,DropDownMenu } from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Button, Card, Colors, Snackbar, TextInput } from "react-native-paper";
import DeviceInfo from "react-native-device-info";
import messaging from '@react-native-firebase/messaging';

export default class BusinessWelcomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      progressView: false,
      message: "",
      user_type: [
        {
          type: "עסק",
        },
        {
          type: "שליח",
        },
        {
          type:""
        }
      ]
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
    if(selected_ut.type === "עסק")
    {
      return "us-" +this.state.username;
    }
    return "ud-" + this.state.username;
  }
  
  /**
   * signIn
   */
  signIn(selected_ut) {

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
            Helper.networkHelperTokenPost( selected_ut.type === "עסק" ? Pref.UserOwnerLoginUrl : Pref.UserDilveryLoginUrl, jsonData, Pref.methodPost,
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


  render() {
    const selected_ut = this.state.selected_ut || this.state.user_type[0];
    return (
      <View style={styles.main}>
        <Screen style={{ backgroundColor: "white", }}>
        <StatusBar barStyle="dark-content" backgroundColor='white'/>
        <View styleName='space-between fill-parent vertical'>
          <Heading styleName='xl-gutter bold v-center h-center' style={{  color: "#292929", fontWeight: '700', fontSize: 24, }}>התחבר למערכת</Heading>
          <View styleName='v-center h-center'>
            <View >
              <DropDownMenu
                
                options={this.state.user_type}
                selectedOption={selected_ut ? selected_ut : this.state.user_type[0]}
                onOptionSelected={(user_type) => this.setState({ selected_ut: user_type }) }
                titleProperty="type"
              />
              <Subtitle styleName='v-center h-center' style={{ color: '#292929', fontSize: 16,}}>שם משתמש</Subtitle>
            </View>
            
          <TextInput
            mode='flat'
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={styles.inputStyle}
            onChangeText={value => this.setState({ username: value })}
            value={this.state.username}
          />
         <View style={{marginTop:16}}>
              <Subtitle styleName='v-center h-center' style={{ color: '#292929', fontSize: 16 }}>סיסמה</Subtitle>
            <TextInput
              mode='flat'
              underlineColor='transparent'
              underlineColorAndroid='transparent'
              secureTextEntry={true}
              onChangeText={value => this.setState({ password: value })}
              value={this.state.password}
              style={styles.inputStyle}
            />
            </View>
        </View>
        <Image
            styleName="md-gutter large-wide v-center h-center"
            source={require('./../res/images/loginbg.png')}
        />
        <Button 
          styleName="muted border"
          mode={"flat"}
          uppercase={true}
          dark={true}
          loading={this.state.progressView}
          style={styles.loginButtonStyle}
          onPress={() =>{ this.signIn(selected_ut);} }
        >
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

