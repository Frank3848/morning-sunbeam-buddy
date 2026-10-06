CREATE OR REPLACE FUNCTION public.claim_welcome_bonus()
RETURNS numeric
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_claims jsonb := auth.jwt();
  v_email text;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_email := v_claims->>'email';
  v_name := COALESCE(v_claims->'user_metadata'->>'name', split_part(v_email, '@', 1), 'User');

  SELECT balance INTO v_balance
  FROM public.profiles
  WHERE id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    IF v_email IS NULL THEN
      RAISE EXCEPTION 'Account email is unavailable';
    END IF;

    INSERT INTO public.profiles (id, name, email)
    VALUES (v_uid, v_name, v_email)
    ON CONFLICT (id) DO NOTHING;

    SELECT balance INTO v_balance
    FROM public.profiles
    WHERE id = v_uid
    FOR UPDATE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.transactions
    WHERE user_id = v_uid
  ) THEN
    RETURN v_balance;
  END IF;

  UPDATE public.profiles
  SET balance = balance + 500000
  WHERE id = v_uid
  RETURNING balance INTO v_balance;

  INSERT INTO public.transactions (user_id, type, amount, description, status)
  VALUES (v_uid, 'credit', 500000, 'Welcome Bonus 🎉', 'completed');

  RETURN v_balance;
END;
$function$;
REVOKE ALL ON FUNCTION public.claim_welcome_bonus() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_welcome_bonus() TO authenticated;