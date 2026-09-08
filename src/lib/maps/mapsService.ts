/**
 * DOXO Location & Maps Abstraction Service
 * 
 * Guarantees:
 * 1. Unified location model (coordinates, address, district, city)
 * 2. Privacy masking before booking confirmation
 * 3. Haversine distance calculation for realistic service area filtering
 * 4. Honest ETA calculation: returns minutes ONLY when valid telemetry exists;
 *    otherwise provides the honest fallback "პროვაიდერი გზაშია."
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  neighborhood: string;
  city: string;
}

export interface RouteEstimate {
  hasTelemetry: boolean;
  distanceKm?: number;
  durationMinutes?: number;
  displayTextKa: string;
}

// Known central coordinates for Tbilisi neighborhoods
export const TBILISI_DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'ვაკე': { lat: 41.7102, lng: 44.7578 },
  'ვერა': { lat: 41.7058, lng: 44.7831 },
  'საბურთალო': { lat: 41.7285, lng: 44.7681 },
  'დიდუბე': { lat: 41.7482, lng: 44.7812 },
  'ჩუღურეთი': { lat: 41.7145, lng: 44.8012 },
  'მთაწმინდა': { lat: 41.6961, lng: 44.7925 },
  'ისანი': { lat: 41.6881, lng: 44.8392 },
  'სამგორი': { lat: 41.6912, lng: 44.8821 },
  'გლდანი': { lat: 41.7951, lng: 44.8192 },
  'ნაძალადევი': { lat: 41.7391, lng: 44.8091 },
};

export class MapsService {
  /**
   * Geocode a district or address name in Tbilisi
   */
  static geocodeDistrict(districtName: string): GeoLocation {
    const matchedKey = Object.keys(TBILISI_DISTRICT_COORDINATES).find(k =>
      districtName.toLowerCase().includes(k.toLowerCase())
    );

    const coords = matchedKey
      ? TBILISI_DISTRICT_COORDINATES[matchedKey]
      : TBILISI_DISTRICT_COORDINATES['ვაკე'];

    const district = matchedKey || districtName || 'ვაკე';

    return {
      latitude: coords.lat,
      longitude: coords.lng,
      neighborhood: district,
      city: 'თბილისი',
      formattedAddress: `${district}, თბილისი`,
    };
  }

  /**
   * Calculate great-circle distance between two coordinates in Kilometers (Haversine formula)
   */
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if a location is within a provider's service radius or district list
   */
  static isLocationCovered(
    targetDistrict: string,
    providerDistricts: string[],
    providerRadiusKm: number = 10
  ): boolean {
    // 1. Direct district match
    const directMatch = providerDistricts.some(d =>
      d.toLowerCase().includes(targetDistrict.toLowerCase()) ||
      targetDistrict.toLowerCase().includes(d.toLowerCase())
    );
    if (directMatch) return true;

    // 2. Proximity match via coordinates
    const targetCoords = TBILISI_DISTRICT_COORDINATES[targetDistrict];
    if (!targetCoords) return false;

    for (const pDistrict of providerDistricts) {
      const pCoords = TBILISI_DISTRICT_COORDINATES[pDistrict];
      if (pCoords) {
        const dist = this.calculateDistanceKm(targetCoords.lat, targetCoords.lng, pCoords.lat, pCoords.lng);
        if (dist <= providerRadiusKm) return true;
      }
    }

    return false;
  }

  /**
   * Calculate Honest ETA:
   * Only returns specific minutes if real provider telemetry coordinates exist!
   * Otherwise returns honest fallback "პროვაიდერი გზაშია."
   */
  static estimateArrival(
    providerCurrentCoords?: { lat: number; lng: number },
    destinationCoords?: { lat: number; lng: number }
  ): RouteEstimate {
    if (!providerCurrentCoords || !destinationCoords) {
      return {
        hasTelemetry: false,
        displayTextKa: 'პროვაიდერი გზაშია',
      };
    }

    const distKm = this.calculateDistanceKm(
      providerCurrentCoords.lat,
      providerCurrentCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    // Assume average urban speed in Tbilisi is 25 km/h + 5 mins buffer
    const durationMinutes = Math.max(5, Math.round((distKm / 25) * 60 + 5));

    return {
      hasTelemetry: true,
      distanceKm: distKm,
      durationMinutes,
      displayTextKa: `სავარაუდო ჩამოსვლა: ${durationMinutes} წუთში (${distKm} კმ)`,
    };
  }

  /**
   * Mask location for privacy prior to confirmed booking
   */
  static maskAddress(fullAddress: string, isConfirmed: boolean): string {
    if (isConfirmed) return fullAddress;
    const parts = fullAddress.split('·')[0].split(',');
    return `${parts[0].trim()} (უბნის დონე)`;
  }
}
