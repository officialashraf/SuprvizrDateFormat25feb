
import axios from "axios";
const MSG91_AUTH_KEY = '409988AMtNHmzGsn65ddab09P1'; // Replace with your actual authkey



export const sendOTP = async (mobileNo='',otpCode='') => {
  // console.log('mobileNo',mobileNo);

 
  try {
    const options = {
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/flow',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY, // Replace with your actual authkey
      },
      data: {
        "template_id": "66cdbefcd6fc0563412229b3",
        "recipients": [
          {
            "mobiles": "91"+mobileNo,
            "OTP": otpCode
          }
        ]
      },
    };
  
    const response = await axios.request(options);
    console.log('OTP sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
  
  };



 export const sendEmployeeMsg = async (mobileNo='') => {

  try {
    const options = {
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/flow',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY, // Replace with your actual authkey
      },
      data: {
        "template_id": "66cdbd37d6fc051b8f7d4662",
        "recipients": [
          {
            "mobiles": "91"+mobileNo,
          }
        ]
      },
    };
  
    const response = await axios.request(options);
    console.log('OTP sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
  
  };







