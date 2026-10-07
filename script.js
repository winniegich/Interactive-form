document.addEventListener('DOMContentLoaded', () => {
  // DOM Element Selectors
  const form = document.getElementById('registrationForm');
  const successMessage = document.getElementById('successMessage');

  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      group: document.getElementById('group-fullName'),
      error: document.getElementById('fullNameError'),
      validate: validateFullName
    },
    email: {
      input: document.getElementById('email'),
      group: document.getElementById('group-email'),
      error: document.getElementById('emailError'),
      validate: validateEmail
    },
    phone: {
      input: document.getElementById('phone'),
      group: document.getElementById('group-phone'),
      error: document.getElementById('phoneError'),
      validate: validatePhone
    },
    password: {
      input: document.getElementById('password'),
      group: document.getElementById('group-password'),
      error: document.getElementById('passwordError'),
      validate: validatePassword
    },
    confirmPassword: {
      input: document.getElementById('confirmPassword'),
      group: document.getElementById('group-confirmPassword'),
      error: document.getElementById('confirmPasswordError'),
      validate: validateConfirmPassword
    }
  };

  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const strengthContainer = document.getElementById('strengthContainer');
  const strengthText = document.getElementById('strengthText');

  // --- Regex Rules ---
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Accepts standard international/national telephone formats (7 to 15 digits)
  const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  // --- Field Validation Functions ---

  function validateFullName(value) {
    if (!value.trim()) {
      return 'Full name is required.';
    }
    if (value.trim().length < 3) {
      return 'Name must be at least 3 characters long.';
    }
    return '';
  }

  function validateEmail(value) {
    if (!value.trim()) {
      return 'Email address is required.';
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return 'Please enter a valid email address (e.g., user@domain.com).';
    }
    return '';
  }

  function validatePhone(value) {
    if (!value.trim()) {
      return 'Phone number is required.';
    }
    if (!PHONE_REGEX.test(value.trim())) {
      return 'Please enter a valid phone number format.';
    }
    return '';
  }

  function validatePassword(value) {
    if (!value) {
      return 'Password is required.';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return '';
  }

  function validateConfirmPassword(value) {
    if (!value) {
      return 'Please confirm your password.';
    }
    if (value !== fields.password.input.value) {
      return 'Passwords do not match.';
    }
    return '';
  }

  // --- Password Strength Calculator ---

  function evaluatePasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, label: 'Password strength' };

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, label: labels[score] || 'Weak' };
  }

  function updatePasswordStrengthMeter(password) {
    if (!password) {
      strengthContainer.classList.remove('visible');
      strengthContainer.removeAttribute('data-strength');
      return;
    }

    strengthContainer.classList.add('visible');
    const { score, label } = evaluatePasswordStrength(password);
    strengthContainer.setAttribute('data-strength', score);
    strengthText.textContent = `Strength: ${label}`;
  }

  // --- Generic UI Validation Handler ---

  function checkField(fieldName, isBlur = false) {
    const field = fields[fieldName];
    const value = field.input.value;
    const errorMessage = field.validate(value);

    // If input is currently empty and wasn't blurred yet, don't show invalid state right away
    if (!value && !isBlur) {
      field.group.classList.remove('valid', 'invalid');
      field.error.textContent = '';
      return false;
    }

    if (errorMessage) {
      field.group.classList.remove('valid');
      field.group.classList.add('invalid');
      field.error.textContent = errorMessage;
      return false;
    } else {
      field.group.classList.remove('invalid');
      field.group.classList.add('valid');
      field.error.textContent = '';
      return true;
    }
  }

  // --- Attach Focus, Blur & Input Events ---

  Object.keys(fields).forEach(key => {
    const field = fields[key];

    // Focus event: Highlight input field container
    field.input.addEventListener('focus', () => {
      field.group.classList.add('focused');
    });

    // Blur event: Validate on leaving the field
    field.input.addEventListener('blur', () => {
      field.group.classList.remove('focused');
      checkField(key, true);
    });

    // Input event: Real-time validation feedback while typing
    field.input.addEventListener('input', () => {
      if (key === 'password') {
        updatePasswordStrengthMeter(field.input.value);
        // Re-validate confirm password if password field changes
        if (fields.confirmPassword.input.value) {
          checkField('confirmPassword');
        }
      }

      // Live check if field was previously marked invalid or is active
      if (field.group.classList.contains('invalid') || field.group.classList.contains('valid')) {
        checkField(key);
      }
    });
  });

  // --- Password Visibility Toggle ---

  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = fields.password.input.type === 'password';
    fields.password.input.type = isPassword ? 'text' : 'password';
    eyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  });

  // --- Form Submission Handler ---

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isFormValid = true;

    // Validate all fields on submit
    Object.keys(fields).forEach(key => {
      const isValid = checkField(key, true);
      if (!isValid) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // Hide form & show success confirmation banner
      form.reset();
      
      // Reset UI classes
      Object.keys(fields).forEach(key => {
        fields[key].group.classList.remove('valid', 'invalid', 'focused');
      });
      strengthContainer.classList.remove('visible');

      successMessage.classList.remove('hidden');
      
      // Scroll to top of container for accessibility
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});