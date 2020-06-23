import React, { Component } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomNavigation, { FullTab } from "react-native-material-bottom-navigation";

/**
 * class to display bottomTab
 */
export default class BottomTabLoader extends Component {

  /**
   * tab aray
   */
  tabs = [
    {
      key: "home",
      icon: "home",
      label: "Home",
      barColor: "#B71C1C",
      pressColor: "rgba(255, 255, 255, 0.16)"
    }, {
      key: "orders",
      icon: "send",
      label: "Orders",
      barColor: "#B71C1C",
      pressColor: "rgba(255, 255, 255, 0.16)"
    }, {
      key: "fav",
      icon: "favorite",
      label: "Favorites",
      barColor: "#B71C1C",
      pressColor: "rgba(255, 255, 255, 0.16)"
    }, {
      key: "profile",
      icon: "account-circle",
      label: "Profile",
      barColor: "#B71C1C",
      pressColor: "rgba(255, 255, 255, 0.16)"
    }
  ];

  constructor(props) {
    super(props);
    this.state = {
      activeTab: "home"
    };
  }

  renderIcon = icon => ({ isActive }) => (
    <Icon size={24} color="white" name={icon}/>
  );

  renderTab = ({ tab, isActive }) => (
    <FullTab
      isActive={isActive}
      key={tab.key}
      label={tab.label}
      renderIcon={this.renderIcon(tab.icon)}
    />
  );

  /**
   * props
   */
  tabClick(tabKey) {
  }

  render() {
    return (
      <BottomNavigation
        onTabPress={newTab => {
          this.setState({ activeTab: newTab.key });
          if (newTab.key === "home") {
            this.props.tabClick("Home");
          } else if (newTab.key === "profile") {
            this.props.tabClick("Profile");
          } else if (newTab.key === "fav") {
            this.props.tabClick("Fav");
          } else if (newTab.key === "orders") {
            this.props.tabClick("Orders");
          }
        }}
        renderTab={this.renderTab}
        tabs={this.tabs}
        useLayoutAnimation
      />
    );
  }
}
