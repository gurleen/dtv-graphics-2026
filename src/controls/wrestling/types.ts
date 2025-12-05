export type WrestlerYear = 1 | 2 | 3 | 4 | 5;

export interface Wrestler {
    firstName: string
    lastName: string
    primaryWeightClass: number
    secondaryWeightClass?: number
    year: WrestlerYear
    isRedshirt: boolean
}

export const WEIGHT_CLASSES = [
    125,
    133,
    141,
    149,
    157,
    165,
    174,
    184,
    197,
    285
];