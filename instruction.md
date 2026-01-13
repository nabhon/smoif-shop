# Architecture Design Document: QuickOrder System

**Author:** Senior Full Stack Developer

**Date:** 2026-01-13

**Tech Stack:** Next.js (Frontend), Express.js (Backend), SQLite (Database), **Nodemailer (Email Service)**

## 1\. High-Level Overview

The **QuickOrder System** is a lightweight e-commerce solution designed for rapid product ordering without user registration.

### Actors

- **Admin:** Authenticated user who creates products, manages inventory, **configures bank/QR payment details**, and **manually verifies payment slips**.
- **Guest User:** Unauthenticated user who browses, maintains a **local cart**, places orders, **uploads payment slips**, and receives email notifications upon completion.

### Core Philosophy

- **Split UX Strategy:**
  - **Guest (Mobile-First):** The shopping experience is optimized for touch, vertical scrolling, and speed on smartphones.
  - **Admin (Desktop-First):** The management panel is designed for **Desktop**, utilizing large screens for data tables, detailed verification views, and complex product variant matrices.
- **Products & Variants:** Relational (Strict SQL) for inventory.
- **Orders:** JSON Snapshot for historical integrity.
- **Cart:** Client-side only (localStorage). No database overhead for empty carts.
- **Payment:** Manual Bank Transfer with Slip Verification (Local file storage for V1).
- **Notifications:** Email alerts sent to guests only after Admin manually verifies the payment.

## 2\. System Architecture Diagram

graph TD  
subgraph "Client Side (Next.js)"  
Cart\[LocalStorage Cart\]  
UI\[User Interface\]  
AdminDash\[Admin Dashboard\]  
end  
<br/>subgraph "Server Side (Express.js)"  
API\[REST API Router\]  
Auth\[Admin Auth Middleware\]  
Uploads\[Multer File Upload\]  
Controllers\[Business Logic\]  
ORM\[Prisma Client\]  
Mailer\[Nodemailer Service\]  
end  
<br/>subgraph "Data Layer"  
SQLite\[(SQLite Database)\]  
FileStore\[Public Uploads Folder\]  
end  
<br/>Cart &lt;--&gt; UI  
UI -->|Create Order| API  
UI -->|Upload Slip| Uploads  
AdminDash -->|Verify Slip| API  
API -->|Trigger Email| Mailer  
Uploads -->|Save Image| FileStore  
Controllers --> ORM  
ORM --> SQLite

## 3\. Database Schema (SQLite)

### ER Diagram

erDiagram  
ADMIN {  
int id  
string username  
string password_hash  
}  
<br/>PAYMENT_CONFIG {  
int id  
string bank_name  
string account_name  
string account_number  
string qr_image_url  
boolean is_active  
}  
<br/>PRODUCT {  
int id  
string name  
decimal base_price  
boolean is_active  
}  
<br/>PRODUCT_VARIANT {  
int id  
int product_id  
decimal price  
int stock_quantity  
json combination_json  
}  
<br/>ORDER {  
int id  
string guest_name  
string guest_email  
decimal total_amount  
string status  
string slip_image_url  
datetime paid_at  
json order_items_snapshot  
datetime created_at  
}  
<br/>PRODUCT ||--|{ PRODUCT_VARIANT : has

### Table Details

#### 1\. Payment Config (New)

Stores the Admin's bank details to display to the user.

- **payment_config**:
  - bank_name (e.g., "Kasikorn Bank")
  - account_number (e.g., "123-4-56789-0")
  - account_name (e.g., "My Shop Co., Ltd.")
  - qr_image_url: Path to the QR code image uploaded by Admin.

#### 2\. Orders (Updated)

- **orders**:
  - status: Enum-like string.
    - 'WAITING_FOR_PAYMENT': Initial state.
    - 'VERIFYING_SLIP': User uploaded slip, waiting for Admin.
    - 'PAID': Admin confirmed slip.
    - 'CANCELLED': Admin rejected or timeout.
  - slip_image_url: Path to the uploaded slip image (nullable).

## 4\. Client-Side Data Structure (LocalStorage)

The "Cart Table" exists conceptually in the browser's localStorage to persist across refreshes for the Guest.

Key: quickorder_cart

Structure:

\[  
{  
"productId": 1,  
"variantId": 5,  
"name": "Red Shirt",  
"options": {"Color": "Red", "Size": "M"},  
"price": 140,  
"amount": 2,  
"maxStock": 10  
}  
\]

_On Checkout:_ This array is summed up and sent to POST /api/orders.

## 5\. API Specification (Express.js)

### Guest Endpoints

| **Method** | **Endpoint**        | **Description**                                                              |
| ---------- | ------------------- | ---------------------------------------------------------------------------- |
| GET        | /api/payment-config | Get Bank/QR details for checkout page                                        |
| ---        | ---                 | ---                                                                          |
| POST       | /api/orders         | Create Order (Status: WAITING_FOR_PAYMENT)                                   |
| ---        | ---                 | ---                                                                          |
| POST       | /api/orders/:id/pay | **Upload Slip**. Uses multipart/form-data. Updates status to VERIFYING_SLIP. |
| ---        | ---                 | ---                                                                          |

### Admin Endpoints

| **Method** | **Endpoint**              | **Description**                                            |
| ---------- | ------------------------- | ---------------------------------------------------------- |
| GET        | /api/orders               | List orders (Filter by status: VERIFYING_SLIP)             |
| ---        | ---                       | ---                                                        |
| POST       | /api/orders/:id/verify    | Approve slip. Status -> PAID. **Triggers Email to Guest.** |
| ---        | ---                       | ---                                                        |
| POST       | /api/orders/:id/reject    | Reject slip. Status -> WAITING_FOR_PAYMENT.                |
| ---        | ---                       | ---                                                        |
| PUT        | /api/admin/payment-config | Update Bank details/Upload new QR                          |
| ---        | ---                       | ---                                                        |

## 6\. Implementation Strategy

### Payment Flow Implementation

- **Checkout:**
  - User fills address -> Clicks "Place Order".
  - Frontend sends Cart JSON to API.
  - API calculates total (validating prices against DB), creates ORDER, returns { orderId: 123, total: 500 }.
- **Payment Page:**
  - Frontend redirects to /order/123/pay.
  - Fetches GET /api/payment-config to show QR Code.
  - User transfers money via Bank App.
  - User clicks "Upload Slip" -> Selects image.
  - Frontend POSTs image to /api/orders/123/pay.
- **Storage (Local):**
  - Backend uses multer.
  - Saves file to /public/uploads/slips/order_123_timestamp.jpg.
  - Updates DB slip_image_url.
- **Verification & Notification:**
  - Admin Dashboard shows "Pending Verification (1)".
  - Admin clicks view, sees the image side-by-side with order total.
  - Admin clicks "Approve".
  - **Backend updates status to PAID AND sends an email to guest_email saying "Order Confirmed".**

## 7\. User Journey & Experience

This section details the step-by-step flow for the Guest User.

### Step 1: Landing & Browsing

- **Scene:** User enters the website URL.
- **UI:** A responsive grid layout showing "Active" products. Each card displays the product image, name, and starting price.
- **Action:** User clicks on a Product Card (e.g., "Cool T-Shirt").

### Step 2: Product Configuration

- **Scene:** Product Detail Page.
- **UI:** Large product image, description, and **Option Selectors** (e.g., Color buttons: \[Red\] \[Blue\], Size dropdown: \[S\] \[M\] \[L\]).
- **Interaction:**
  - User selects "Red" and "M".
  - System updates displayed price from 100 -> 140 (based on variant).
  - User clicks **"Add to Cart"**.
- **System:** Item is added to localStorage. A toast notification appears "Added to Cart".

### Step 3: Cart Review

- **Scene:** User clicks the Cart icon in the navbar.
- **UI:** A summary list of items: "Red Shirt (M) x 2 = 280".
- **Action:** User can adjust quantity or remove items.
- **Next:** User clicks the **"Checkout / Order"** button.

### Step 4: Checkout & Order Creation

- **Scene:** Checkout Form.
- **UI:** Form fields for Guest Name, **Email (Critical for notification)**, and Shipping Address.
- **Action:** User submits the form.
- **System:**
  - Frontend sends data to POST /api/orders.
  - Backend creates Order #123 with status WAITING_FOR_PAYMENT.
  - Backend responds with the Order ID.
  - Frontend clears the cart from localStorage.

### Step 5: Payment (The "Waiting" Room)

- **Scene:** "Pay for Order #123" Page.
- **UI:**
  - Order Total: 280 THB.
  - **QR Code** (from Admin Config) and Bank Account details clearly displayed.
  - **"Upload Slip"** area.
- **Action:**
  - User opens their Banking App and scans the QR to pay.
  - User saves the slip to their phone/computer.
  - User uploads the slip image on the website.
- **System:** Backend uploads file -> Updates Order status to VERIFYING_SLIP.

### Step 6: Post-Payment State

- **Scene:** Order Status Page.
- **UI:** Displays: "Thank you! We have received your slip. Please wait for admin verification. We will send a confirmation to your email."
- **Note:** The user does not need to stay on this page. They can close the browser.

### Step 7: Completion (Async)

- **Trigger:** Admin verifies the slip in the Admin Panel.
- **Action:**
  - System marks order as PAID.
  - **Nodemailer** sends an email to the guest: "Your Order #123 has been confirmed! We are preparing it for shipping."

## 8\. Admin Journey & Experience (Desktop Focused)

The Admin Panel is designed for a **Desktop/Laptop** environment, prioritizing dense data display and efficiency over touch targets.

### Step 1: Dashboard (Overview)

- **Scene:** Admin logs in via Desktop.
- **UI:** A standard **Dashboard Layout** with a Sidebar (Products, Orders, Settings) and a Main Content Area.
  - **Top Stats Row:** "Revenue Today", "Orders to Verify", "Total Orders".
  - **Main Table:** A "Recent Orders" data table showing the last 10 interactions.

### Step 2: Order Verification (Split View)

- **Scene:** Reviewing multiple slips efficiently.
- **UI:**
  - **Layout:** A **Split-Pane** design.
    - **Left Pane (List):** A scrollable list of orders with status VERIFYING_SLIP.
    - **Right Pane (Detail):** When an order is clicked, the right pane populates.
  - **Slip Display:** The uploaded image is shown large on the right side, next to the Order Summary (Items, Total Price).
- **Interaction:**
  - Admin clicks Order #123 on the left.
  - Admin compares the image amount vs. order total on the right.
  - **Action Bar:** Admin clicks "Approve" or "Reject" (with reason input) in the top-right corner of the pane.

### Step 3: Product Management (Matrix Editor)

- **Scene:** Creating a complex product with multiple variants.
- **UI:**
  - **Product Form:** Standard inputs for Name, Description.
  - **Variant Matrix:** A dynamic **Data Grid / Table** for variants.
    - Columns: SKU, Color, Size, **Price (Editable Input)**, Stock (Editable Input).
    - **Bulk Actions:** "Generate all combinations" (e.g., Red/Blue \* S/M/L -> 6 rows generated automatically).
- **Action:** Admin can tab through the Price cells to set "Red+S = 120", "Red+M = 140" quickly using the keyboard.

### Step 4: Shop Settings

- **Scene:** Managing Payment Config.
- **UI:** A detailed settings form.
  - **QR Code:** Drag-and-drop zone for high-res images.
  - **Preview:** A live preview of how the checkout page will look with the current bank details.
