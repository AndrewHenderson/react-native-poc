import React, { Component, PropTypes } from 'react';
import { Picker, StyleSheet } from 'react-native';
let PickerItem = Picker.Item;

export default class MyPicker extends Picker {
  render() {
    const { value, onChange, options } = this.props

    return (
      <Picker
        style={styles.picker}
        selectedValue={value}
        onValueChange={onChange}>
        {options.map((val, i) => (
          <PickerItem
            key={i}
            value={val}
            label={val}
          />
        ))}
      </Picker>
    )
  }
}

const styles = StyleSheet.create({
  picker: {
    marginBottom: 0
  }
});

MyPicker.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
