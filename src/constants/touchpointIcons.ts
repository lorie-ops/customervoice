import {
  CalendarSearch,
  CreditCard,
  DoorOpen,
  Home,
  Waves,
  UtensilsCrossed,
  Ticket,
  Users,
  ClipboardCheck,
  PhoneCall,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Icons for the illustrative touchpoint taxonomy
 * (journey_touchpoints_fixture.json). Purely visual - not part of any
 * validated data.
 */
export const TOUCHPOINT_ICONS: Record<string, LucideIcon> = {
  'Search and booking': CalendarSearch,
  'Payment and confirmation': CreditCard,
  'Check-in': DoorOpen,
  'Accommodation (cottage)': Home,
  Aquamundo: Waves,
  'Catering and dining': UtensilsCrossed,
  'Leisure and activities': Ticket,
  'Staff and service': Users,
  'Post-stay survey': ClipboardCheck,
  'Follow-up and refunds': PhoneCall,
};

export const DEFAULT_TOUCHPOINT_ICON = HelpCircle;
