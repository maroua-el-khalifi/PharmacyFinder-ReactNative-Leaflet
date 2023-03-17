import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MapViewComponent from './MapViewComponent';
import { Appbar, Card } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { pinStore } from '../models/PinStore';
import { pins } from '../models/Pins';
import BottomSheet, { BottomSheetRefProps } from './BottomSheet';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { Image } from 'react-native';

// This is the main component of the app.
const AppPage = observer((setSelectedPin) => {
  const ref = useRef<BottomSheetRefProps>(null);

  // call the setSelectedPin action method to set the data
  return (
    // This component provides safe area insets to the app content
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, zIndex: 2 }}>
        <View style={styles.container}>
          {/* This component is the header of the app. */}
          <Appbar.Header style={{ backgroundColor: 'white' }}>
            {/* This component represents the title of the header. */}
            <Appbar.Content
              title={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3721/3721710.png' }}
                    style={{ width: 40, height: 40 }}
                  />
                  <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: "#020288" }} >Pharmacy Finder</Text>
                </View>
              }
            />
          </Appbar.Header>
          {/* This component is the main content of the app. */}
          <MapViewComponent />
          {/* Get the data from the pinStore and display it in a Card */}
          {pinStore.name ? (
            <Card style={[styles.card, { zIndex: 0 }]}>
              <Card.Title title={pinStore.name} titleStyle={{ fontSize: 16, fontWeight: 'bold', color: 'green' }} />
              <Card.Content>
                {/* Your data goes here */}
                <Text>{pinStore.adress == null ? "" : pinStore.adress}</Text>
                <Text>{(pinStore.distance && pinStore.duration) == 0 ? "" : pinStore.distance + " m , " + pinStore.duration}</Text>
              </Card.Content>
            </Card>
          ) : null}
          {pins.getAllPins().length > 0 ? (
            <BottomSheet ref={ref}>
              <ScrollView>
                {pins.getAllPins().map((pin, index) => (
                  <TouchableOpacity key={index} onPress={() => {
                    pinStore.setSelectedPin(pin.name, pin.adress, pin.latitude, pin.longitude, pin.distance, pin.duration)
                    if (ref?.current?.isActive()) {
                      ref?.current?.scrollTo(0)
                    } else {
                      ref?.current?.scrollTo(0)
                    }
                  }
                  }>
                    <View style={styles.item}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{pin.name}</Text>
                      <Text>{pin.adress}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BottomSheet>
          ) :
            <BottomSheet ref={ref}>
              <Text style={{ fontSize: 14, alignSelf: 'center', color: 'grey' }}>No Results Found</Text>
            </BottomSheet>
          }
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});

// this is the style of our page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  //Add this style
  card: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    borderRadius: 10,
    elevation: 4,
    zIndex: 1,
  },
  button: {
    height: 50,
    borderRadius: 25,
    aspectRatio: 1,
    backgroundColor: 'white',
    opacity: 0.6,
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default AppPage;
