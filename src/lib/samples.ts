/**
 * Sample screenshots bundled with the app (public/samples/*.png).
 * These are INPUT images only — every result still comes live from the API when you run them.
 */
export interface Sample {
  id: string;
  label: string;
  hint: string;
  url: string;
  icon: string;
}

export const SAMPLES: Sample[] = [
  { id: 'quick-commerce', label: 'Quick-commerce checkout', hint: 'Grocery cart at payment step', url: '/samples/quick-commerce.png', icon: 'shopping_bag' },
  { id: 'flight', label: 'Flight booking payment', hint: 'Fare summary before pay', url: '/samples/flight-booking.png', icon: 'flight' },
  { id: 'subscription', label: 'Subscription cancel flow', hint: 'Trying to cancel a plan', url: '/samples/subscription-cancel.png', icon: 'subscriptions' },
];
