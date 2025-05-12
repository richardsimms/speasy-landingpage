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

// Ensure required meta tags exist
const ensureMetaTags = () => {
  // Check if the og:type meta tag exists
  if (!document.querySelector("meta[property='og:type']")) {
    // Create and append the meta tag if it doesn't exist
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('property', 'og:type');
    metaTag.setAttribute('content', 'website');
    document.head.appendChild(metaTag);
  }
};

// Function to redirect to Stripe Checkout
export const redirectToStripeCheckout = async () => {
  try {
    // Ensure required meta tags exist
    if (typeof document !== 'undefined') {
      ensureMetaTags();
    }
    
    // Create a checkout session and redirect to it
    const { sessionUrl } = await createCheckoutSession();
    window.location.href = sessionUrl;
  } catch (error) {
    console.error('Error redirecting to Stripe checkout:', error);
    // Fallback to direct URL if the dynamic checkout fails
    const stripeCheckoutUrl = 'https://buy.stripe.com/5kA7tT6Ly86m3Ru003';
    window.location.href = stripeCheckoutUrl;
  }
};

