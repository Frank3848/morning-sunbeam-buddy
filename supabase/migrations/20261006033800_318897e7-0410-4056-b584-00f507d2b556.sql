CREATE OR REPLACE FUNCTION public.claim_welcome_bonus()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_name text;
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT balance INTO v_balance
  FROM public.profiles
  WHERE id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    SELECT COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), email
    INTO v_name, v_email
    FROM auth.users
    WHERE id = v_uid;

    IF v_email IS NULL THEN
      RAISE EXCEPTION 'Account not found';
    END IF;

    INSERT INTO public.profiles (id, name, email)
    VALUES (v_uid, COALESCE(v_name, 'User'), v_email)
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
      AND type = 'credit'
      AND description = 'Welcome Bonus 🎉'
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