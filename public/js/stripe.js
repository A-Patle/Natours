/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Stripe === 'undefined') {
    console.error('Stripe.js failed to load.');
    return;
  }

  const stripe = Stripe(
    'pk_test_51QjE1AG2pmnwx57qTmAIPY2yDAmlKx3CwBbmzowkWGfV11IC7Dq4UI0EdnHe3fJLbBy92tscrDjeqMkRyaM6tNnW00Cfe7P1qL',
  );

  const bookTour = async (tourId) => {
    try {
      // 1) Get the checkout session from the API
      const session = await axios.get(
        `/api/v1/bookings/checkout-session/${tourId}`,
      );

      // 2) create checkout form + charge credit card
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id,
      });
    } catch (error) {
      console.log(error);
      showAlert('error', error);
    }
  };

  // Attach event listener to book button
  const bookBtn = document.querySelector('#book-tour');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.target.textContent = 'Processing...';
      const { tourId } = e.target.dataset;
      bookTour(tourId);
    });
  }
});
