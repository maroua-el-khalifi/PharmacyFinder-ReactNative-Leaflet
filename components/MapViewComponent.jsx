import React, { useState, useEffect, useRef } from 'react';
//make sure to add TextInput and Image in your import
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome, AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { pinStore } from '../models/PinStore.js';
import { pins } from '../models/Pins.js';
import axios from 'axios';

// This component displays a MapView with current location of the user and 3 buttons to zoom in, zoom out and get current location
const MapViewComponent = observer(({ setSelectedPin, addPin, clearPins }) => {
  //ititialize the default location
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // This component is used to create a marker on the map
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [markerCenterCoordinate, setMarkerCenterCoordinate] = useState(null);
  const [countryCode, setCountryCode] = useState("ma");
  const [showCenterMarker, setShowCenterMarker] = useState(false);

  // This useEffect hook is used to get the current location of the user when the component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      //get the currect location
      let location = await Location.getCurrentPositionAsync({});
      //initialize the latitude and longitude variables from the location
      const { latitude, longitude } = location.coords;

      // Use a reverse geocoding API to get the address information
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const dataRegion = await response.json();
      // Get the country code from the address information
      setCountryCode(dataRegion.address.country_code);

      //set the region on the map
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05, //latitudeDelta is the amount of north-to-south distance displayed on the screen
        longitudeDelta: 0.05, //longitudeDelta is the amount of east-to-west distance displayed on the screen.
      });
    })();
  }, []);

  // This function is used to zoom in the map when the zoom in button is pressed
  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
  };

  // This function is used to zoom out the map when the zoom out button is pressed
  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
  };

  // this function is used to get the current location
  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    return { latitude: coords.latitude, longitude: coords.longitude };
  }


  // This function is used to get the current location of the user and set the marker on the map when the location button is pressed
  const handleGetCurrentLocation = async () => {
    setRoute(null);
    setShowDirectionButton(false);  // To hide direction button
    setShowCenterMarker(false);
    setMarkerCenterCoordinate(null);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setMarkerCoordinate({ latitude, longitude });
    } catch (error) {
      console.log(error);
    }
    //setSearchMarkerCoordinate(null);
    setSearchMarkers([]);
    // initialize the pinStrore to make it null
    pinStore.setSelectedPin(null, null, null, null, null, null);
    setSearchText("");
    pins.clearPins()
  };
  //This is our search bar component
  const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
    //This allow us to change the Text variable value while the user is typing
    const handleSearchTextChange = (text) => {
      setSearchText(text);
    };
    //This is the call for the function that will process the search
    const handleSearch = () => {
      onSearch(searchText);
    };
    //This is our search bar that will be displayed on the screen
    return (
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search for a pharmacy"
          value={searchText}
          onChangeText={handleSearchTextChange}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Text>   </Text>
        <FontAwesome name="search" size={18} color="#333" onPress={handleSearch} />
      </View>
    );
  };
  //This is our marker setter for the search result
  //const [SearchmarkerCoordinate, setSearchMarkerCoordinate] = useState(null);
  //This is our marker setter for the Multiple search results
  const [searchMarkers, setSearchMarkers] = useState([]);
  const [searchText, setSearchText] = useState("");
  //This function use OpenStreetMap API to search for a place in the map and get the latitude and longitude of this place then display it in the map
  const handleSearch = async (Text) => {
    setRoute(null);
    pinStore.setSelectedPin(null, null, null, null, null, null);
    pins.clearPins()
    setSearchText('');
    setSearchText(Text);

    //This is our API call based on the searchText entred in the TextInput, latitude and longitude of current Location
    const query = `http://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="pharmacy"]["name"~"${Text}",i](around:1700,${region.latitude},${region.longitude});out;`;
    return axios.get(query)
      .then(response => {
        const pharmacies = response.data.elements.map(element => {

          return {
            name: element.tags.name,
            address: element.tags["addr:street"],
            latitude: element.lat,
            longitude: element.lon
          };
        });
        const markers = pharmacies
          .map(({ name, address, latitude, longitude }) => {
            const distance = Math.sqrt((region.latitude - parseFloat(latitude)) ** 2 + (region.longitude - parseFloat(longitude)) ** 2);
            return { latitude: parseFloat(latitude), longitude: parseFloat(longitude), title: name, description: address, distance };
          })

        // Set the region and search markers
        if (markers.length > 0) {
          setSearchMarkers(markers);
          for (m in markers) {
            pins.addPin(markers[m].title, markers[m].description, markers[m].latitude, markers[m].longitude)
          }
          return markers;
        } else {
          setSearchMarkers([]);
          return null;
        }
      })
      .catch(error => {
        console.log(error);
        return [];
      });

  };

  // directions button 
  const [showDirectionButton, setShowDirectionButton] = useState(false); // the button is false when it's not clicked

  // Fetch the data from the selected pin
  handleMarkerPress = async (title, desc, lat, lon, distance1, duration) => {
    // to get the duration and the distance of selected pharmacy
    const RouteData = await getRoute(region.longitude, region.latitude, markerCoordinate.longitude, markerCoordinate.latitude);
    distance1 = RouteData.distance;
    duration = RouteData.duration > 60 ? (parseInt(RouteData.duration / 60) + " min") : RouteData.duration + " s"; // if the duration is greater than 60 s then change it to min else leave it in sec

    setRoute(null);
    setShowDirectionButton(true);             // the direction button will appear when the user click on the marker (pin)
    pinStore.setSelectedPin(title, desc, lat, lon, distance1, duration);
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });

  };


  // Initialize a cache object to store previously searched locations
  const cache = {};
  // Initialize a state variable to store the list of pharmacies returned from the search
  const [pharmacies, setPharmacies] = useState([]);

  // Define an asynchronous function to search for pharmacies near a given location
  async function findPharmaciesNearby(latitude, longitude) {
    // Check if the current latitude and longitude values already exist in the cache
    const cacheKey = `${latitude},${longitude}`;
    if (cache[cacheKey]) {
      // If the results are already in the cache, return them instead of making a new API request
      return cache[cacheKey];
    }

    // If the results are not in the cache, make a new API request to the Overpass API to find pharmacies within 1700 meters of the given location
    const query = `http://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="pharmacy"](around:1700,${latitude},${longitude});out;`;
    return axios.get(query)
      .then(async response => {


        // Parse the response data to extract the list of pharmacies and their information
        const pharmacies = response.data.elements.map(element => {
          // Update the state variable with the fetched route data
          return {
            name: element.tags.name,
            address: element.tags["addr:street"],
            latitude: element.lat,
            longitude: element.lon,
            duration: null,
            distance1: null
          };
        });

        // Calculate the distance between each pharmacy and the current map region
        const markers = pharmacies
          .map(({ name, address, latitude, longitude, duration, distance1 }) => {

            const distance = Math.sqrt((region.latitude - parseFloat(latitude)) ** 2 + (region.longitude - parseFloat(longitude)) ** 2);
            return { latitude: parseFloat(latitude), longitude: parseFloat(longitude), title: name, description: address, distance, duration, distance1 };
          })
          // Sort the list of pharmacies by distance from the current map region
          .sort((a, b) => a.distance - b.distance);

        if (markers.length > 0) {
          // If there are any pharmacies within the search radius, update the search markers state variable and add pins to the map
          setSearchMarkers(markers);
          for (m in markers) {
            pins.addPin(markers[m].title, markers[m].description, markers[m].latitude, markers[m].longitude, markers[m].distance1, markers[m].duration)
          }
          // Store the results in the cache object
          cache[cacheKey] = markers;
          return markers;
        } else {
          // If there are no pharmacies within the search radius, update the search markers state variable to an empty list
          setSearchMarkers([]);
          // Store the empty results in the cache object
          cache[cacheKey] = null;
          return null;
        }
      })
      .catch(error => {
        console.log(error);
        return [];
      });
  }


  const handleFindPharmaciesClick = async () => {
    setRoute(null);
    pinStore.setSelectedPin(null, null, null, null, null, null);
    pins.clearPins()
    setSearchText('');
    const { latitude, longitude } = await getCurrentLocation();
    setMarkerCoordinate({ latitude: latitude, longitude: longitude });
    setMarkerCenterCoordinate({ latitude: region.latitude, longitude: region.longitude });

    if (markerCoordinate == markerCenterCoordinate) {   // if the two markers are in the same position then don't display the center marker
      setShowCenterMarker(false);
    } else {
      setShowCenterMarker(true);
    }
    // Call the findPharmaciesNearby function to get the pharmacies nearby
    const pharmaciesNearby = await findPharmaciesNearby(
      region.latitude,
      region.longitude
    );
    // Set the pharmacies state to the pharmaciesNearby array
    setPharmacies(pharmaciesNearby);

  };


  // Declare and initialize the state variable to hold the route data
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState();
  const [duration, setDuration] = useState();
  // Define an asynchronous function to fetch the route data from a web service
  const getRoute = async (current_lon, current_lat, pharmacy_lon, pharmacy_lat) => {
    // Construct the URL for the OSRM API endpoint with the appropriate query parameters
    const url = `https://router.project-osrm.org/route/v1/driving/${current_lon},${current_lat};${pharmacy_lon},${pharmacy_lat}?steps=true&geometries=geojson`;

    try {
      // Make a request to the API endpoint and wait for the response
      const response = await fetch(url);
      // Parse the response data as JSON
      const data = await response.json();

      // Check if the API request was successful
      if (data.code === 'Ok') {
        // Extract the route data from the response and format it as an array of coordinate objects
        const route = data.routes[0].geometry.coordinates.map(
          coordinate => ({
            latitude: coordinate[1],
            longitude: coordinate[0],
          })
        );
        const distance = data.routes[0].distance; // distance in meters
        const duration = data.routes[0].duration; // duration in seconds

        setDistance(distance); // distance between the current location and selected pharmacy (meter)
        setDuration(duration); // duration between the current location and selected pharmacy in (s)
        // Return the formatted route data
        return { route, duration, distance };
      } else {
        // Throw an error if the API request was not successful
        throw new Error(data.code);
      }
    } catch (error) {
      // Handle any errors that occur during the API request
      console.log(error);
    }
  };

  // Define an event handler function to display the route on the map
  const handleShowDirection = async () => {
    // Call the getRoute function to fetch the route data and wait for the result
    const RouteData = await getRoute(region.longitude, region.latitude, markerCoordinate.longitude, markerCoordinate.latitude);
    // Update the state variable with the fetched route data
    const Route = RouteData.route;
    setRoute(Route);
  };



  //This is our marker that we exported from the assets folder
  // This component renders the MapView, Marker and 3 buttons (Zoom in, Zoom out and Location)
  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapStyle}
        region={
          pinStore.latitude && pinStore.longitude ?
            ({
              latitude: pinStore.latitude,
              longitude: pinStore.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            })
            : region
        }
        onPress={(e) => { e.stopPropagation(); pinStore.setSelectedPin(null, null, null, null, null, null); setRoute(null) }}>
        {/* This is a marker that display a popup with the title and the description when you click on it */}
        {markerCoordinate && (

          <Marker
            coordinate={markerCoordinate}
            title="My Current Location"
            description="This is my current location"
            //Add The Listner here
            onPress={(e) => { e.stopPropagation(); handleMarkerPress("My Current Location", "This is my current location", markerCoordinate.latitude, markerCoordinate.longitude); }}
          />
        )}
        {/* Add the Circle component here, full documation : https://github.com/react-native-maps/react-native-maps */}
        {markerCoordinate && (

          <Circle
            center={(markerCenterCoordinate == null) ? markerCoordinate : markerCenterCoordinate}
            radius={1800}
            strokeColor="rgba(0, 0, 255, 0.5)"
            fillColor="rgba(255, 255, 255, 0.3)"
          />

        )}

        {markerCenterCoordinate && (
          showCenterMarker == true ? (
            <Marker
              coordinate={markerCenterCoordinate}
              title="The center"
              description="This is the center of pharmacies search"
              pinColor="blue"
              //Add The Listner here
              onPress={(e) => { e.stopPropagation(); handleMarkerPress("The center", "This is the center of pharmacies search", markerCenterCoordinate.latitude, markerCenterCoordinate.longitude); }}
            />)
            : null
        )}

        {searchMarkers.map((marker, index) => (
          marker.latitude == pinStore.latitude && marker.longitude == pinStore.longitude ? (
            <Marker
              key={index}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
              //Add The Listner here
              onPress={(e) => { e.stopPropagation(); handleMarkerPress(marker.title, marker.description, marker.latitude, marker.longitude, marker.distance1, marker.duration); }}
            >
              <Image style={{ width: 40, height: 40 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3138/3138846.png' }} />
            </Marker>
          )
            :
            <Marker
              key={index}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
              //Add The Listner here
              onPress={(e) => { e.stopPropagation(); handleMarkerPress(marker.title, marker.description, marker.latitude, marker.longitude, marker.distance1, marker.duration); }}
            >
              <Image style={{ width: 40, height: 40 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149059.png' }} />
            </Marker>
        ))}

        {route && (   // this is the route displayed in the map
          <Polyline
            coordinates={route}
            strokeColor="#FF0000"
            strokeWidth={2}
          />
        )}
      </MapView>
      {/*we have to add this line to fix a bug that stop the image from rendering and resize in the marker
      Link: https://github.com/react-native-maps/react-native-maps/issues/924#issuecomment-316064516 */}
      <Image style={{ width: 0, height: 0 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149059.png' }} />
      <Image style={{ width: 0, height: 0 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3138/3138846.png' }} />
      {/*!!! Add your searchBar here !!!*/}
      <View style={styles.searchBarContainer}>
        <SearchBar onSearch={handleSearch} />
      </View>
      {/* Those are the floating buttons to zoom and get the location */}
      <View style={styles.buttonContainer}>
        {/* Zoom in button */}
        <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
          <AntDesign name="plus" size={18} color="black" />
        </TouchableOpacity>
        {/* Zoom out button */}
        <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
          <AntDesign name="minus" size={18} color="black" />
        </TouchableOpacity>
        {/* Locate me button */}
        <TouchableOpacity style={styles.button} onPress={handleGetCurrentLocation}>
          <Ionicons name="ios-locate" size={18} color="black" />
        </TouchableOpacity>
        {/* append search button 
        <TouchableOpacity style={styles.button} onPress={handleAppend}>
          <AntDesign name="arrowsalt" size={18} color="black" />
        </TouchableOpacity>
        {/* minimize search button 
        <TouchableOpacity style={styles.button} onPress={handleMinimize}>
          <AntDesign name="shrink" size={18} color="black" />
        </TouchableOpacity> */}

        {/* Directions buttion */}
        {showDirectionButton && (
          <TouchableOpacity style={styles.button} onPress={handleShowDirection}>
            <MaterialIcons name="directions" size={24} color="black" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleFindPharmaciesClick}>
          <MaterialIcons name="local-pharmacy" size={24} color="black" />
        </TouchableOpacity>


      </View>
    </View>
  );
});
//this is the style of our page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapStyle: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});

export default MapViewComponent;
