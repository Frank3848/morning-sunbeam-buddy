// Keeps `localStorage.currentUser` synced with the Supabase session + `profiles` row
// so legacy pages that still read `currentUser` keep working without a rewrite.
import { supabase } from "@/integrations/supabase/client";

export const syncCurrentUserFromSession = async () => {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const sUser = sess.session?.user;
    if (!sUser) {
      localStorage.removeItem("currentUser");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles" as any)
      .select("*")
      .eq("id", sUser.id)
      .maybeSingle();
    const merged = {
      id: sUser.id,
      email: sUser.email,
      name: (profile as any)?.name || sUser.user_metadata?.name || "",
      balance: Number((profile as any)?.balance ?? 0),
      profilePicture: (profile as any)?.profile_picture || "",
      referralCode: (profile as any)?.referral_code || "",
      referredBy: (profile as any)?.referred_by || null,
      referralCount: (profile as any)?.referral_count || 0,
      phone: (profile as any)?.phone || "",
    };
    localStorage.setItem("currentUser", JSON.stringify(merged));
  } catch (error) {
    console.warn("Could not sync current user from session:", error);
  }
};

export const installAuthBridge = () => {
  // Initial sync on app load
  void syncCurrentUserFromSession();
  // Re-sync on any auth change
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      localStorage.removeItem("currentUser");
      return;
    }
    void syncCurrentUserFromSession();
  });
};
