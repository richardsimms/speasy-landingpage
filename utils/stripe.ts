// Function to create a Stripe checkout session
export const createCheckoutSession = async (email?: string) => {
  try {
    // Call our API route to create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { url } = await response.json();
    return { sessionUrl: url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to redirect to Stripe Checkout
export const redirectToStripeCheckout = async () => {
  try {
    // Create a checkout session and redirect to it
    const { sessionUrl } = await createCheckoutSession();
    window.location.href = sessionUrl;
  } catch (error) {
    console.error('Error redirecting to Stripe checkout:', error);
    // Fallback to direct URL if the dynamic checkout fails
    const stripeCheckoutUrl = 'https://buy.stripe.com/dR6cOdfi43Q63Ru7st';
    window.location.href = stripeCheckoutUrl;
  }
}; 