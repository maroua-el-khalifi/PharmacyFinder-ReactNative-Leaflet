import { makeObservable, observable, action } from 'mobx';

class PinStore {
  name = null;
  adress = null;
  latitude = null;
  longitude = null;
  distance = null;
  duration = null;

  //Constructor of our class
  constructor() {
    //function that is used to turn an object into an observable
    //an observable is a value or object that is wrapped in a way that allows it to be tracked for changes
    makeObservable(this, {
      name: observable,
      adress: observable,
      latitude: observable,
      longitude: observable,
      distance: observable,
      duration: observable,
      setSelectedPin: action,
    });
  }
  // Change the data function
  setSelectedPin(name, adress, latitude, longitude, distance, duration) {
    this.name = name;
    this.adress = adress;
    this.latitude = latitude;
    this.longitude = longitude;
    this.distance = distance;
    this.duration = duration;
  }
}
// create an instance of the PinStore class
const pinStore = new PinStore();

export { PinStore, pinStore };