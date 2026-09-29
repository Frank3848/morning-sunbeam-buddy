import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AUTH_READY_TIMEOUT_MS = 1800;

export const useAuthReady = () => {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    const finalize = (nextSession: Session | null) => {
      if (!mounted) return;
      resolved = true;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsReady(true);
    };

    const timeout = window.setTimeout(() => {
      if (resolved || !mounted) return;
      console.warn("Auth session restore timed out; continuing without blocking the UI.");
      finalize(null);
    }, AUTH_READY_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        window.clearTimeout(timeout);
        finalize(data.session ?? null);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        console.warn("Auth session restore failed:", error);
        finalize(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.clearTimeout(timeout);
      finalize(nextSession ?? null);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return { isReady, session, user };
};