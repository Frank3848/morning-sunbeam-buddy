CREATE OR REPLACE FUNCTION public.record_transaction(p_type text, p_amount numeric, p_description text)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid UUID := auth.uid();
  v_txn public.transactions;
  v_new_balance NUMERIC;
  v_max_balance CONSTANT NUMERIC := 1000000;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_type NOT IN ('credit','debit') THEN
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;
  IF p_type = 'debit' THEN
    RAISE EXCEPTION 'Withdrawals require access code verification';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE public.profiles
     SET balance = balance + p_amount
   WHERE id = v_uid AND balance + p_amount <= v_max_balance
   RETURNING balance INTO v_new_balance;
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet limit reached: your balance cannot exceed ₦1,000,000. Please withdraw some funds before claiming more.';
  END IF;

  INSERT INTO public.transactions (user_id, type, amount, description, status)
  VALUES (v_uid, p_type, p_amount, COALESCE(p_description,''), 'completed')
  RETURNING * INTO v_txn;

  RETURN v_txn;
END;
$function$;

CREATE OR REPLACE FUNCTION public.withdraw_with_access_code(
  p_amount numeric,
  p_description text,
  p_access_code text
)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_txn public.transactions;
  v_new_balance numeric;
  v_expected_code_hash bytea := decode('8c90fa1f3c4ce965fa82d6e8cde9ef8523a8e08d018471d525287d6fb96b8fe7', 'hex');
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  IF p_access_code IS NULL OR extensions.digest(convert_to(upper(btrim(p_access_code)), 'UTF8'), 'sha256') <> v_expected_code_hash THEN
    RAISE EXCEPTION 'Incorrect access code';
  END IF;

  UPDATE public.profiles
     SET balance = balance - p_amount
   WHERE id = v_uid AND balance >= p_amount
   RETURNING balance INTO v_new_balance;
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.transactions (user_id, type, amount, description, status)
  VALUES (v_uid, 'debit', p_amount, COALESCE(p_description, ''), 'completed')
  RETURNING * INTO v_txn;

  RETURN v_txn;
END;
$function$;
REVOKE ALL ON FUNCTION public.withdraw_with_access_code(numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.withdraw_with_access_code(numeric, text, text) TO authenticated;