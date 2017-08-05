import React, { Component } from 'react';

import { TextInput } from '@shoutem/ui';

class Input extends Component {
  render() {
    const { props } = this;
    const style = {
      ...props.style
    };
    
    delete style.underlineColorAndroid;
    delete style.textShadowRadius;

    return (
      <TextInput
        {...props}
        style={style}
        placeholderTextColor={props.style.placeholderTextColor}
        underlineColorAndroid={props.style.underlineColorAndroid}
      />
    );
  }
}

Input.propTypes = {
  style: React.PropTypes.object,
};

Input.defaultProps = {
  padding:10,
  style:{
    placeholderTextColor:'#fff',
  }
};

export default Input;
