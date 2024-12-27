export function normalizePhoneNumber(phoneNumber: string): string {
   // Normalize the phone number to XXX-XXX-XXXX format (U.S. only)
   const cleanedNumber = phoneNumber.replace(/\D/g, "");

   // Handle potential country code (assuming US format with optional +1)
   const hasCountryCode = cleanedNumber.startsWith("1");
   const normalizedNumber = hasCountryCode ? cleanedNumber.slice(1) : cleanedNumber;

   // Format the phone number - (XXX) XXX-XXXX
   return `(${normalizedNumber.slice(0, 3)}) ${normalizedNumber.slice(3, 6)}-${normalizedNumber.slice(6)}`;
}

export function normalizeDate(date: Date): string {
   // Normalize the date to MM/DD/YYYY format
   return date.toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1");
}