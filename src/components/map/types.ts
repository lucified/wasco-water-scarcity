export interface WaterRegionFeature {
  geometry: any;
  id: number; // not used
  properties: {
    featureId: number;
    worldRegionID: number;
  };
  type: 'Feature';
}
