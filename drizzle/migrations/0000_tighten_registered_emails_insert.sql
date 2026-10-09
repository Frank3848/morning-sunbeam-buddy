DROP POLICY IF EXISTS "Anyone can register an email" ON public.registered_emails;

CREATE POLICY "Anyone can register an email"
ON public.registered_emails
FOR INSERT
TO public
WITH CHECK (
  email IS NOT NULL
  AND length(btrim(email)) BETWEEN 3 AND 320
  AND btrim(email) ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (name IS NULL OR length(name) <= 120)
);