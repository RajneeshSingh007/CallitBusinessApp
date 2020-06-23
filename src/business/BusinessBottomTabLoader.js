import React, { Component } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomNavigation, { FullTab } from "react-native-material-bottom-navigation";

/**
 * class to display bottomTab
 */
export default class BusinessBottomTabLoader extends Component {

  /**
   * tab aray
   */
  tabs = [
    {
      key: "products",
      icon: "send",
      label: "Products",
      barColor: "#B71C1C"
    },
    {
      key: "extras",
      icon: "send",
      label: "Extras",
      barColor: "#B71C1C"
    },
    {
      key: "orderhistory",
      icon: "favorite",
      label: "Order History",
      barColor: "#B71C1C"
    },
    {
      key: "home",
      icon: "home",
      label: "Home",
      barColor: "#B71C1C"
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
          if (newTab.key === "products") {
            this.props.tabClick("BusinessAllProductList");
          } else if (newTab.key === "home") {
            this.props.tabClick("Home");
          } else if (newTab.key === "extras") {
            this.props.tabClick("BusinessAllProductExtra");
          } else if (newTab.key === "orderhistory") {
            this.props.tabClick("BusinessOrderHistory");
          }
        }}
        renderTab={this.renderTab}
        tabs={this.tabs}
        useLayoutAnimation
      />
    );
  }
}