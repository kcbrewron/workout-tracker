import { browser } from '$app/environment';

// Unit conversion constants
const CONVERSION_FACTORS = {
    weight: {
        kg_to_lbs: 2.20462,
        lbs_to_kg: 0.453592
    },
    length: {
        cm_to_in: 0.393701,
        in_to_cm: 2.54
    }
};

// Countries that primarily use imperial system
const IMPERIAL_COUNTRIES = [
    'US', 'LR', 'MM' // United States, Liberia, Myanmar
];

// Detect user's preferred unit system based on geo-IP
export async function detectUnitsFromGeoIP() {
    if (!browser) return 'metric';
    
    try {
        // Try to get country from multiple geo-IP services
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code && IMPERIAL_COUNTRIES.includes(data.country_code)) {
            return 'imperial';
        }
        
        return 'metric';
    } catch (error) {
        console.warn('Failed to detect units from geo-IP:', error);
        
        // Fallback: try to detect from browser locale
        try {
            const locale = navigator.language || navigator.userLanguage;
            if (locale.startsWith('en-US')) {
                return 'imperial';
            }
        } catch (localeError) {
            console.warn('Failed to detect units from locale:', localeError);
        }
        
        // Default to metric
        return 'metric';
    }
}

// Weight conversion functions
export function convertWeight(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
        return numValue * CONVERSION_FACTORS.weight.kg_to_lbs;
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
        return numValue * CONVERSION_FACTORS.weight.lbs_to_kg;
    }
    
    return value;
}

// Length conversion functions
export function convertLength(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (fromUnit === 'cm' && toUnit === 'in') {
        return numValue * CONVERSION_FACTORS.length.cm_to_in;
    } else if (fromUnit === 'in' && toUnit === 'cm') {
        return numValue * CONVERSION_FACTORS.length.in_to_cm;
    }
    
    return value;
}

// Format weight with appropriate units
export function formatWeight(value, unit, decimals = 1) {
    if (value === null || value === undefined) return 'No data';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'No data';
    
    return `${numValue.toFixed(decimals)} ${unit}`;
}

// Format length with appropriate units
export function formatLength(value, unit, decimals = 1) {
    if (value === null || value === undefined) return 'No data';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'No data';
    
    return `${numValue.toFixed(decimals)} ${unit}`;
}

// Get unit labels for display
export function getUnitLabels(system) {
    if (system === 'imperial') {
        return {
            weight: 'lbs',
            length: 'in',
            weightLabel: 'Weight (lbs)',
            lengthLabel: 'Length (in)'
        };
    } else {
        return {
            weight: 'kg',
            length: 'cm',
            weightLabel: 'Weight (kg)',
            lengthLabel: 'Length (cm)'
        };
    }
}

// Convert stored metric values to display units
export function convertToDisplayUnits(value, type, targetSystem) {
    if (targetSystem === 'metric') return value;
    
    if (type === 'weight') {
        return convertWeight(value, 'kg', 'lbs');
    } else if (type === 'length') {
        return convertLength(value, 'cm', 'in');
    }
    
    return value;
}

// Convert display units to storage units (always metric)
export function convertToStorageUnits(value, type, sourceSystem) {
    if (sourceSystem === 'metric') return value;
    
    if (type === 'weight') {
        return convertWeight(value, 'lbs', 'kg');
    } else if (type === 'length') {
        return convertLength(value, 'in', 'cm');
    }
    
    return value;
}

// Validate unit system
export function isValidUnitSystem(system) {
    return system === 'metric' || system === 'imperial';
}

// Get appropriate step value for inputs
export function getInputStep(unit) {
    switch (unit) {
        case 'kg':
            return '0.1';
        case 'lbs':
            return '0.5';
        case 'cm':
            return '0.5';
        case 'in':
            return '0.25';
        default:
            return '0.1';
    }
}

// Get appropriate placeholder for inputs
export function getInputPlaceholder(unit) {
    switch (unit) {
        case 'kg':
            return '70.0';
        case 'lbs':
            return '154.5';
        case 'cm':
            return '100.0';
        case 'in':
            return '39.5';
        default:
            return '0.0';
    }
}