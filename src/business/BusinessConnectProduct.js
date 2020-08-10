import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Checkbox, Colors, Portal } from "react-native-paper";
import { Divider, Row, Subtitle, TextInput, TouchableOpacity, View } from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import Placeholder from "rn-placeholder";
import * as Animatable from "react-native-animatable";
import * as Pref from "./../util/Pref";
import MaterialTabs from "react-native-material-tabs";

export default class BusinessConnectProduct extends React.Component {
  constructor(props) {
    super(props);
    this.renderRowProductCat = this
      .renderRowProductCat
      .bind(this);
    this.state = {
      progressView: true,
      searchVisibility: false,
      tabNames: [
        "Product", "Category"
      ],
      productList: [],
      productClone: [],
      catList: [],
      catClone: [],
      selectedTab: 0,
      selectedItem: []
    };
  }

  componentDidMount() {
    this.fetchAllProducts();
  }

  /**
   * Fetch all products
   */
  fetchAllProducts() {
    this.setState({ progressView: true });
    Pref.getVal(Pref.bBearerToken, (value) => {
      const removeQuotes = Helper.removeQuotes(value);
      const val = 0;
      Pref.getVal(Pref.bId, value => {
        Helper.networkHelperToken(Pref.FetchServicesUrl + value, Pref.methodGet, removeQuotes, (result) => {
          let allData = [];
          for (let i = 0; i < result.length; i++) {
            const imagelink = Pref.BASEURL + result[i]["imageUrl"];
            allData.push({
              idservice: result[i]["idservice"],
              name: result[i]["name"],
              description: result[i]["description"],
              price: result[i]["price"],
              multipliable: result[i]["multipliable"],
              imageUrl: imagelink,
              discountPrice: result[i]["discountPrice"],
              available: result[i]["available"],
              fkbranchS: result[i]["fkbranchS"],
              discountStart: result[i]["discountStart"],
              discountEnd: result[i]["discountEnd"],
              category: result[i]["category"],
              fkbranchSNavigation: result[i]["fkbranchSNavigation"],
              serviceExtra: result[i]["serviceExtra"]
            });
          }
          this.setState({ progressView: false, productList: allData, productClone: allData });
        }, (error) => {
          this.setState({ progressView: false });
        });
      });
    });
  }

  /**
   * search products
   * @param {Search} text
   */
  filterConnectSearch(text) {
    if (text === "") {
      if (this.state.selectedTab == 0) {
        this.setState({ productList: this.state.productClone });
      } else {
        this.setState({ catList: this.state.catClone });
      }
    } else {
      const newData = this.state.selectedTab == 0
        ? this
          .state
          .productClone
          .filter((item) => {
            const itemData = item
              .name
              .toLowerCase();
            return itemData.includes(text.toLowerCase());
          })
        : this
          .state
          .catClone
          .filter((item) => {
            const itemData = item
              .name
              .toLowerCase();
            return itemData.includes(text.toLowerCase());
          });
      if (this.state.selectedTab == 0) {
        this.setState({
          productList: newData.length > 0
            ? newData
            : this.state.productClone
        });
      } else {
        this.setState({
          catList: newData.length > 0
            ? newData
            : this.state.catClone
        });
      }
    }
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRowProductCat(rowData, index) {
    return (
      <Row>
        <View styleName='vertical v-start h-start'>
          <Subtitle numberOfLines={1} styleName='bold'>{rowData.name}</Subtitle>
        </View>
                                       <Checkbox.Android
                                 uncheckedColor={'#dedede'}

          status={this
            .state
            .selectedItem
            .find(rowData.idservice)
            ? "checked"
            : "unchecked"}
          color={Colors.orange500}
          onPress={() => {
            const cloneds = this.state.selectedItem;
            const filter = cloneds.splice(rowData.idservice);
            this.setState({ selectedItem: filter });
            alert(this.state.selectedItem);
          }}/>
      </Row>
    );
  }

  setTab = selectedTab => {
    this.setState({ selectedTab });
  };

  render() {
    return (
      <Portal>
        <View
          styleName='horizontal'
          style={{
            flex: 0.1
          }}>
          <TouchableOpacity
            style={{
              alignSelf: "center"
            }}
            onPress={() => this.setState({
              searchVisibility: !this.state.searchVisibility
            })}>
            <Icon
              name="search"
              size={28}
              color="black"
              style={{
                alignSelf: "center",
                padding: 4,
                backgroundColor: "transparent"
              }}/>
          </TouchableOpacity>
          {this.state.searchVisibility === true
            ? <Animatable.View
              animation='slideInRight'
              style={{
                backgroundColor: "transparent",
                flexGrow: 1,
                alignSelf: "center"
              }}>
              <TextInput
                placeholder={"search category..."}
                style={{
                  backgroundColor: "transparent"
                }}
                onChangeText={(text) => this.filterSearch(text)}/>
            </Animatable.View>
            : <Animatable.View
              animation='slideInLeft'
              style={{
                backgroundColor: "transparent",
                flexGrow: 1,
                alignSelf: "center"
              }}>
              <View
                style={{
                  backgroundColor: "transparent",
                  flexGrow: 1,
                  alignSelf: "center"
                }}/>
            </Animatable.View>}
        </View>
        <Divider styleName="line"/>
        <SafeAreaView>
          <MaterialTabs
            items={this.state.tabNames}
            selectedIndex={this.state.selectedTab}
            activeTextStyle={{
              fontWeight: "bold"
            }}
            barColor="#1fbcd2"
            indicatorColor="#fffe94"
            scrollable={true}
            activeTextColor={Colors.white}
            onChange={this.setTab}/>
        </SafeAreaView>
        <Placeholder.Line
          size={80}
          animate="fade"
          lineNumber={5}
          lineSpacing={6}
          lastLineWidth="40%"
          onReady={!this.state.progressView}>
          <FlatList
            extraData={this.state}
            data={this.state.selectedTab == 0
              ? this.state.productList
              : this.state.catList}
            ItemSeparatorComponent={() => {
              return (<Divider styleName="line"/>);
            }}
            keyExtractor={(item, index) => item.name}
            renderItem={({ item: item, index }) => this.renderRowProductCat(item, index)}/>
        </Placeholder.Line>
      </Portal>
    );
  }
}
