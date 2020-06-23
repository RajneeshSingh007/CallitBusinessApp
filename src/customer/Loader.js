import React, { Component } from "react";
import { Colors, Modal } from "react-native-paper";
import { Spinner, Subtitle, View } from "@shoutem/ui";

export class Loader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal
        onDismiss={this.props.isShow}
        dismissable={true}
        visible={this.props.isShow}
      >
        <View
          style={{
            borderRadius: 8,
            backgroundColor: "white",
            padding: 24,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Spinner
            size="large"
            style={{
              margin: 8
            }}
            color={Colors.red500}
          />
          <Subtitle
            style={{
              fontSize: 20,
              fontWeight: "200"
            }}
          >
            אנא המתן...
					</Subtitle>
        </View>
      </Modal>
    );
  }
}
