import React, { Component } from "react";
import { View } from "react-native";
import {
  Placeholder,
  PlaceholderLine,
  PlaceholderMedia,
  ShineOverlay,
  Shine,
  Progressive,
  
} from "rn-placeholder";
import PropTypes from "prop-types";

export default class DummyLoader extends Component {
  static propTypes = {
    visibilty: PropTypes.bool,
    center: PropTypes.object
  };

  render() {
    const { visibilty, center } = this.props;
    return visibilty ? (
      <View style={{ flex: 1 }}>
        <Placeholder
          style={{ marginHorizontal: 16, marginVertical: 2, marginTop: 8 }}
          Left={PlaceholderMedia}
          Animation={props => <Shine {...props} duration={2500} />}
        >
          <PlaceholderLine width={80} />
          <PlaceholderLine width={65} />
          <PlaceholderLine width={45} />
          <PlaceholderLine width={25} />
        </Placeholder>

        <Placeholder
          style={{ marginHorizontal: 16, marginVertical: 2 }}
          Left={PlaceholderMedia}
          Animation={props => <Shine {...props} duration={2500} />}
        >
          <PlaceholderLine width={80} />
          <PlaceholderLine width={65} />
          <PlaceholderLine width={45} />
          <PlaceholderLine width={25} />
        </Placeholder>

        <Placeholder
          style={{ marginHorizontal: 16, marginVertical: 2 }}
          Left={PlaceholderMedia}
          Animation={props => <Shine {...props} duration={2500} />}
        >
          <PlaceholderLine width={80} />
          <PlaceholderLine width={65} />
          <PlaceholderLine width={45} />
          <PlaceholderLine width={25} />
        </Placeholder>

        <Placeholder
          style={{ marginHorizontal: 16, marginVertical: 2 }}
          Left={PlaceholderMedia}
          Animation={props => <Shine {...props} duration={2500} />}
        >
          <PlaceholderLine width={80} />
          <PlaceholderLine width={65} />
          <PlaceholderLine width={45} />
          <PlaceholderLine width={25} />
        </Placeholder>
      </View>
    ) : (
        center
      );
  }
}
