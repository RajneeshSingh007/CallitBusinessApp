import React, { Component } from "react";
import { Subtitle, View } from "@shoutem/ui";

export class EmptyMessage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {this.props.message !== "" ? (
          <Subtitle
            style={{
              fontSize: 20,
              fontWeight: "200"
            }}
          >
            {this.props.message}
          </Subtitle>
        ) : null}
      </View>
    );
  }
}
