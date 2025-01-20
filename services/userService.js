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

const parseCoordinates = (coords) => { 
  const [lat, lng] = coords.split(','); 
  return { lat: parseFloat(lat), lng: parseFloat(lng) 
  }; 
};

const generateOTP= async()=> {

  const otpLength = 4;
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;

  // Generate a random 4-digit number
  const otpCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return otpCode.toString();
}







const calculateDistanceAndDuration = async (originCoords, destinationCoords) => {
  try {
    // Ensure the correct URL format
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}`;

    const response = await axios.get(url, {
      params: {
        overview: 'false', // Don't include the full route geometry
        steps: 'false'     // Don't include detailed steps
      }
    });

    const data = response.data;

    if (data.routes && data.routes.length > 0) {
      const distance = data.routes[0].distance / 1000; // Convert meters to kilometers
      const duration = data.routes[0].duration / 60;   // Convert seconds to minutes
console.log("calculate data",data)
      return { distance: `${distance.toFixed(2)} km`, duration: `${duration.toFixed(2)} mins` };
    } else {
      throw new Error('No route found');
    }

  } catch (error) {
    console.error('Error fetching distance and duration:', error.message);
    return { error: 'Unable to calculate distance and duration' };
  }
};


const getLocation = async (lat, long) => {
  const apiKey = process.env.GMAPAPI;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${long}`,
        key: apiKey,
      },
    });

    // Check if results array has elements
    if (response.data.results.length === 0) {
      throw new Error('No results found');
    }

    // Extract the formatted address from the response
    const formattedAddress = response.data.results[0].formatted_address;

    return formattedAddress;

  } catch (error) {
    console.error('Error fetching address:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};





export { isValidEmail, isValidMobile, isValidPassword, generateOTP, calculateDistanceAndDuration, parseCoordinates, getLocation };




// const calculateDistanceAndDuration = async(originCoords, destinationCoords) =>{
//   distanceMiddleware.js
//   const apiKey = process.env.GMAPAPI;

//   try {
//     const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
//       params: {
//         origins: `${originCoords.lat},${originCoords.lng}`,
//         destinations: `${destinationCoords.lat},${destinationCoords.lng}`,
//         key: apiKey,
//       },
//     });

//     return response;

//   } catch (error) {
//     console.error('Error fetching distance and duration:', error.message);
//   }
// }
