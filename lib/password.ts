const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_DIGIT = /\d/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_LENGTH) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!HAS_UPPERCASE.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!HAS_LOWERCASE.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!HAS_DIGIT.test(password)) {
    return { valid: false, message: "Password must contain at least one digit" };
  }
  if (!HAS_SPECIAL.test(password)) {
    return { valid: false, message: "Password must contain at least one special character (!@#$%^&* etc.)" };
  }
  return { valid: true };
}
