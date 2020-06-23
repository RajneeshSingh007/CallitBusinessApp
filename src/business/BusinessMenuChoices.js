import React, { Component } from "react";
import {TouchableWithoutFeedback,Alert} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Subtitle, Divider, TouchableOpacity,Image} from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import NavigationActions from "../util/NavigationActions";
import { Provider} from 'react-native-paper';
import{View} from 'react-native';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import {Loader} from './../customer/Loader';
import {sizeHeight,sizeWidth} from './../util/Size'
import PropTypes from 'prop-types';

/**
 * class to display menu
 */
export default class BusinessMenuChoices extends Component {

  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.branch = this.branch.bind(this);
    this.menuRef = null;
    this.state={
      smp:false,
    }
  }


  branch = () =>{
    this.hideMenu();
    NavigationActions.navigate('HomeList');
  }

  logout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        {
          text: 'לא', onPress: () => {
            this.hideMenu();
          }
        },
        {
          text: 'כן', onPress: () => {
            this.hideMenu();
            this.setState({ smp: true });
            Pref.getVal(Pref.bBearerToken, (value) => {
              const vax = Helper.removeQuotes(value);
              Helper.networkHelperToken(Pref.LogOutUrl, Pref.methodPut, vax, (result) => {
                ////console.log("log", result);
                Pref.setVal(Pref.bLoggedStatus, false);
                Pref.setVal(Pref.bBearerToken, null);
                Pref.setVal(Pref.bId, null);
                Pref.setVal(Pref.bData, null);
                this.setState({ smp: false });
                NavigationActions.navigate('Login');
              }, (error) => {
                ////console.log('error', error);
              });
            });
          }
        }
      ]
    );
  }

  hideMenu = () => {
    this.menuRef.hide();
  };

  showMenu = () => {
    this.menuRef.show();
  };

  render() {
    return (
      <View>
        <Menu
          ref={ref => this.menuRef = ref}
          style={{ marginTop: sizeHeight(5) }}
          button={<TouchableWithoutFeedback onPress={this.showMenu}>
            <Image source={require('./../res/images/menu.png')}
              style={{ width: 24, height: 24, }}
            />
          </TouchableWithoutFeedback>}
        >
          
          {this.props.showBranch ? <TouchableWithoutFeedback onPress={this.branch}>
            <View style={{ paddingHorizontal: sizeWidth(6), paddingVertical: sizeHeight(1.5) }}>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                fontWeight: '400'
              }}>{`סניף`}</Subtitle>
            </View>
          </TouchableWithoutFeedback> : null}
          <TouchableWithoutFeedback onPress={() => {
            this.hideMenu();
            NavigationActions.navigate('BusinessGlobalProfile')
            }}>
            <View style={{ paddingHorizontal: sizeWidth(6), paddingVertical: sizeHeight(1.5) }}>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                fontWeight: '400'
              }}>{`עריכת פרטי העסק`}</Subtitle>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={this.logout}>
            <View style={{ paddingHorizontal: sizeWidth(6), paddingVertical: sizeHeight(1.5) }}>
              <Subtitle style={{
                color: '#292929',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 15,
                fontWeight: '400'
              }}>{`התנתקות`}</Subtitle>
            </View>
          </TouchableWithoutFeedback>
        </Menu>
      </View>
    );
  }
}

BusinessMenuChoices.propTypes = {
  showBranch: PropTypes.bool,
};

BusinessMenuChoices.defaultProps = {
  showBranch: true,
};

