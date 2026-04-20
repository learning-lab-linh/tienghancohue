import { getSupabaseServerClient } from "@/lib/supabaseServer";

const TABLE = "classes";

function mapClassRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    schedule: row.schedule ?? "",
    schoolYear: row.school_year ?? "",
    teacher: row.teacher ?? "",
    code: row.code ?? "",
    archived: Boolean(row.archived),
    createdAt: row.created_at ?? null,
  };
}

async function generateJoinCode(client) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const { data, error } = await client.from(TABLE).select("code");
  if (error) throw error;
  const used = new Set(
    (data ?? [])
      .map((c) => String(c.code ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let s = "";
    for (let i = 0; i < 6; i += 1) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!used.has(s)) return s;
  }
  return `C${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export async function listClasses({ includeArchived = false } = {}) {
  const client = getSupabaseServerClient();
  let query = client.from(TABLE).select("*").order("created_at", {
    ascending: false,
  });
  if (!includeArchived) query = query.eq("archived", false);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapClassRow);
}

export async function getClassById(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("id", n)
    .maybeSingle();
  if (error) throw error;
  return data ? mapClassRow(data) : null;
}

/** Mã lớp 6 ký tự (không phân biệt hoa thường). Chỉ lớp chưa lưu trữ. */
export async function getClassByJoinCode(code) {
  const raw = String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!raw) return null;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("code", raw)
    .eq("archived", false)
    .maybeSingle();
  if (error) throw error;
  return data ? mapClassRow(data) : null;
}

export async function createClass({
  name,
  description,
  schedule,
  schoolYear,
  teacher,
}) {
  const client = getSupabaseServerClient();
  const joinCode = await generateJoinCode(client);
  const payload = {
    name: String(name).trim(),
    description: String(description ?? "").trim(),
    schedule: String(schedule ?? "").trim(),
    school_year: String(schoolYear ?? "").trim(),
    teacher: String(teacher ?? "").trim().slice(0, 120),
    code: joinCode,
    archived: false,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapClassRow(data);
}

export async function updateClass(id, patch) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  const updatePayload = {};
  if (patch.name != null) updatePayload.name = String(patch.name).trim();
  if (patch.description != null)
    updatePayload.description = String(patch.description).trim();
  if (patch.schedule != null)
    updatePayload.schedule = String(patch.schedule).trim();
  if (patch.schoolYear != null)
    updatePayload.school_year = String(patch.schoolYear).trim();
  if (patch.teacher != null)
    updatePayload.teacher = String(patch.teacher).trim().slice(0, 120);
  if (typeof patch.archived === "boolean")
    updatePayload.archived = patch.archived;
  if (!Object.keys(updatePayload).length) return null;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .update(updatePayload)
    .eq("id", n)
    .select("*");
  if (error) throw error;
  if (!data?.length) return null;
  return mapClassRow(data[0]);
}

export async function deleteClass(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return false;
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from(TABLE)
    .delete()
    .eq("id", n)
    .select("id");
  if (error) throw error;
  return Boolean(data?.length);
}
