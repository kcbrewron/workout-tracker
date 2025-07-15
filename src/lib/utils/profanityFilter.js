// Simple profanity filter for workout names
const profanityList = [
    'damn', 'hell', 'shit', 'fuck', 'ass', 'bitch', 'bastard', 'crap', 'piss',
    'cock', 'dick', 'pussy', 'tits', 'whore', 'slut', 'fag', 'nigger', 'retard'
];

/**
 * Checks if text contains profanity
 * @param {string} text - The text to check
 * @returns {boolean} - True if profanity is detected
 */
export function containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;
    
    const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, '');
    const words = cleanText.split(/\s+/);
    
    return words.some(word => profanityList.includes(word));
}

/**
 * Validates a workout name
 * @param {string} name - The workout name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function validateWorkoutName(name) {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Workout name is required' };
    }
    
    if (name.trim().length < 2) {
        return { isValid: false, error: 'Workout name must be at least 2 characters long' };
    }
    
    if (name.trim().length > 50) {
        return { isValid: false, error: 'Workout name must be 50 characters or less' };
    }
    
    if (containsProfanity(name)) {
        return { isValid: false, error: 'Please use appropriate language for workout names' };
    }
    
    return { isValid: true, error: null };
}