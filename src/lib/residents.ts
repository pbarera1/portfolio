// lib/residents.ts
import { supabaseAdmin } from './supabase';

export async function ensureResident(name: string): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('residents')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id;

  const { data: ins, error: insErr } = await sb
    .from('residents')
    .insert({ name })
    .select('id')
    .single();

  if (insErr) throw insErr;
  return ins!.id as number;
}

export async function logObservation(residentName: string, note: string) {
  const sb = supabaseAdmin();
  const residentId = await ensureResident(residentName);

  const { data, error } = await sb
    .from('observations')
    .insert({ resident_id: residentId, note })
    .select('id')
    .single();
  if (error) throw error;
  return data!.id as number;
}

export async function queryObservations(
  residentName: string,
  sinceDays = 7
) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('v_observations')
    .select('*')
    .eq('resident_name', residentName)
    .gte('created_at', new Date(Date.now() - sinceDays * 86400000).toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** naive duplicate guard */
export async function isRecentDuplicate(
  residentName: string,
  note: string,
  minutes = 10
) {
  const sb = supabaseAdmin();
  const cutoff = new Date(Date.now() - minutes * 60000).toISOString();
  const { data, error } = await sb
    .from('v_observations')
    .select('id')
    .eq('resident_name', residentName)
    .eq('note', note)
    .gte('created_at', cutoff)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}


export type ObservationRow = {
	id: number;
	note: string;
	created_at: string; // ISO
  };

  export type ResidentRow = {
	id: number;
	name: string;
  };

  export type ResidentWithObservations = ResidentRow & {
	observations: ObservationRow[];
  };

  /**
   * Returns all residents with their observations nested.
   * - Orders residents by name ASC
   * - Orders observations by created_at DESC
   * - Optionally limit observations per resident
   */
  export async function listResidentsWithObservations(options?: {
	limitPerResident?: number;
  }): Promise<ResidentWithObservations[]> {
	const { limitPerResident } = options ?? {};
	const sb = supabaseAdmin();

	// Nested select relies on the FK: observations.resident_id -> residents.id
	// You can rename the nested key using `observations:observations(...)`
	let query = sb
	  .from('residents')
	  .select(
		`
		id,
		name,
		observations:observations (
		  id,
		  note,
		  created_at
		)
	  `
	  )
	  .order('name', { ascending: true })
	  // Order inside the nested table:
	  .order('created_at', { referencedTable: 'observations', ascending: false });

	if (typeof limitPerResident === 'number' && limitPerResident > 0) {
	  query = query.limit(limitPerResident, { referencedTable: 'observations' });
	}

	const { data, error } = await query;
	if (error) throw error;

	// Supabase returns typed JSON; cast to our explicit type (no `any`)
	return (data ?? []) as unknown as ResidentWithObservations[];
  }
