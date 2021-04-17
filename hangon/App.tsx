import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';

import TopScreen from './src/screens/TopScreen';
import {store} from './src/app/store'

export default function App() {
  return (
    <Provider store={store}>
      <TopScreen></TopScreen>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
