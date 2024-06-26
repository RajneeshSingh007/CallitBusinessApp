import React from "react";
import {
	createAppContainer,
	createStackNavigator,
	createSwitchNavigator
} from "react-navigation";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { Colors } from "react-native-paper";
import AuthPage from "./../customer/AuthPage";
import BusinessAllProductExtra from "./../business/BusinessAllProductExtra";
import BusinessAllProductList from "./../business/BusinessAllProductList";
import BusinessOrderHistory from "./../business/BusinessOrderHistory";
import BusinessEditAddProducts from "./../business/BusinessEditAddProducts";
import Login from '../business/Login';
import BusinessEditAddExtra from "./../business/BusinessEditAddExtra";
import BusinessProfile from "./../business/BusinessProfile";
import BranchDetailEdit from "./../business/BranchDetailEdit";
import OrderManage from "./../business/OrderManage";
import ReviewsPage from "./../business/ReviewsPage";
import BusinessDelivery from "./../business/BusinessDelivery";
import BusinessGlobalProfile from "./../business/BusinessGlobalProfile";
import {Image,} from "@shoutem/ui";
import HomeList from "../business/HomeList";

const tryBusiness = createStackNavigator(
	{
		//Home:{screen:BusinessHomePage},
		Home: { screen: BusinessHomePage },
		OrderManage:{screen:OrderManage},
	},
	{
		headerMode: "none"
	}
);

const orderManager = createStackNavigator(
	//BusinessOrderHistory
	{
		//Home:{screen:BusinessHomePage},
		BusinessOrderHistory: { screen: BusinessOrderHistory },
		OrderManage: { screen: OrderManage },
	},
	{
		headerMode: "none"
	}
)

const tryBusinessProfile = createStackNavigator(
	{
		BusinessProfile: { screen: BusinessProfile },
		BranchDetailEdit: { screen: BranchDetailEdit },
		ReviewsPage: { screen: ReviewsPage},
		BusinessDelivery: { screen: BusinessDelivery}
	},
	{
		headerMode: "none"
	}
);

const bottomtab = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: tryBusiness,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('../res/images/home.png')}
            tintColor={focused ? '#3daccf' : '#292929'}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#3daccf' : '#292929',
            }}
          />
        ),
        tabBarOnPress: ({navigation, defaultHandler}) => {
          //NavigationActions.navigate('Home');
          defaultHandler();
        },
        title: 'בית',
      },
    },
    Products: {
      screen: BusinessAllProductList,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('../res/images/choices.png')}
            tintColor={focused ? '#3daccf' : '#292929'}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#3daccf' : '#292929',
            }}
          />
        ),
        title: 'המוצרים',
      },
    },
    Extras: {
      screen: BusinessAllProductExtra,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('../res/images/party.png')}
            tintColor={focused ? '#3daccf' : '#292929'}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#3daccf' : '#292929',
            }}
          />
        ),
        title: 'תוספות',
      },
    },
    OrderHistory: {
      screen: orderManager,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('../res/images/orders.png')}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#3daccf' : '#292929',
            }}
            tintColor={focused ? '#3daccf' : '#292929'}
          />
        ),
        title: 'היסטוריה',
      },
    },
    Profile: {
      screen: tryBusinessProfile,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('../res/images/avatar.png')}
            tintColor={focused ? '#3daccf' : '#292929'}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#3daccf' : '#292929',
            }}
          />
        ),
        title: 'פרופיל',
      },
    },
  },
  {
    initialRouteName: 'Home',
    shifting: false,
    labeled: true,
    activeTintColor: '#3daccf',
    inactiveTintColor: '#292929',
    tabBarOptions: {
      activeTintColor: '#3daccf',
      inactiveTintColor: '#292929',
    },
    activeTintColor: '#3daccf',
    inactiveTintColor: '#292929',
    backBehavior: 'none',
    barStyle: {backgroundColor: Colors.white},
    resetOnBlur: true,
  },
);

/**
 * Business Login
 */
const bLoginNav = createStackNavigator(
  {
    Login: {screen: Login},
  },
  {
    headerMode: 'none',
  },
);


const businessNav = createStackNavigator(
	{
		HomeList: { screen: HomeList },
		Home: { screen: bottomtab },
		BusinessEditAddProducts: { screen: BusinessEditAddProducts },
		BusinessEditAddExtra: { screen: BusinessEditAddExtra },
		BusinessGlobalProfile: { screen: BusinessGlobalProfile}
	},
	{
		headerMode: "none"
	}
);

/**
 * Business Navigation
 */
const BNavigation = createSwitchNavigator(
	{
		AuthPage: AuthPage,
		Login: bLoginNav,
		Home: businessNav
	},
	{
		initialRouteName: "AuthPage",
		headerMode: "none"
	}
);

export const AppContainer = createAppContainer(BNavigation);
