import type { Market } from '../types';

/**
 * Property (resort) name -> Market, read directly from the real Medallia
 * EQS export's "Site Country" + "Property" columns. Belgium has no
 * separate "market" column in that export - the BEFR/BENL split used
 * everywhere else in this app is derived here from which specific resort
 * a response is about (Les Ardennes is Wallonia/French-speaking; the six
 * others are Flanders/Dutch-speaking), not from the respondent's own
 * language or home country.
 */
export const MEDALLIA_PROPERTY_MARKET: Record<string, Market> = {
  // France
  'Les Trois Forêts': 'FR',
  'Les Bois-Francs': 'FR',
  "Le Lac d'Ailette": 'FR',
  'Villages Nature Paris': 'FR',
  'Le Bois aux Daims': 'FR',
  'Les Hauts de Bruyères': 'FR',
  'Les Landes de Gascogne': 'FR',
  // Germany
  'Park Allgäu': 'DE',
  'Bispinger Heide': 'DE',
  'Park Hochsauerland': 'DE',
  'Park Bostalsee': 'DE',
  'Park Eifel': 'DE',
  'Park Nordseeküste': 'DE',
  // Netherlands
  'Het Heijderbos': 'NL',
  'Port Zélande': 'NL',
  'De Kempervennen': 'NL',
  'De Eemhof': 'NL',
  'De Huttenheugte': 'NL',
  'Het Meerdal': 'NL',
  'Park Zandvoort': 'NL',
  'Limburgse Peel': 'NL',
  'Parc Sandur': 'NL',
  // Denmark
  'Nordborg Resort': 'DK',
  // Belgium - Flanders (Dutch-speaking)
  'De Vossemeren': 'BENL',
  Erperheide: 'BENL',
  'Park De Haan': 'BENL',
  'Kempense Meren': 'BENL',
  'Terhills Resort': 'BENL',
  'Oostduinkerke aan zee': 'BENL',
  // Belgium - Wallonia (French-speaking)
  'Les Ardennes': 'BEFR',
};
