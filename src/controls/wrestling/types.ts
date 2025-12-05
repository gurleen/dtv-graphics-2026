export type WrestlerYear = 1 | 2 | 3 | 4 | 5;

export interface Wrestler {
    firstName: string
    lastName: string
    primaryWeightClass: number
    secondaryWeightClass?: number
    year: WrestlerYear
    isRedshirt: boolean
}