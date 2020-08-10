import React from 'react';
import {
  FlatList,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Image,
  Caption,
  Divider,
  Heading,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
} from '@shoutem/ui';
import {
  Card,
  Button,
  Checkbox,
  Dialog,
  Portal,
  Colors,
  TextInput,
} from 'react-native-paper';
import DummyLoader from '../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import * as Lodash from 'lodash';
import StarRating from 'react-native-star-rating';
import {SafeAreaView} from 'react-navigation';

export default class ReviewsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 0,
      selected: 0,
      progressView: false,
      eachTabData: [],
      item: null,
      reviewinput: '',
      rating: 0,
      token: '',
    };
  }

  componentDidMount() {
    const {state} = this.props.navigation;
    const data = state.params.item;
    this.setState({item: data, progressView: false});
    //this.fetchReviews();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({progressView: true});
      this.fetchReviews();
    });
  }

  componentWillUnmount() {
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
  }

  /**
   * Fetch All reviews
   */
  fetchReviews() {
    Pref.getVal(Pref.bBearerToken, value => {
      const token = Helper.removeQuotes(value);
      ////////console.log(token);
      this.setState({token: token});
      Helper.networkHelperToken(
        Pref.GerReviewsUrl + this.state.item.idbranch,
        Pref.methodGet,
        token,
        result => {
          //////console.log('reviews', result);
          this.setState({
            branches: result.branches,
            progressView: false,
            eachTabData: result,
          });
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  renderRow(item, index) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginHorizontal: sizeWidth(5),
          marginVertical: sizeHeight(1),
        }}>
        <Card elevation={0} style={{borderColor: '#dedede', borderWidth: 1}}>
          <StarRating
            disabled={true}
            emptyStar={'ios-star-outline'}
            fullStar={'ios-star'}
            halfStar={'ios-star-half'}
            iconSet={'Ionicons'}
            maxStars={5}
            starSize={18}
            buttonStyle={{margin: 4}}
            halfStarEnabled={true}
            containerStyle={{
              justifyContent: 'flex-start',
            }}
            rating={item.rating}
            fullStarColor={'#EFCE4A'}
          />
          <View style={{flexDirection: 'column'}}>
            <Title
              styleName="bold"
              style={{
                color: '#777777',
                fontFamily: 'Rubik',
                fontSize: 16,
                marginStart: 4,
                marginEnd: 4,
                textAlign: 'justify',
                alignSelf: 'flex-start',
                fontWeight: '400',
              }}>
              {item.content}
            </Title>
            <Subtitle
              style={{
                color: '#BEBEBE',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 12,
                marginStart: 4,
                fontWeight: '400',
              }}>
              {item.date}
            </Subtitle>
          </View>
        </Card>
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <Screen style={styles.maincontainer}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}>
            {this.state.item !== null && this.state.item !== undefined ? (
              <Image
                styleName="large-wide"
                style={{height: sizeHeight(24)}}
                source={{uri: `${Pref.BASEURL}${this.state.item.imageurl}`}}
                //source={{ uri: 'https://picsum.photos/700' }}
              />
            ) : null}
            <View
              style={{position: 'absolute', backgroundColor: 'transparent'}}>
              <NavigationBar
                styleName="inline no-border clear"
                leftComponent={
                  <View
                    styleName="horizontal space-between"
                    style={{marginStart: 12}}>
                    <TouchableOpacity
                      onPress={() => NavigationActions.goBack()}>
                      <Icon
                        name="arrow-forward"
                        size={36}
                        color="#292929"
                        style={{
                          padding: 4,
                          backgroundColor: 'transparent',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
            <View>
              {this.state.item !== null && this.state.item !== undefined ? (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                  }}>
                  <Title
                    styleName="bold"
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 20,
                      alignSelf: 'flex-start',
                      fontWeight: '700',
                      marginStart: sizeWidth(4),
                      paddingHorizontal: sizeWidth(1),
                      paddingVertical: sizeHeight(1.5),
                    }}>
                    
                    {this.state.item.name}
                  </Title>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#dedede',
                      marginVertical: sizeHeight(0.5),
                    }}
                  />
                </View>
              ) : null}

              <DummyLoader
                visibilty={this.state.progressView}
                center={
                  this.state.eachTabData.length > 0 ? (
                    <FlatList
                      extraData={this.state}
                      nestedScrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={true}
                      data={this.state.eachTabData}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        this.renderRow(item, index)
                      }
                    />
                  ) : (
                    <Subtitle
                      style={{
                        alignSelf: 'center',
                      }}>
                      {'...אין ביקורות כרגע'}
                    </Subtitle>
                  )
                }
              />
            </View>
          </ScrollView>
        </Screen>
      </SafeAreaView>
    );
  }
}

/**
 * styles
 */
const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputStyle: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 16,
    height: 150,
    marginHorizontal: sizeWidth(4),
    fontWeight: '700',
    textAlignVertical: 'top',
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: 6,
    marginTop: sizeHeight(2),
    marginHorizontal: sizeWidth(4),
    backgroundColor: '#3daccf',
    textAlign: 'center',
  },
});
