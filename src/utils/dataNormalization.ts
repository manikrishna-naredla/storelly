import { BusinessProfile } from '../types';
import { isCreatorProfile } from './profileHelper';

export function normalizeBusinessData(business?: BusinessProfile | null): BusinessProfile | null {
  if (!business) return null;

  const isCreator = isCreatorProfile(business);
  const defaultModules = isCreator
    ? {
        work_portfolio: true,
        universal_links: true,
        digital_products: false,
        booking_appointments: false,
        custom_quotes: false,
        events_tickets: false,
        reviews: true,
      }
    : {
        products: true,
        cart_ordering: true,
        booking_appointments: false,
        reviews: true,
        offers: false,
      };

  return {
    ...business,
    name: business.name || 'Untitled Store',
    slug: business.slug || business.id || 'store',
    currency: business.currency || 'USD',
    currencySymbol: business.currencySymbol || '$',
    deliveryAvailable: business.deliveryAvailable ?? !isCreator,
    // Preserve saved module settings exactly as saved! Never auto-enable all modules.
    modules: business.modules && Object.keys(business.modules).length > 0
      ? { ...business.modules }
      : defaultModules,
    themeColor: business.themeColor || 'indigo',
  };
}

export interface NormalizedAddress {
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  formattedFullAddress: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export function parseAndNormalizeAddress(
  order: {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerState?: string;
    customerPincode?: string;
    customerCountry?: string;
    orderType?: string;
  },
  businessFallback?: { city?: string; state?: string; pincode?: string }
): NormalizedAddress {
  const recipientName = (order.customerName || 'Valued Customer').trim();
  const recipientPhone = (order.customerPhone || '').trim();
  const rawAddress = (order.customerAddress || '').trim();

  let city = (order.customerCity || '').trim();
  let state = (order.customerState || '').trim();
  let pincode = (order.customerPincode || '').trim();
  let country = (order.customerCountry || 'India').trim();

  // 1. Extract 6-digit PIN code if not explicitly present
  if (!pincode && rawAddress) {
    const pinMatch = rawAddress.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) {
      pincode = pinMatch[1];
    }
  }

  // 2. Extract State if not explicitly present
  if (!state && rawAddress) {
    for (const st of INDIAN_STATES) {
      if (new RegExp(`\\b${st}\\b`, 'i').test(rawAddress)) {
        state = st;
        break;
      }
    }
  }

  // 3. Fallbacks from business profile if city/state are still blank
  if (!city && businessFallback?.city) {
    city = businessFallback.city;
  }
  if (!state && businessFallback?.state) {
    state = businessFallback.state;
  }

  // 4. Construct clean street address line
  let streetAddress = rawAddress;
  if (order.orderType === 'pickup') {
    streetAddress = rawAddress || 'Store Pickup / Counter Collection';
  } else if (!streetAddress) {
    streetAddress = 'Standard Delivery Address';
  }

  // Construct full formatted address string
  const addressParts = [
    streetAddress,
    city,
    state ? `${state}${pincode ? ` - ${pincode}` : ''}` : pincode ? `PIN: ${pincode}` : '',
    country !== 'India' ? country : ''
  ].filter(Boolean);

  const formattedFullAddress = addressParts.join(', ');

  return {
    recipientName,
    recipientPhone,
    streetAddress,
    city: city || 'N/A',
    state: state || 'N/A',
    pincode: pincode || 'N/A',
    country,
    formattedFullAddress
  };
}

