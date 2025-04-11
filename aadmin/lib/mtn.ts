// lib/mtn.ts
import axios from 'axios';

const MTN_BASE_URL = 'https://api.mtn.com/payment';  // Replace with the actual MTN endpoint

// Function to generate the authorization token using Consumer Key and Consumer Secret
export async function generateMtnAuthToken() {
  try {
    const response = await axios.post(
      `${MTN_BASE_URL}/auth/v1/token`, 
      {}, 
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.MTN_CONSUMER_KEY + ':' + process.env.MTN_CONSUMER_SECRET
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    console.error('Error generating MTN token:', error);
    throw new Error('Failed to get MTN token');
  }
}

// Function to initiate payment request with MTN
export async function initiateMtnPayment(amount: number, phoneNumber: string) {
  try {
    const token = await generateMtnAuthToken();
    const paymentData = {
      amount: amount, 
      phoneNumber: phoneNumber, 
      callbackUrl: process.env.MTN_CALLBACK_URL, 
    };

    const response = await axios.post(
      `${MTN_BASE_URL}/initiatePayment`,  // Use the correct endpoint
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating MTN payment:', error);
    throw new Error('Payment initiation failed');
  }
}
