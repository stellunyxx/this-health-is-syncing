
export type FacilityOwnership = 'Government' | 'Private'

export type Facility = {
  id: number
  name: string
  location: string
  address: string
  ownership: FacilityOwnership
  services: string[]
  contact: string
  website: string
  latitude: number
  longitude: number
}

export const facilities: Facility[] = [
  {
    id: 1,
    name: 'Sample Rural Health Unit',
    location: 'Miagao, Iloilo',
    address: 'Miagao, Iloilo, Philippines',
    ownership: 'Government',
    services: ['General Consultation', 'Primary Care'],
    contact: 'Not provided',
    website: '',
    latitude: 10.644,
    longitude: 122.235,
  },
  {
    id: 2,
    name: 'Sample Community Health Center',
    location: 'Iloilo City',
    address: 'Iloilo City, Iloilo, Philippines',
    ownership: 'Government',
    services: ['General Consultation', 'Maternal Health'],
    contact: 'Not provided',
    website: '',
    latitude: 10.72,
    longitude: 122.562,
  },
  {
    id: 3,
    name: 'Sample Private Medical Clinic',
    location: 'Iloilo City',
    address: 'Iloilo City, Iloilo, Philippines',
    ownership: 'Private',
    services: ['General Consultation', 'Laboratory Services'],
    contact: 'Not provided',
    website: '',
    latitude: 10.704,
    longitude: 122.552,
  },
  {
    id: 4,
    name: 'Sample District Health Center',
    location: 'Guimbal, Iloilo',
    address: 'Guimbal, Iloilo, Philippines',
    ownership: 'Government',
    services: ['Primary Care', 'Maternal Health'],
    contact: 'Not provided',
    website: '',
    latitude: 10.664,
    longitude: 122.323,
  },
]

export const availableServices = Array.from(
  new Set(facilities.flatMap((facility) => facility.services))
).sort()
