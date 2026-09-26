import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DocStatus = Database["public"]["Enums"]["doc_status"];
export type MoveType = Database["public"]["Enums"]["move_type"];

export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
export type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type StockLevel = Database["public"]["Tables"]["stock_levels"]["Row"];

export const DOC_STATUSES: DocStatus[] = ["draft", "waiting", "ready", "done", "canceled"];

export const OPERATION_LABELS: Record<MoveType, string> = {
  receipt: "Receipt",
  delivery: "Delivery",
  transfer: "Internal Transfer",
  adjustment: "Adjustment",
};

export type DocKind = "receipt" | "delivery" | "transfer";

export type LocationWithWarehouse = LocationRow & { warehouses: Pick<Warehouse, "id" | "name" | "code"> | null };

export type ProductWithStock = Product & {
  categories: Pick<Category, "id" | "name"> | null;
  stock_levels: { location_id: string; quantity: number }[];
  total_stock: number;
};

export type StockState = "in_stock" | "low" | "out";

export function stockState(p: { total_stock: number; min_stock: number }): StockState {
  if (p.total_stock <= 0) return "out";
  if (p.total_stock <= p.min_stock) return "low";
  return "in_stock";
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ----------------------------- master data ----------------------------- */

export async function fetchWarehouses() {
  return unwrap(await supabase.from("warehouses").select("*").order("name"));
}

export async function fetchLocations(): Promise<LocationWithWarehouse[]> {
  return unwrap(
    await supabase
      .from("locations")
      .select("*, warehouses(id, name, code)")
      .order("code"),
  ) as LocationWithWarehouse[];
}

export async function fetchCategories() {
  return unwrap(await supabase.from("categories").select("*").order("name"));
}

export async function fetchSuppliers() {
  return unwrap(await supabase.from("suppliers").select("*").order("name"));
}

export async function fetchCustomers() {
  return unwrap(await supabase.from("customers").select("*").order("name"));
}

export async function fetchProducts(): Promise<ProductWithStock[]> {
  const rows = unwrap(
    await supabase
      .from("products")
      .select("*, categories(id, name), stock_levels(location_id, quantity)")
      .order("name"),
  ) as (Product & {
    categories: Pick<Category, "id" | "name"> | null;
    stock_levels: { location_id: string; quantity: number }[];
  })[];

  return rows.map((r) => ({
    ...r,
    stock_levels: r.stock_levels ?? [],
    total_stock: (r.stock_levels ?? []).reduce((sum, s) => sum + Number(s.quantity), 0),
  }));
}

export async function fetchStockLevels() {
  return unwrap(
    await supabase
      .from("stock_levels")
      .select("*, products(id, name, sku, uom, min_stock), locations(id, name, code, warehouse_id)"),
  ) as (StockLevel & {
    products: Pick<Product, "id" | "name" | "sku" | "uom" | "min_stock"> | null;
    locations: (Pick<LocationRow, "id" | "name" | "code" | "warehouse_id">) | null;
  })[]; 
  /* ---------------------------- product data logic ---------------------------- */

export type ProductInput = {
  name: string;
  sku: string;
  category_id?: string | null;
  uom?: string;
  initial_stock?: number;
  min_stock?: number;
  unit_cost?: number;
  default_location_id?: string | null;
};

/**
 * Create a new product.
 */
export async function createProduct(input: ProductInput) {
  const initialStock = Number(input.initial_stock ?? 0);

  if (initialStock < 0) {
    throw new Error("Initial stock cannot be negative.");
  }

  if (!input.name.trim()) {
    throw new Error("Product name is required.");
  }

  if (!input.sku.trim()) {
    throw new Error("SKU is required.");
  }

  const productInsert = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      sku: input.sku.trim(),
      category_id: input.category_id ?? null,
      uom: input.uom?.trim() || "Units",
      initial_stock: initialStock,
      min_stock: Number(input.min_stock ?? 0),
      unit_cost: Number(input.unit_cost ?? 0),
      default_location_id: input.default_location_id ?? null,
    })
    .select("*")
    .single();

  if (productInsert.error) {
    throw new Error(productInsert.error.message);
  }

  const product = productInsert.data;

  // Create the initial stock level at the selected default location.
  if (initialStock > 0 && input.default_location_id) {
    const stockInsert = await supabase
      .from("stock_levels")
      .insert({
        product_id: product.id,
        location_id: input.default_location_id,
        quantity: initialStock,
      });

    if (stockInsert.error) {
      // Roll back the product if stock creation fails.
      await supabase.from("products").delete().eq("id", product.id);

      throw new Error(stockInsert.error.message);
    }
  }

  return product;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>,
) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    if (!input.name.trim()) {
      throw new Error("Product name cannot be empty.");
    }

    updateData.name = input.name.trim();
  }

  if (input.sku !== undefined) {
    if (!input.sku.trim()) {
      throw new Error("SKU cannot be empty.");
    }

    updateData.sku = input.sku.trim();
  }

  if (input.category_id !== undefined) {
    updateData.category_id = input.category_id;
  }

  if (input.uom !== undefined) {
    updateData.uom = input.uom.trim() || "Units";
  }

  if (input.initial_stock !== undefined) {
    if (Number(input.initial_stock) < 0) {
      throw new Error("Initial stock cannot be negative.");
    }

    updateData.initial_stock = Number(input.initial_stock);
  }

  if (input.min_stock !== undefined) {
    if (Number(input.min_stock) < 0) {
      throw new Error("Minimum stock cannot be negative.");
    }

    updateData.min_stock = Number(input.min_stock);
  }

  if (input.unit_cost !== undefined) {
    if (Number(input.unit_cost) < 0) {
      throw new Error("Unit cost cannot be negative.");
    }

    updateData.unit_cost = Number(input.unit_cost);
  }

  if (input.default_location_id !== undefined) {
    updateData.default_location_id = input.default_location_id;
  }

  const result = await supabase
    .from("products")
    .update(updateData as never)
    .eq("id", productId)
    .select("*")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Get a single product by ID.
 */
export async function getProductById(
  productId: string,
): Promise<ProductWithStock | null> {
  const result = await supabase
    .from("products")
    .select("*, categories(id, name), stock_levels(location_id, quantity)")
    .eq("id", productId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    return null;
  }

  const row = result.data as Product & {
    categories: Pick<Category, "id" | "name"> | null;
    stock_levels: { location_id: string; quantity: number }[];
  };

  return {
    ...row,
    stock_levels: row.stock_levels ?? [],
    total_stock: (row.stock_levels ?? []).reduce(
      (sum, stock) => sum + Number(stock.quantity),
      0,
    ),
  };
}

/**
 * Search products by name or SKU.
 */
export async function searchProducts(searchTerm: string) {
  const term = searchTerm.trim();

  if (!term) {
    return fetchProducts();
  }

  const result = await supabase
    .from("products")
    .select("*, categories(id, name), stock_levels(location_id, quantity)")
    .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
    .order("name");

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).map((product) => {
    const stockLevels = product.stock_levels ?? [];

    return {
      ...product,
      stock_levels: stockLevels,
      total_stock: stockLevels.reduce(
        (sum, stock) => sum + Number(stock.quantity),
        0,
      ),
    };
  }) as ProductWithStock[];
}

/**
 * Delete a product.
 */
export async function deleteProduct(productId: string) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  const result = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (result.error) {
    throw new Error(result.error.message);
  }
}
}

/* ------------------------------ documents ------------------------------ */

export type DocumentRow = {
  id: string;
  reference: string;
  status: DocStatus;
  scheduled_date: string;
  note: string;
  validated_at: string | null;
  created_at: string;
  supplier_id?: string | null;
  customer_id?: string | null;
  source_location_id?: string | null;
  destination_location_id?: string | null;
  suppliers?: { name: string } | null;
  customers?: { name: string } | null;
  items: { id: string; product_id: string; quantity: number; products: { name: string; sku: string; uom: string } | null }[];
};

const DOC_CONFIG = {
  receipt: {
    table: "receipts",
    itemTable: "receipt_items",
    fk: "receipt_id",
    select:
      "*, suppliers(name), items:receipt_items(id, product_id, quantity, products(name, sku, uom))",
    rpc: "validate_receipt",
  },
  delivery: {
    table: "deliveries",
    itemTable: "delivery_items",
    fk: "delivery_id",
    select:
      "*, customers(name), items:delivery_items(id, product_id, quantity, products(name, sku, uom))",
    rpc: "validate_delivery",
  },
  transfer: {
    table: "transfers",
    itemTable: "transfer_items",
    fk: "transfer_id",
    select: "*, items:transfer_items(id, product_id, quantity, products(name, sku, uom))",
    rpc: "validate_transfer",
  },
} as const;

export function docConfig(kind: DocKind) {
  return DOC_CONFIG[kind];
}

export async function fetchDocuments(kind: DocKind): Promise<DocumentRow[]> {
  const cfg = DOC_CONFIG[kind];
  const res = await supabase
    .from(cfg.table)
    .select(cfg.select)
    .order("created_at", { ascending: false });
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as unknown as DocumentRow[];
}

export type DocLineInput = { product_id: string; quantity: number };

export async function createDocument(
  kind: DocKind,
  header: Record<string, unknown>,
  lines: DocLineInput[],
) {
  const cfg = DOC_CONFIG[kind];
  const refRes = await supabase.rpc("next_reference", { p_kind: kind });
  if (refRes.error) throw new Error(refRes.error.message);
  const { data: userData } = await supabase.auth.getUser();

  const insert = await supabase
    .from(cfg.table)
    .insert({ ...header, reference: refRes.data as string, created_by: userData.user?.id ?? null } as never)
    .select("id")
    .single();
  if (insert.error) throw new Error(insert.error.message);
  const docId = (insert.data as { id: string }).id;

  if (lines.length) {
    const items = await supabase
      .from(cfg.itemTable)
      .insert(lines.map((l) => ({ ...l, [cfg.fk]: docId })) as never);
    if (items.error) throw new Error(items.error.message);
  }
  return docId;
}

export async function replaceDocumentLines(kind: DocKind, docId: string, lines: DocLineInput[]) {
  const cfg = DOC_CONFIG[kind];
  const del = await supabase.from(cfg.itemTable).delete().eq(cfg.fk, docId);
  if (del.error) throw new Error(del.error.message);
  if (lines.length) {
    const ins = await supabase
      .from(cfg.itemTable)
      .insert(lines.map((l) => ({ ...l, [cfg.fk]: docId })) as never);
    if (ins.error) throw new Error(ins.error.message);
  }
}

export async function updateDocument(kind: DocKind, docId: string, patch: Record<string, unknown>) {
  const cfg = DOC_CONFIG[kind];
  const res = await supabase.from(cfg.table).update(patch as never).eq("id", docId);
  if (res.error) throw new Error(res.error.message);
}

export async function deleteDocument(kind: DocKind, docId: string) {
  const cfg = DOC_CONFIG[kind];
  const res = await supabase.from(cfg.table).delete().eq("id", docId);
  if (res.error) throw new Error(res.error.message);
}

export async function validateDocument(kind: DocKind, docId: string) {
  const cfg = DOC_CONFIG[kind];
  const res = await supabase.rpc(cfg.rpc, { p_id: docId });
  if (res.error) throw new Error(res.error.message);
}

/* ----------------------------- adjustments ----------------------------- */

export type AdjustmentRow = Database["public"]["Tables"]["adjustments"]["Row"] & {
  products: { name: string; sku: string; uom: string } | null;
  locations: { name: string; code: string } | null;
};

export async function fetchAdjustments(): Promise<AdjustmentRow[]> {
  return unwrap(
    await supabase
      .from("adjustments")
      .select("*, products(name, sku, uom), locations(name, code)")
      .order("created_at", { ascending: false }),
  ) as AdjustmentRow[];
}

export async function createAdjustment(input: {
  product_id: string;
  location_id: string;
  recorded_qty: number;
  counted_qty: number;
  reason: string;
}) {
  const refRes = await supabase.rpc("next_reference", { p_kind: "adjustment" });
  if (refRes.error) throw new Error(refRes.error.message);
  const { data: userData } = await supabase.auth.getUser();
  const res = await supabase
    .from("adjustments")
    .insert({
      ...input,
      difference: input.counted_qty - input.recorded_qty,
      reference: refRes.data as string,
      created_by: userData.user?.id ?? null,
    })
    .select("id")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data.id;
}

export async function validateAdjustment(id: string) {
  const res = await supabase.rpc("validate_adjustment", { p_id: id });
  if (res.error) throw new Error(res.error.message);
}

export async function deleteAdjustment(id: string) {
  const res = await supabase.from("adjustments").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

/* ------------------------------- ledger -------------------------------- */

export type MovementRow = Database["public"]["Tables"]["stock_movements"]["Row"] & {
  products: { name: string; sku: string; uom: string } | null;
  source: { name: string; code: string } | null;
  destination: { name: string; code: string } | null;
};

export async function fetchMovements(limit = 500): Promise<MovementRow[]> {
  return unwrap(
    await supabase
      .from("stock_movements")
      .select(
        "*, products(name, sku, uom), source:locations!stock_movements_source_location_id_fkey(name, code), destination:locations!stock_movements_destination_location_id_fkey(name, code)",
      )
      .order("occurred_at", { ascending: false })
      .limit(limit),
  ) as MovementRow[];
}

/* ------------------------------- profile -------------------------------- */

export async function fetchProfile(userId: string) {
  const res = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function formatQty(value: number | string) {
  const n = Number(value);
  return Number.isInteger(n) ? n.toLocaleString("en-IN") : n.toFixed(2);
}
