import DOMPurify from 'dompurify';

/**
 * Email validation using regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 * Requirements: Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 */
export const isValidPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: 'Password is strong' };
};

/**
 * Validate quantity input - must be a positive number
 */
export const isValidQuantity = (quantity: string | number): { valid: boolean; message: string } => {
  const num = Number(quantity);
  if (isNaN(num)) {
    return { valid: false, message: 'Quantity must be a number' };
  }
  if (num <= 0) {
    return { valid: false, message: 'Quantity must be greater than 0' };
  }
  if (num > 10000) {
    return { valid: false, message: 'Quantity cannot exceed 10,000' };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, message: 'Quantity must be a whole number' };
  }
  return { valid: true, message: 'Quantity is valid' };
};

/**
 * Validate text input - check length and sanitize for XSS
 */
export const isValidText = (text: string, minLength: number = 1, maxLength: number = 255): { valid: boolean; message: string } => {
  if (!text || text.trim().length < minLength) {
    return { valid: false, message: `Text must be at least ${minLength} characters long` };
  }
  if (text.length > maxLength) {
    return { valid: false, message: `Text cannot exceed ${maxLength} characters` };
  }
  return { valid: true, message: 'Text is valid' };
};

/**
 * Validate expiration date - must be a future date
 */
export const isValidExpirationDate = (dateString: string): { valid: boolean; message: string } => {
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  if (date <= now) {
    return { valid: false, message: 'Expiration date must be in the future' };
  }

  return { valid: true, message: 'Expiration date is valid' };
};

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Trim and sanitize text input
 */
export const cleanInput = (input: string): string => {
  return sanitizeInput(input.trim());
};

/**
 * Validate organization name
 */
export const isValidOrganizationName = (name: string): { valid: boolean; message: string } => {
  const cleanedName = sanitizeInput(name.trim());
  if (cleanedName.length < 2) {
    return { valid: false, message: 'Organization name must be at least 2 characters long' };
  }
  if (cleanedName.length > 100) {
    return { valid: false, message: 'Organization name cannot exceed 100 characters' };
  }
  return { valid: true, message: 'Organization name is valid' };
};

/**
 * Validate food item name
 */
export const isValidFoodItemName = (name: string): { valid: boolean; message: string } => {
  const cleanedName = sanitizeInput(name.trim());
  if (cleanedName.length < 2) {
    return { valid: false, message: 'Food item name must be at least 2 characters long' };
  }
  if (cleanedName.length > 100) {
    return { valid: false, message: 'Food item name cannot exceed 100 characters' };
  }
  return { valid: true, message: 'Food item name is valid' };
};

/**
 * Validate pickup location
 */
export const isValidPickupLocation = (location: string): { valid: boolean; message: string } => {
  const cleanedLocation = sanitizeInput(location.trim());
  if (cleanedLocation.length < 5) {
    return { valid: false, message: 'Pickup location must be at least 5 characters long' };
  }
  if (cleanedLocation.length > 255) {
    return { valid: false, message: 'Pickup location cannot exceed 255 characters' };
  }
  return { valid: true, message: 'Pickup location is valid' };
};
