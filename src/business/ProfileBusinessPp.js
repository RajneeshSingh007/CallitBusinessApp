import React from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Checkbox,
  TextInput,
  Chip,
  Colors,
  Dialog,
  Portal,
  Snackbar,
  Button,
  List,
  Card,
} from 'react-native-paper';
import {
  Caption,
  Divider,
  Heading,
  NavigationBar,
  Row,
  Image,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
  View,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import NavigationAction from './../util/NavigationActions';
import * as Pref from './../util/Pref';
import * as Lodash from 'lodash';
import ProgressiveImage from './../customer/ProgressiveImage';
import DummyLoader from '../util/DummyLoader';
import {Loader} from './../customer/Loader';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import {SafeAreaView} from 'react-navigation';

let tabData = [];

export default class ProfileBusinessPp extends React.Component {
  constructor(props) {
    super(props);
    this.renderTabDataRow = this.renderTabDataRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCatRow = this.renderCatRow.bind(this);
    this.state = {
      progressView: true,
      searchVisibility: false,
      filterView: false,
      clone: [],
      productList: [],
      catList: [],
      longPress: false,
      selectedItem: [],
      selectedCounter: 0,
      token: '',
      showp: false,
      message: '',
      isCatgegoryClicked: 1,
      filterBusiness: '',
      filterCat: '',
      filterPrice: '',
      filterStockk: 0,
      filterStock: false,
    };
  }

  componentDidMount() {
    this.fetchAllProducts();
  }

  componentWillUnmount() {}

  /**
   * Fetch all products
   */
  fetchAllProducts() {
    this.setState({progressView: true});
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      //////console.log(removeQuotes);
      Pref.getVal(Pref.branchId, value => {
        // //////console.log('id', value);
        Helper.networkHelperToken(
          Pref.FetchServicesUrl + value,
          Pref.methodGet,
          removeQuotes,
          result => {
            let groupedExtra = Lodash.groupBy(result, function(exData) {
              if (exData.category !== '') {
                return exData.category;
              }
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              title: key,
              data: groupedExtra[key],
            }));
            this.setState({
              isCatgegoryClicked: 1,
              progressView: false,
              productList: serviceCat,
              clone: result,
              token: removeQuotes,
            });
          },
          error => {
            this.setState({progressView: false});
          },
        );
      });
    });
  }

  onFilterClick = () => {
    const ogData = this.state.clone;
    let sortedData = [];
    if (this.state.filterBusiness !== '') {
      sortedData = ogData.filter(element => {
        return element.name
          .toLowerCase()
          .includes(this.state.filterBusiness.toLowerCase());
      }); //Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
      //////console.log('sorted', 8);
    } else if (this.state.filterCat !== '') {
      sortedData = ogData.filter(element => {
        return element.category
          .toLowerCase()
          .includes(this.state.filterCat.toLowerCase());
      }); //Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
      //////console.log('sorted', 8);
    } else if (this.state.filterPrice !== '') {
      sortedData = ogData.filter(element => {
        return element.price
          .toLowerCase()
          .includes(this.state.filterPrice.toLowerCase());
      }); //Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
    } else {
      sortedData = ogData;
      //////console.log('sorted', 1);
    }
    //////console.log('sortedData', sortedData);
    let groupedExtra = Lodash.groupBy(sortedData, function(exData) {
      if (exData.category !== '') {
        return exData.category;
      }
    });
    const serviceCat = Object.keys(groupedExtra).map(key => ({
      title: key,
      data: groupedExtra[key],
    }));
    this.setState({
      isCatgegoryClicked: 1,
      productList: serviceCat,
      filterPrice: '',
      filterStockk: 1,
      filterBusiness: '',
      filterCat: '',
    });
  };

  /**
   * search products
   * @param {Search} text
   */
  filterSearch(text, mode) {
    if (text === '') {
      this.setState({productList: this.state.clone});
    } else {
      if (mode === false) {
        const newData = Lodash.filter(this.state.clone, item => {
          const itemData = item.name.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
        this.setState({
          productList: newData.length > 0 ? newData : this.state.clone,
        });
      } else {
        const newData = Lodash.filter(this.state.clone, item => {
          const itemData = item.category.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
        this.setState({
          productList: newData.length > 0 ? newData : this.state.clone,
          filterView: false,
        });
      }
    }
  }

  multiClick(rowData) {
    if (this.state.selectedItem.includes(rowData)) {
      this.state.selectedItem.pop(rowData);
      ////////console.log(fx);
      if (this.state.selectedCounter === 1) {
        this.setState({selectedItem: [], selectedCounter: 0, longPress: false});
      } else {
        this.setState({selectedCounter: this.state.selectedCounter - 1});
      }
    } else {
      this.state.selectedItem.push(rowData);
      this.setState({
        selectedCounter: this.state.selectedCounter + 1,
      });
    }
  }

  deleteProduct() {
    const postData = [];
    //////console.log('selecteditem', this.state.selectedItem);
    this.state.selectedItem.map(item => {
      postData.push({integer: item.idservice});
    });
    Alert.alert('Delete Product', 'are you sure want to delete products?', [
      {
        text: 'NO',
        onPress: () => {
          this.setState({
            selectedItem: [],
            selectedCounter: 0,
            longPress: false,
          });
        },
      },
      {
        text: 'YES',
        onPress: () => {
          this.setState({showp: true});
          Pref.getVal(Pref.branchId, value => {
            Helper.networkHelperTokenPost(
              Pref.DeleteServiceUrl + value,
              JSON.stringify(postData),
              Pref.methodPost,
              this.state.token,
              result => {
                this.setState({
                  showp: false,
                  selectedItem: [],
                  selectedCounter: 0,
                  longPress: false,
                  message: result,
                });
                this.fetchAllProducts();
              },
              error => {
                this.setState({showp: false});
              },
            );
          });
        },
      },
    ]);
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRow(item, index) {
    return (
      <View>
        {index == 0 ? (
          <View
            style={{
              height: 1,
              backgroundColor: '#dedede',
            }}
          />
        ) : null}
        <List.Accordion
          title={item.title}
          titleStyle={{
            fontFamily: 'Rubik',
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 25,
            marginStart: sizeWidth(3),
          }}
          style={{paddingVertical: sizeHeight(1.5)}}>
          <FlatList
            extraData={this.state}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={item.data}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => {
              return (
                <View
                  style={{
                    backgroundColor: '#d9d9d9',
                    height: 1,
                  }}
                />
              );
            }}
            keyExtractor={(item, index) => item.idservice.toString()}
            renderItem={({item: eachTabData, index}) =>
              this.renderTabDataRow(eachTabData, index)
            }
          />
        </List.Accordion>
        {this.state.productList.length - 1 === index ? (
          <View
            style={{
              height: 1,
              backgroundColor: '#dedede',
            }}
          />
        ) : null}
      </View>
    );
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderTabDataRow(eachTabData, index) {
    return (
      <View>
        {index === 0 ? (
          <View
            style={{
              backgroundColor: '#d9d9d9',
              height: 1,
            }}
          />
        ) : null}
        <TouchableOpacity styleName="flexible">
          <Row styleName="vertical">
            <Card
              style={{
                marginEnd: sizeWidth(6),
                width: 65,
                height: 65,
                borderColor: '#dedede',
                ...Platform.select({
                  android: {
                    elevation: 2,
                  },
                  default: {
                    shadowColor: 'rgba(0,0,0, .2)',
                    shadowOffset: {height: 0, width: 0},
                    shadowOpacity: 1,
                    shadowRadius: 1,
                  },
                }),
              }}>
              <Image
                source={{uri: `${Pref.BASEURL}${eachTabData.imageUrl}`}}
                style={{
                  width: 65,
                  height: 65,
                  borderTopEndRadius: 8,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderTopStartRadius: 8,
                  borderBottomRightRadius: 8,
                  borderBottomStartRadius: 8,
                  borderBottomEndRadius: 8,
                  borderBottomLeftRadius: 8,
                }}
              />
            </Card>
            <View styleName="vertical">
              <View styleName="horizontal space-between">
                <Title
                  styleName="bold"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                    lineHeight: 25,
                  }}>
                  {Lodash.capitalize(eachTabData.name)}
                </Title>
                <Title
                  styleName="bold"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                    lineHeight: 25,
                  }}>
                  ₪{eachTabData.price}
                </Title>
              </View>
              <View styleName="horizontal space-between">
                <Subtitle
                  styleName="multiline"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    fontWeight: '400',
                    lineHeight: 25,
                  }}>
                  {Lodash.capitalize(eachTabData.description)}
                </Subtitle>
              </View>
            </View>
          </Row>
        </TouchableOpacity>
      </View>
    );
  }
  renderCatRow(rowData, index) {
    return (
      <View>
        <TouchableOpacity>
          <Row>
            <View styleName="vertical v-start h-start">
              <Subtitle numberOfLines={1}>
                {Lodash.capitalize(rowData.category)}
              </Subtitle>
            </View>
          </Row>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <View styleName="vertical" style={styles.maincontainer}>
          <DummyLoader
            visibilty={this.state.progressView}
            center={
              this.state.productList.length > 0 ? (
                <FlatList
                  extraData={this.state}
                  data={this.state.productList}
                  disableVirtualization={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={true}
                  ItemSeparatorComponent={() => {
                    return (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: '#dedede',
                        }}
                      />
                    );
                  }}
                  keyExtractor={(item, index) => {
                    return index.toString();
                  }}
                  renderItem={({item: item, index}) =>
                    this.renderRow(item, index)
                  }
                />
              ) : (
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 14,
                    alignSelf: 'center',
                    fontWeight: '700',
                  }}>
                  ...לא נמצאו מוצרים
                </Subtitle>
              )
            }
          />
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  maincontainer: {flex: 1, backgroundColor: 'white'},
  inputStyle: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: sizeWidth(4),
    color: '#777777',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: sizeWidth(2),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: '#3daccf',
    textAlign: 'center',
  },
});
