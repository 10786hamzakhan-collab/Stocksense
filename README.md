# StockSense Hub

Build a complete production-quality web application called "StockSense" for the Odoo x LPU Jalandhar Hackathon 2026.

IMPORTANT:

This is NOT a landing page or a static UI mockup. Build a functional Inventory Management System (IMS) with working CRUD operations, stock calculations, validation, search, filters, and persistent database storage.

The application must closely follow this problem statement:

StockSense is an inventory management system that digitizes and centralizes stock-related operations.

TARGET USERS:

- Inventory Managers

- Warehouse Staff

CORE NAVIGATION:

1. Dashboard

2. Products

3. Operations

   - Receipts

   - Delivery Orders

   - Internal Transfers

   - Inventory Adjustments

   - Move History / Stock Ledger

4. Settings

   - Warehouse

5. Profile

   - My Profile

   - Logout

AUTHENTICATION:

- Login/signup

- Password reset

- Authenticated users should be redirected to the Inventory Dashboard.

DASHBOARD:

Create a professional modern inventory dashboard showing:

- Total Products in Stock

- Low Stock Items

- Out of Stock Items

- Pending Receipts

- Pending Deliveries

- Internal Transfers

- Recent stock movements

- Low-stock alerts

- Inventory summary charts

Add dynamic filters:

- Document type: Receipts / Delivery / Internal / Adjustments

- Status: Draft / Waiting / Ready / Done / Canceled

- Warehouse/location

- Product category

PRODUCT MANAGEMENT:

Users must be able to:

- Create products

- Edit products

- View products

- Search products

- Filter products

- Delete products when safe

Each product should support:

- Product name

- SKU / Code

- Category

- Unit of Measure

- Initial stock

- Current stock

- Minimum/reorder level

- Warehouse/location

RECEIPTS:

Used when goods arrive from vendors.

Workflow:

1. Create receipt

2. Select supplier

3. Add products

4. Enter received quantities

5. Save as draft

6. Validate receipt

7. On validation, automatically increase stock

Example:

Receiving 50 Steel Rods must increase stock by 50.

DELIVERY ORDERS:

Used when stock leaves the warehouse.

Workflow:

1. Create delivery

2. Select customer

3. Add products

4. Enter quantities

5. Save as draft

6. Validate delivery

7. On validation, automatically decrease stock

Prevent delivery quantities from exceeding available stock.

INTERNAL TRANSFERS:

Allow movement between locations/warehouses.

Examples:

- Main Warehouse → Production Floor

- Rack A → Rack B

- Warehouse 1 → Warehouse 2

On validation:

- Decrease quantity at source location

- Increase quantity at destination location

- Total company stock must remain unchanged

- Record the movement in the stock ledger

INVENTORY ADJUSTMENTS:

Allow users to correct recorded stock against physical count.

Workflow:

1. Select product

2. Select location

3. Show current recorded quantity

4. Enter physical counted quantity

5. Calculate difference

6. Validate adjustment

7. Update stock

8. Record adjustment in ledger

STOCK LEDGER:

Create a complete movement history containing:

- Date/time

- Reference/document number

- Product

- SKU

- Operation type

- Source location

- Destination location

- Quantity

- Before stock

- After stock

- User

- Status

Add search and filters.

WAREHOUSES:

Support multiple warehouses/locations.

Users should be able to:

- Create warehouse

- Create locations

- View inventory by warehouse

- View stock by location

LOW STOCK:

Products below their reorder/minimum level should automatically appear in Low Stock Alerts.

UI/UX:

Create a polished professional SaaS dashboard inspired by modern ERP/inventory applications.

Use:

- Clean sidebar navigation

- Top navigation/header

- Responsive layout

- Professional cards

- Data tables

- Modal/dialog forms

- Toast notifications

- Status badges

- Empty states

- Loading states

- Confirmation dialogs

- Proper form validation

Use a professional purple/violet accent that visually fits the Odoo-style hackathon environment, but DO NOT copy Odoo's UI exactly.

Make the interface feel like a real commercial inventory management product.

TECHNICAL REQUIREMENTS:

- Use React + TypeScript

- Use Tailwind CSS

- Use a proper component architecture

- Use Supabase for authentication and persistent database storage

- Create the required database tables and relationships

- Use Row Level Security appropriately

- Do not use localStorage as the primary database

- Keep business logic modular and maintainable

- Use realistic seed/demo data so the dashboard is not empty on first launch

DATABASE SHOULD INCLUDE AT LEAST:

- profiles

- warehouses

- locations

- categories

- products

- suppliers

- customers

- receipts

- receipt_items

- deliveries

- delivery_items

- transfers

- transfer_items

- adjustments

- stock_movements

IMPORTANT STOCK LOGIC:

Stock must NOT simply be a hardcoded number.

Every validated inventory operation must create the appropriate stock movement and update inventory correctly.

Receipts: stock increases.

Deliveries: stock decreases.

Transfers: source decreases and destination increases.

Adjustments: stock changes by physical-count difference.

Prevent negative stock unless an explicit adjustment operation permits it.

Add proper validation and error handling.

DEMO DATA:

Create realistic demo inventory data including products such as:

- Steel Rods

- Office Chairs

- Laptops

- Safety Helmets

- Welding Machines

- Bolts

- Nuts

- Steel Sheets

Create several warehouses/locations, suppliers, customers, and historical stock movements.

DASHBOARD DEMO:

The dashboard should immediately show meaningful KPIs, recent movements, low-stock products, and charts using the demo data.

RESPONSIVENESS:

The entire application must work properly on:

- Desktop

- Tablet

- Mobile

IMPORTANT DEVELOPMENT RULE:

Do not stop after creating the dashboard.

Implement the complete working MVP including authentication, database, CRUD, inventory operations, stock calculations, ledger, filters, and demo data.

Before finishing:

1. Check all navigation links.

2. Check all forms.

3. Check CRUD operations.

4. Test receipt stock increase.

5. Test delivery stock decrease.

6. Test internal transfer.

7. Test stock adjustment.

8. Test low-stock detection.

9. Test stock ledger entries.

10. Fix obvious TypeScript/runtime errors.

11. Make sure the app can be deployed successfully.

Build the application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/41056ac4-88b5-5e42-9f8f-bf26189b3d0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
