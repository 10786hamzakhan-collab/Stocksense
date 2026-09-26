
INSERT INTO public.warehouses (name, code, address) VALUES
 ('Main Warehouse','WH-MAIN','Industrial Area Phase 2, Ludhiana, Punjab'),
 ('North Distribution Center','WH-NORTH','GT Road, Jalandhar, Punjab'),
 ('Production Unit','WH-PROD','Focal Point, Phagwara, Punjab');

INSERT INTO public.locations (warehouse_id, name, code, type)
SELECT w.id, v.name, v.code, v.type FROM (VALUES
 ('WH-MAIN','Rack A','MAIN/RACK-A','internal'),
 ('WH-MAIN','Rack B','MAIN/RACK-B','internal'),
 ('WH-MAIN','Bulk Storage','MAIN/BULK','internal'),
 ('WH-NORTH','Stock Area','NORTH/STOCK','internal'),
 ('WH-NORTH','Dispatch Bay','NORTH/DISPATCH','internal'),
 ('WH-PROD','Production Floor','PROD/FLOOR','internal')
) AS v(wh,name,code,type) JOIN public.warehouses w ON w.code = v.wh;

INSERT INTO public.categories (name, description) VALUES
 ('Raw Materials','Metals and bulk construction inputs'),
 ('Furniture','Office and workshop furniture'),
 ('Electronics','IT and electronic equipment'),
 ('Safety Equipment','Personal protective equipment'),
 ('Machinery','Heavy tools and machines'),
 ('Fasteners','Bolts, nuts and fixings');

INSERT INTO public.suppliers (name, email, phone, address) VALUES
 ('Bharat Steel Works','sales@bharatsteel.in','+91 98140 22110','Mandi Gobindgarh, Punjab'),
 ('Nova Office Supplies','orders@novaoffice.in','+91 98722 55431','Chandigarh'),
 ('TechLine Distributors','contact@techline.in','+91 99150 77820','Mohali, Punjab'),
 ('SafeGuard Industrial','info@safeguard.in','+91 98555 31200','Ambala, Haryana');

INSERT INTO public.customers (name, email, phone, address) VALUES
 ('Grewal Constructions','accounts@grewalcon.in','+91 98156 44120','Jalandhar, Punjab'),
 ('LPU Campus Facilities','facilities@lpu.in','+91 18002 55555','Phagwara, Punjab'),
 ('Apex Fabricators','buy@apexfab.in','+91 97800 11223','Ludhiana, Punjab'),
 ('Northern Retail Group','po@northernretail.in','+91 96460 88991','Amritsar, Punjab');

INSERT INTO public.products (name, sku, category_id, uom, initial_stock, min_stock, unit_cost, default_location_id)
SELECT v.name, v.sku, c.id, v.uom, v.init, v.minq, v.cost, l.id
FROM (VALUES
 ('Steel Rods','SKU-STL-001','Raw Materials','Units',400,100,450.00,'MAIN/BULK'),
 ('Steel Sheets','SKU-STL-002','Raw Materials','Units',180,60,1250.00,'MAIN/BULK'),
 ('Office Chairs','SKU-FRN-101','Furniture','Units',75,20,4200.00,'MAIN/RACK-A'),
 ('Laptops','SKU-ELC-201','Electronics','Units',40,15,58000.00,'MAIN/RACK-B'),
 ('LED Monitors','SKU-ELC-202','Electronics','Units',30,12,11500.00,'MAIN/RACK-B'),
 ('Safety Helmets','SKU-SAF-301','Safety Equipment','Units',120,40,380.00,'NORTH/STOCK'),
 ('Safety Gloves','SKU-SAF-302','Safety Equipment','Pairs',200,80,150.00,'NORTH/STOCK'),
 ('Welding Machines','SKU-MCH-401','Machinery','Units',12,5,24500.00,'PROD/FLOOR'),
 ('Bolts','SKU-FST-501','Fasteners','Boxes',150,50,220.00,'MAIN/RACK-A'),
 ('Nuts','SKU-FST-502','Fasteners','Boxes',160,50,180.00,'MAIN/RACK-A')
) AS v(name,sku,cat,uom,init,minq,cost,loc)
JOIN public.categories c ON c.name = v.cat
JOIN public.locations l ON l.code = v.loc;

-- ===== Opening receipts (validated) =====
DO $$
DECLARE r_id uuid; d_id uuid; t_id uuid; a_id uuid; v_ref text;
BEGIN
  -- Receipt 1: raw materials + fasteners into Main Bulk / Rack A
  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='Bharat Steel Works'),
          (SELECT id FROM public.locations WHERE code='MAIN/BULK'), 'draft', current_date - 28, 'Opening stock - steel')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, id, q FROM (VALUES ('SKU-STL-001',400),('SKU-STL-002',180)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_receipt(r_id);

  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='Nova Office Supplies'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-A'), 'draft', current_date - 24, 'Furniture and fasteners')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, v.q FROM (VALUES ('SKU-FRN-101',75),('SKU-FST-501',150),('SKU-FST-502',160)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_receipt(r_id);

  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='TechLine Distributors'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-B'), 'draft', current_date - 20, 'IT equipment')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, v.q FROM (VALUES ('SKU-ELC-201',40),('SKU-ELC-202',30)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_receipt(r_id);

  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='SafeGuard Industrial'),
          (SELECT id FROM public.locations WHERE code='NORTH/STOCK'), 'draft', current_date - 16, 'PPE restock')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, v.q FROM (VALUES ('SKU-SAF-301',120),('SKU-SAF-302',200)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_receipt(r_id);

  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='Bharat Steel Works'),
          (SELECT id FROM public.locations WHERE code='PROD/FLOOR'), 'draft', current_date - 14, 'Welding equipment')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, 12 FROM public.products p WHERE p.sku = 'SKU-MCH-401';
  PERFORM public.validate_receipt(r_id);

  -- ===== Deliveries (validated) =====
  v_ref := public.next_reference('delivery');
  INSERT INTO public.deliveries (reference, customer_id, source_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.customers WHERE name='Grewal Constructions'),
          (SELECT id FROM public.locations WHERE code='MAIN/BULK'), 'draft', current_date - 10, 'Site order')
  RETURNING id INTO d_id;
  INSERT INTO public.delivery_items (delivery_id, product_id, quantity)
  SELECT d_id, p.id, v.q FROM (VALUES ('SKU-STL-001',180),('SKU-STL-002',120)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_delivery(d_id);

  v_ref := public.next_reference('delivery');
  INSERT INTO public.deliveries (reference, customer_id, source_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.customers WHERE name='LPU Campus Facilities'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-A'), 'draft', current_date - 7, 'Campus office setup')
  RETURNING id INTO d_id;
  INSERT INTO public.delivery_items (delivery_id, product_id, quantity)
  SELECT d_id, p.id, v.q FROM (VALUES ('SKU-FRN-101',60),('SKU-FST-501',120)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_delivery(d_id);

  v_ref := public.next_reference('delivery');
  INSERT INTO public.deliveries (reference, customer_id, source_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.customers WHERE name='Northern Retail Group'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-B'), 'draft', current_date - 4, 'Retail order')
  RETURNING id INTO d_id;
  INSERT INTO public.delivery_items (delivery_id, product_id, quantity)
  SELECT d_id, p.id, v.q FROM (VALUES ('SKU-ELC-201',28),('SKU-ELC-202',30)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_delivery(d_id);

  -- ===== Transfers (validated) =====
  v_ref := public.next_reference('transfer');
  INSERT INTO public.transfers (reference, source_location_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.locations WHERE code='MAIN/BULK'),
          (SELECT id FROM public.locations WHERE code='PROD/FLOOR'), 'draft', current_date - 6, 'Material issue to production')
  RETURNING id INTO t_id;
  INSERT INTO public.transfer_items (transfer_id, product_id, quantity)
  SELECT t_id, p.id, v.q FROM (VALUES ('SKU-STL-001',80),('SKU-STL-002',30)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_transfer(t_id);

  v_ref := public.next_reference('transfer');
  INSERT INTO public.transfers (reference, source_location_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.locations WHERE code='NORTH/STOCK'),
          (SELECT id FROM public.locations WHERE code='NORTH/DISPATCH'), 'draft', current_date - 3, 'Staging for dispatch')
  RETURNING id INTO t_id;
  INSERT INTO public.transfer_items (transfer_id, product_id, quantity)
  SELECT t_id, p.id, v.q FROM (VALUES ('SKU-SAF-301',90),('SKU-SAF-302',60)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;
  PERFORM public.validate_transfer(t_id);

  -- ===== Adjustment (validated) =====
  v_ref := public.next_reference('adjustment');
  INSERT INTO public.adjustments (reference, product_id, location_id, recorded_qty, counted_qty, reason, status)
  VALUES (v_ref, (SELECT id FROM public.products WHERE sku='SKU-FST-502'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-A'), 160, 148, 'Cycle count variance', 'draft')
  RETURNING id INTO a_id;
  PERFORM public.validate_adjustment(a_id);

  -- ===== Pending documents =====
  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='TechLine Distributors'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-B'), 'ready', current_date + 2, 'Awaiting vendor truck')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, v.q FROM (VALUES ('SKU-ELC-201',25),('SKU-ELC-202',20)) AS v(sku,q)
  JOIN public.products p ON p.sku = v.sku;

  v_ref := public.next_reference('receipt');
  INSERT INTO public.receipts (reference, supplier_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.suppliers WHERE name='Bharat Steel Works'),
          (SELECT id FROM public.locations WHERE code='MAIN/BULK'), 'draft', current_date + 5, 'Quarterly steel order')
  RETURNING id INTO r_id;
  INSERT INTO public.receipt_items (receipt_id, product_id, quantity)
  SELECT r_id, p.id, 250 FROM public.products p WHERE p.sku='SKU-STL-001';

  v_ref := public.next_reference('delivery');
  INSERT INTO public.deliveries (reference, customer_id, source_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.customers WHERE name='Apex Fabricators'),
          (SELECT id FROM public.locations WHERE code='MAIN/BULK'), 'waiting', current_date + 1, 'Pending stock confirmation')
  RETURNING id INTO d_id;
  INSERT INTO public.delivery_items (delivery_id, product_id, quantity)
  SELECT d_id, p.id, 60 FROM public.products p WHERE p.sku='SKU-STL-001';

  v_ref := public.next_reference('transfer');
  INSERT INTO public.transfers (reference, source_location_id, destination_location_id, status, scheduled_date, note)
  VALUES (v_ref, (SELECT id FROM public.locations WHERE code='MAIN/RACK-A'),
          (SELECT id FROM public.locations WHERE code='MAIN/RACK-B'), 'ready', current_date + 1, 'Rack reorganisation')
  RETURNING id INTO t_id;
  INSERT INTO public.transfer_items (transfer_id, product_id, quantity)
  SELECT t_id, p.id, 20 FROM public.products p WHERE p.sku='SKU-FST-501';
END $$;

-- Backdate validated documents and ledger entries for a realistic history
UPDATE public.receipts SET validated_at = created_at - ((30 - extract(day from age(current_date, scheduled_date))) || ' days')::interval WHERE status='done';
UPDATE public.stock_movements m SET occurred_at = now() - (row_number_days || ' days')::interval
FROM (
  SELECT id, (30 - (row_number() OVER (ORDER BY id)))::int AS row_number_days FROM public.stock_movements
) s WHERE m.id = s.id;
