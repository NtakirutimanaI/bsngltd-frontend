// List of known disposable/temporary email domains
const disposableEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.com',
    'throwaway.email',
    'temp-mail.org',
    'fakeinbox.com',
    'trashmail.com',
    'yopmail.com',
    'maildrop.cc',
    'getnada.com',
    'tempr.email',
    'sharklasers.com',
    'guerrillamail.info',
    'grr.la',
    'guerrillamail.biz',
    'guerrillamail.de',
    'spam4.me',
    'mailnesia.com',
    'emailondeck.com',
];

export interface EmailValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    // Extract domain
    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
        return { isValid: false, error: 'Invalid email format' };
    }

    // Check if it's a disposable/fake email domain
    if (disposableEmailDomains.includes(domain)) {
        return { isValid: false, error: 'Email given is Fake!' };
    }

    // Additional checks for suspicious patterns
    if (domain.includes('temp') || domain.includes('fake') || domain.includes('trash')) {
        return { isValid: false, error: 'Email given is Fake!' };
    }

    // Check for valid TLD (top-level domain)
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) {
        return { isValid: false, error: 'Invalid email domain' };
    }

    return { isValid: true };
}

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? disposableEmailDomains.includes(domain) : false;
}
