import validator from 'validator'
import axios from 'axios';

const isValidEmail= async(email) =>{
  return validator.isEmail(email);
}


const isValidMobile =async (mobile)=> {
  return validator.isNumeric(mobile) && validator.isLength(mobile, { min: 10, max: 10 });
}

const isValidPassword =async (password)=> {
  return validator.isLength(password, { min: 5 });
}

const parseCoordinates = async(coordinates)=> {
  const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
  return { lat, lng };
}


const generateOTP= async()=> {

  const otpLength = 4;
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;

  // Generate a random 4-digit number
  const otpCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return otpCode.toString();
}


// distanceMiddleware.js
const calculateDistanceAndDuration = async(originCoords, destinationCoords) =>{

  const apiKey = process.env.GMAPAPI;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${originCoords.lat},${originCoords.lng}`,
        destinations: `${destinationCoords.lat},${destinationCoords.lng}`,
        key: apiKey,
      },
    });

    return response;

  } catch (error) {
    console.error('Error fetching distance and duration:', error.message);
  }
}


const getLocation= async(lat, long) =>{
  const apiKey = process.env.GMAPAPI;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${long}`,
        key: apiKey,
      },
    });

    // Extract the formatted address from the response
    const formattedAddress = response.data.results[0].formatted_address;

    return formattedAddress;

  } catch (error) {
    console.error('Error fetching address:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }

}




export { isValidEmail, isValidMobile, isValidPassword, generateOTP, calculateDistanceAndDuration, parseCoordinates, getLocation };




