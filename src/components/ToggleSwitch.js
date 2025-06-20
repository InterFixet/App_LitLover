import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export default function ToggleSwitch({ initial = false, onToggle }) {
  const [isOn, setIsOn] = useState(initial);
  const animation = useRef(new Animated.Value(initial ? 1 : 0)).current;

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);

    Animated.timing(animation, {
      toValue: newState ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (onToggle) onToggle(newState);
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 30], // можно подогнать под твои размеры
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} activeOpacity={0.8}>
      <View style={[styles.switchBase, isOn ? styles.switchOn : styles.switchOff]}>
        <Animated.View style={[styles.circle, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchBase: {
    width: 64,
    height: 34,
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: '#4CD964',
  },
  switchOff: {
    backgroundColor: '#ccc',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});