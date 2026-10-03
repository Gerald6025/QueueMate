import { createClient } from '@supabase/supabase-js';
import { Business, StaffMember, Ticket } from '@/types/queue';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// BUSINESSES API
// ==========================================
export async function getBusinessesFromDB(): Promise<Business[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch businesses error:', error.message);
      return null;
    }

    return (data || []).map((b) => ({
      id: b.id,
      name: b.name,
      industry: b.industry,
      description: b.description || '',
      fullDescription: b.full_description || b.description || '',
      email: b.email || '',
      workingHours: b.working_hours || '08:00 – 17:00',
      queueWindow: b.queue_window || '08:00 – 16:30',
      opensAt: b.opens_at || '08:00 AM',
      closesAt: b.closes_at || '05:00 PM',
      queueOpens: b.queue_opens || '08:00 AM',
      queueCloses: b.queue_closes || '04:30 PM',
      dailyCapacity: b.daily_capacity || '100',
      status: b.status as 'Open' | 'Closed',
      icon: b.icon || 'bank',
      createdAt: b.created_at,
    }));
  } catch (err) {
    console.warn('Failed to query Supabase businesses:', err);
    return null;
  }
}

export async function saveBusinessToDB(business: Business): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('businesses').upsert({
      id: business.id,
      name: business.name,
      industry: business.industry,
      description: business.description,
      full_description: business.fullDescription || business.description,
      email: business.email,
      working_hours: business.workingHours,
      queue_window: business.queueWindow,
      opens_at: business.opensAt,
      closes_at: business.closesAt,
      queue_opens: business.queueOpens,
      queue_closes: business.queueCloses,
      daily_capacity: business.dailyCapacity,
      status: business.status,
      icon: business.icon || 'bank',
    });

    if (error) {
      console.warn('Supabase save business error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save business to Supabase:', err);
    return false;
  }
}

export async function deleteBusinessFromDB(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete business error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete business from Supabase:', err);
    return false;
  }
}

// ==========================================
// STAFF MEMBERS API
// ==========================================
export async function getStaffFromDB(): Promise<StaffMember[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch staff error:', error.message);
      return null;
    }

    return (data || []).map((s) => ({
      id: s.id,
      businessId: s.business_id,
      businessName: s.business_name || '',
      name: s.name,
      email: s.email,
      role: s.role || 'Counter Staff',
      counterName: s.counter_name || 'Counter 1',
      staffPin: s.staff_pin || '1234',
      active: s.active ?? true,
      createdAt: s.created_at,
    }));
  } catch (err) {
    console.warn('Failed to query Supabase staff:', err);
    return null;
  }
}

export async function saveStaffMemberToDB(staff: StaffMember): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('staff').upsert({
      id: staff.id,
      business_id: staff.businessId,
      business_name: staff.businessName,
      name: staff.name,
      email: staff.email,
      role: staff.role || 'Counter Staff',
      counter_name: staff.counterName,
      staff_pin: staff.staffPin || '1234',
      active: staff.active,
    });

    if (error) {
      console.warn('Supabase save staff error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save staff to Supabase:', err);
    return false;
  }
}

export async function deleteStaffFromDB(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete staff error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete staff from Supabase:', err);
    return false;
  }
}

// ==========================================
// CUSTOMER TICKETS API
// ==========================================
export async function getTicketsFromDB(): Promise<Ticket[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch tickets error:', error.message);
      return null;
    }

    return (data || []).map((t) => ({
      id: t.id,
      number: t.number,
      businessId: t.business_id,
      businessName: t.business_name || '',
      categoryId: t.category_id,
      categoryName: t.category_name,
      customerName: t.customer_name || 'Guest Customer',
      phoneNumber: t.phone_number || undefined,
      status: t.status,
      counterId: t.counter_id || undefined,
      counterName: t.counter_name || undefined,
      qrCodeData: t.qr_code_data || undefined,
      isScanned: t.is_scanned ?? false,
      scannedAt: t.scanned_at ? Number(t.scanned_at) : undefined,
      createdAt: Number(t.created_at),
      calledAt: t.called_at ? Number(t.called_at) : undefined,
      completedAt: t.completed_at ? Number(t.completed_at) : undefined,
    }));
  } catch (err) {
    console.warn('Failed to query Supabase tickets:', err);
    return null;
  }
}

export async function saveTicketToDB(ticket: Ticket): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('tickets').upsert({
      id: ticket.id,
      number: ticket.number,
      business_id: ticket.businessId || 'city-bank',
      business_name: ticket.businessName || 'City Bank',
      customer_name: ticket.customerName,
      phone_number: ticket.phoneNumber,
      category_id: ticket.categoryId,
      category_name: ticket.categoryName,
      status: ticket.status,
      counter_id: ticket.counterId,
      counter_name: ticket.counterName,
      qr_code_data: ticket.qrCodeData,
      is_scanned: ticket.isScanned ?? false,
      scanned_at: ticket.scannedAt,
      created_at: ticket.createdAt,
      called_at: ticket.calledAt,
      completed_at: ticket.completedAt,
    });

    if (error) {
      console.warn('Supabase save ticket error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to save ticket to Supabase:', err);
    return false;
  }
}

export async function deleteTicketFromDB(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete ticket error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete ticket from Supabase:', err);
    return false;
  }
}
