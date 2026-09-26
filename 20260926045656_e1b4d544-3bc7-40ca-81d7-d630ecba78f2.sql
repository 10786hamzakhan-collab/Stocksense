
-- ========== ENUMS ==========
CREATE TYPE public.doc_status AS ENUM ('draft','waiting','ready','done','canceled');
CREATE TYPE public.move_type AS ENUM ('receipt','delivery','transfer','adjustment');

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== MASTER DATA ==========
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'internal',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  uom text NOT NULL DEFAULT 'Units',
  initial_stock numeric NOT NULL DEFAULT 0,
  min_stock numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  default_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.stock_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0,
  UNIQUE (product_id, location_id)
);

-- ========== OPERATIONS ==========
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  destination_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  status public.doc_status NOT NULL DEFAULT 'draft',
  scheduled_date date NOT NULL DEFAULT current_date,
  note text NOT NULL DEFAULT '',
  validated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0)
);

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  source_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  status public.doc_status NOT NULL DEFAULT 'draft',
  scheduled_date date NOT NULL DEFAULT current_date,
  note text NOT NULL DEFAULT '',
  validated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.delivery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0)
);

CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  source_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  destination_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  status public.doc_status NOT NULL DEFAULT 'draft',
  scheduled_date date NOT NULL DEFAULT current_date,
  note text NOT NULL DEFAULT '',
  validated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0)
);

CREATE TABLE public.adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  recorded_qty numeric NOT NULL DEFAULT 0,
  counted_qty numeric NOT NULL DEFAULT 0,
  difference numeric NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  status public.doc_status NOT NULL DEFAULT 'draft',
  validated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  reference text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  operation_type public.move_type NOT NULL,
  source_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  destination_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  quantity numeric NOT NULL,
  before_qty numeric NOT NULL DEFAULT 0,
  after_qty numeric NOT NULL DEFAULT 0,
  user_id uuid,
  status public.doc_status NOT NULL DEFAULT 'done'
);

CREATE INDEX ON public.stock_movements (occurred_at DESC);
CREATE INDEX ON public.stock_levels (product_id);

-- ========== GRANTS + RLS (shared company data) ==========
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['warehouses','locations','categories','suppliers','customers','products',
    'stock_levels','receipts','receipt_items','deliveries','delivery_items','transfers','transfer_items',
    'adjustments','stock_movements']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "%s_auth_all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ========== REFERENCE SEQUENCES ==========
CREATE SEQUENCE public.seq_receipt START 1;
CREATE SEQUENCE public.seq_delivery START 1;
CREATE SEQUENCE public.seq_transfer START 1;
CREATE SEQUENCE public.seq_adjustment START 1;
GRANT USAGE ON SEQUENCE public.seq_receipt, public.seq_delivery, public.seq_transfer, public.seq_adjustment TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.next_reference(p_kind text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN CASE p_kind
    WHEN 'receipt' THEN 'RCP/' || to_char(nextval('public.seq_receipt'), 'FM00000')
    WHEN 'delivery' THEN 'DLV/' || to_char(nextval('public.seq_delivery'), 'FM00000')
    WHEN 'transfer' THEN 'TRF/' || to_char(nextval('public.seq_transfer'), 'FM00000')
    ELSE 'ADJ/' || to_char(nextval('public.seq_adjustment'), 'FM00000')
  END;
END; $$;
GRANT EXECUTE ON FUNCTION public.next_reference(text) TO authenticated;

-- ========== STOCK ENGINE ==========
CREATE OR REPLACE FUNCTION public.apply_move(
  p_product uuid, p_location uuid, p_delta numeric, p_reference text,
  p_type public.move_type, p_source uuid, p_dest uuid, p_allow_negative boolean DEFAULT false
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before numeric; v_after numeric;
BEGIN
  INSERT INTO public.stock_levels (product_id, location_id, quantity)
  VALUES (p_product, p_location, 0) ON CONFLICT (product_id, location_id) DO NOTHING;

  SELECT quantity INTO v_before FROM public.stock_levels
  WHERE product_id = p_product AND location_id = p_location FOR UPDATE;

  v_after := v_before + p_delta;
  IF v_after < 0 AND NOT p_allow_negative THEN
    RAISE EXCEPTION 'Insufficient stock for product % at this location (available %, required %)',
      (SELECT name FROM public.products WHERE id = p_product), v_before, abs(p_delta);
  END IF;

  UPDATE public.stock_levels SET quantity = v_after
  WHERE product_id = p_product AND location_id = p_location;

  INSERT INTO public.stock_movements
    (reference, product_id, operation_type, source_location_id, destination_location_id,
     quantity, before_qty, after_qty, user_id, status)
  VALUES (p_reference, p_product, p_type, p_source, p_dest, p_delta, v_before, v_after, auth.uid(), 'done');
END; $$;

CREATE OR REPLACE FUNCTION public.validate_receipt(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; it record;
BEGIN
  SELECT * INTO r FROM public.receipts WHERE id = p_id FOR UPDATE;
  IF r IS NULL THEN RAISE EXCEPTION 'Receipt not found'; END IF;
  IF r.status = 'done' THEN RAISE EXCEPTION 'Receipt already validated'; END IF;
  IF r.status = 'canceled' THEN RAISE EXCEPTION 'Receipt is canceled'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.receipt_items WHERE receipt_id = p_id) THEN
    RAISE EXCEPTION 'Add at least one product line before validating';
  END IF;
  FOR it IN SELECT * FROM public.receipt_items WHERE receipt_id = p_id LOOP
    PERFORM public.apply_move(it.product_id, r.destination_location_id, it.quantity,
      r.reference, 'receipt', NULL, r.destination_location_id, false);
  END LOOP;
  UPDATE public.receipts SET status = 'done', validated_at = now() WHERE id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_delivery(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; it record;
BEGIN
  SELECT * INTO r FROM public.deliveries WHERE id = p_id FOR UPDATE;
  IF r IS NULL THEN RAISE EXCEPTION 'Delivery not found'; END IF;
  IF r.status = 'done' THEN RAISE EXCEPTION 'Delivery already validated'; END IF;
  IF r.status = 'canceled' THEN RAISE EXCEPTION 'Delivery is canceled'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.delivery_items WHERE delivery_id = p_id) THEN
    RAISE EXCEPTION 'Add at least one product line before validating';
  END IF;
  FOR it IN SELECT * FROM public.delivery_items WHERE delivery_id = p_id LOOP
    PERFORM public.apply_move(it.product_id, r.source_location_id, -it.quantity,
      r.reference, 'delivery', r.source_location_id, NULL, false);
  END LOOP;
  UPDATE public.deliveries SET status = 'done', validated_at = now() WHERE id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_transfer(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; it record; v_before numeric; v_after numeric;
BEGIN
  SELECT * INTO r FROM public.transfers WHERE id = p_id FOR UPDATE;
  IF r IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF r.status = 'done' THEN RAISE EXCEPTION 'Transfer already validated'; END IF;
  IF r.status = 'canceled' THEN RAISE EXCEPTION 'Transfer is canceled'; END IF;
  IF r.source_location_id = r.destination_location_id THEN
    RAISE EXCEPTION 'Source and destination locations must differ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.transfer_items WHERE transfer_id = p_id) THEN
    RAISE EXCEPTION 'Add at least one product line before validating';
  END IF;
  FOR it IN SELECT * FROM public.transfer_items WHERE transfer_id = p_id LOOP
    -- source side (validated, records the ledger entry)
    INSERT INTO public.stock_levels (product_id, location_id, quantity)
    VALUES (it.product_id, r.source_location_id, 0) ON CONFLICT DO NOTHING;
    SELECT quantity INTO v_before FROM public.stock_levels
      WHERE product_id = it.product_id AND location_id = r.source_location_id FOR UPDATE;
    v_after := v_before - it.quantity;
    IF v_after < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product % at source location (available %, required %)',
        (SELECT name FROM public.products WHERE id = it.product_id), v_before, it.quantity;
    END IF;
    UPDATE public.stock_levels SET quantity = v_after
      WHERE product_id = it.product_id AND location_id = r.source_location_id;

    INSERT INTO public.stock_levels (product_id, location_id, quantity)
    VALUES (it.product_id, r.destination_location_id, 0) ON CONFLICT DO NOTHING;
    UPDATE public.stock_levels SET quantity = quantity + it.quantity
      WHERE product_id = it.product_id AND location_id = r.destination_location_id;

    INSERT INTO public.stock_movements
      (reference, product_id, operation_type, source_location_id, destination_location_id,
       quantity, before_qty, after_qty, user_id, status)
    VALUES (r.reference, it.product_id, 'transfer', r.source_location_id, r.destination_location_id,
       it.quantity, v_before, v_after, auth.uid(), 'done');
  END LOOP;
  UPDATE public.transfers SET status = 'done', validated_at = now() WHERE id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_adjustment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_before numeric; v_delta numeric;
BEGIN
  SELECT * INTO r FROM public.adjustments WHERE id = p_id FOR UPDATE;
  IF r IS NULL THEN RAISE EXCEPTION 'Adjustment not found'; END IF;
  IF r.status = 'done' THEN RAISE EXCEPTION 'Adjustment already validated'; END IF;
  IF r.status = 'canceled' THEN RAISE EXCEPTION 'Adjustment is canceled'; END IF;
  IF r.counted_qty < 0 THEN RAISE EXCEPTION 'Counted quantity cannot be negative'; END IF;

  INSERT INTO public.stock_levels (product_id, location_id, quantity)
  VALUES (r.product_id, r.location_id, 0) ON CONFLICT DO NOTHING;
  SELECT quantity INTO v_before FROM public.stock_levels
    WHERE product_id = r.product_id AND location_id = r.location_id FOR UPDATE;
  v_delta := r.counted_qty - v_before;

  UPDATE public.stock_levels SET quantity = r.counted_qty
    WHERE product_id = r.product_id AND location_id = r.location_id;

  INSERT INTO public.stock_movements
    (reference, product_id, operation_type, source_location_id, destination_location_id,
     quantity, before_qty, after_qty, user_id, status)
  VALUES (r.reference, r.product_id, 'adjustment', r.location_id, r.location_id,
     v_delta, v_before, r.counted_qty, auth.uid(), 'done');

  UPDATE public.adjustments
     SET status = 'done', validated_at = now(), recorded_qty = v_before, difference = v_delta
   WHERE id = p_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.validate_receipt(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_delivery(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_transfer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_adjustment(uuid) TO authenticated;
