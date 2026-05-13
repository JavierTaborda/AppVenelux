import { supabase } from "@/lib/supabase";
import { jwtDecode } from "jwt-decode";

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (error) {
    throw error;
  }

  return data?.role ?? null;
}

interface CustomJwtPayload {
  "app-role": string;
  [key: string]: any; // opt: other camps if have errors
}

export async function getUserRoleJWT(token: string): Promise<string> {
  const decoded = jwtDecode<CustomJwtPayload>(token);

  const role = String(decoded["app-role"]);

  return role;
}
export async function getVenCode(token: string): Promise<string> {
  const decoded = jwtDecode<CustomJwtPayload>(token);

  const code = String(decoded["codven"]);

  return code;
}
export async function getName(token: string): Promise<string> {
  const decoded = jwtDecode<CustomJwtPayload>(token);
  const code = String(decoded["name-user"]);

  return code;
}
 