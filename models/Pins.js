import { makeObservable, observable, action } from 'mobx';

class Pin {
  constructor(name, adress, latitude, longitude, distance, duration) {
    this.name = name;
    this.adress = adress;
    this.latitude = latitude;
    this.longitude = longitude;
    this.distance = distance;
    this.duration = duration;
  }
}

class PinsData {
  pins = [];

  constructor() {
    makeObservable(this, {
      pins: observable,
      setPins: action,
      addPin: action,
      removePin: action,
      clearPins: action,
    });
  }

  setPins(markers) {
    this.pins.replace(markers);
  }

  addPin(name, adress, latitude, longitude, distance, duration) {
    const pin = new Pin(name, adress, latitude, longitude, distance, duration);
    this.pins.push(pin);
  }

  removePin(pin) {
    const index = this.pins.indexOf(pin);
    if (index !== -1) {
      this.pins.splice(index, 1);
    }
  }

  clearPins() {
    this.pins = [];
  }

  getAllPins() {
    return this.pins;
  }
}

const pins = new PinsData();

export { PinsData, pins };
