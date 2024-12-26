export function normalizePhoneNumber(phoneNumber: string): string {
   // Remove all non-digit characters
   const cleanedNumber = phoneNumber.replace(/\D/g, '');
 
   // Handle potential country code (assuming US format with optional +1)
   const hasCountryCode = cleanedNumber.startsWith('1');
   const normalizedNumber = hasCountryCode ? cleanedNumber.slice(1) : cleanedNumber;

   // Format the phone number - (XXX) XXX-XXXX
   return `(${normalizedNumber.slice(0, 3)}) ${normalizedNumber.slice(3, 6)}-${normalizedNumber.slice(6)}`;
 }