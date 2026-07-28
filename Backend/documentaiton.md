`# JustFine API Documentation

## Base URL`

http://localhost:5000/api

text

```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require a valid JWT token.

**Header:**
```

Authorization: Bearer <token>

text

```

Token expires after **7 days**.

---

## 1. AUTH

### `POST /api/auth/register`
Create a new account. Automatically creates 10 default categories.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**

json

```
{
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Errors:** `400` (validation), `409` (duplicate username/email)

---

### **`POST /api/auth/login`**

**Body:**

json

```
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response (200):**

json

```
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Errors:** `400` (missing fields), `401` (invalid credentials)

---

### **`POST /api/auth/logout`**

Client must discard the token. No server-side invalidation.

**Response (200):**

json

```
{
  "message": "Logged out successfully"
}
```

---

### **`GET /api/auth/me`**

Get current user profile.

**Response (200):**

json

```
{
  "id": "uuid-string",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2026-01-01T12:00:00"
}
```

---

## **2. CATEGORIES**

### **`GET /api/categories`**

List all active categories for the user.

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "name": "Food & Dining",
    "description": null,
    "count": 12,
    "emoji": "🍕",
    "color": "#EF4444",
    "is_system": false,
    "is_default": false,
    "created_at": "2026-01-01T12:00:00"
  }
]
```

---

### **`POST /api/categories`**

Add a custom category.

**Body:**

json

```
{
  "name": "Pet Care",
  "description": "Food and vet bills",
  "emoji": "🐾",
  "color": "#F97316"
}
```

**Response (201):**

json

```
{
  "message": "Category created",
  "category": {
    "id": "uuid",
    "name": "Pet Care",
    "emoji": "🐾",
    "color": "#F97316",
    "is_system": false
  }
}
```

**Errors:** `400` (name required), `409` (duplicate)

---

### **`PUT /api/categories/<id>`**

Update a category. Cannot modify system categories ("Tithe", "Others").

**Body (partial):**

json

```
{
  "name": "Pets & Animals",
  "emoji": "🐶"
}
```

**Response (200):**

json

```
{
  "message": "Category updated"
}
```

**Errors:** `403` (system category), `404` (not found)

---

### **`DELETE /api/categories/<id>`**

Delete a category.

| **Condition** | **Behavior** |
| --- | --- |
| `count == 0` | Hard delete (permanently removed) |
| `count > 0` | Soft delete (`deleted_at` set) |
| `is_system == true` | Forbidden (`403`) |

**Response (200):**

json

```
{
  "message": "Category permanently deleted"
}
```

or

json

```
{
  "message": "Category soft deleted (has linked transactions)"
}
```

---

## **3. SOURCES**

### **`GET /api/sources`**

List all active sources with their partitions.

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "name": "HDFC Bank",
    "description": "Salary account",
    "amount": 10000000,
    "count": 25,
    "is_savings": false,
    "is_active": true,
    "created_at": "2026-01-01T12:00:00",
    "partitions": [
      {
        "id": "uuid",
        "name": "My Salary",
        "amount": 6000000,
        "count": 10,
        "is_visible": true
      }
    ]
  }
]
```

> **Note:** All amounts are in **paise**. ₹1,00,000 = `10000000`.
> 

---

### **`POST /api/sources`**

Add a source with optional partitions.

**Body:**

json

```
{
  "name": "SBI Bank",
  "description": "Secondary account",
  "amount": 5000000,
  "is_savings": false,
  "partitions": [
    {
      "name": "Emergency Fund",
      "amount": 2000000,
      "is_visible": true
    }
  ]
}
```

**Response (201):**

json

```
{
  "message": "Source created",
  "id": "uuid"
}
```

---

### **`PUT /api/sources/<id>`**

Update a source.

**Body (partial):**

json

```
{
  "name": "SBI Savings Account",
  "is_savings": true
}
```

**Response (200):**

json

```
{
  "message": "Source updated"
}
```

---

### **`DELETE /api/sources/<id>`**

Delete a source. Partitions are deleted first automatically.

| **Condition** | **Behavior** |
| --- | --- |
| `count == 0` | Hard delete |
| `count > 0` | Soft delete + `is_active = false` |

---

### **`GET /api/sources/<source_id>/partitions`**

Get partitions for a specific source.

---

### **`POST /api/sources/partitions`**

Add a partition to a source.

**Body:**

json

```
{
  "source_id": "uuid",
  "name": "Travel Fund",
  "amount": 1000000,
  "is_visible": true
}
```

---

### **`PUT /api/sources/partitions/<partition_id>`**

Update a partition.

---

### **`DELETE /api/sources/partitions/<partition_id>`**

Delete a partition. Soft delete if `count > 0`, else hard delete.

---

## **4. TRANSACTIONS**

### **Transaction Types**

| **Type** | **Description** |
| --- | --- |
| `income` | Money received (salary, gifts) |
| `expense` | Money spent (food, bills) |
| `transfer` | Money moved between sources |
| `debt_in` | Payment received for a debt you lent |
| `debt_out` | Payment made toward a debt you owe |
| `adjustment` | System corrections, annihilations |

---

### **`GET /api/transactions`**

List transactions with optional filters.

**Query Parameters:**

| **Param** | **Type** | **Description** | **Default** |
| --- | --- | --- | --- |
| `type` | string | `income`, `expense`, `transfer`, etc. | All |
| `category_id` | string | Filter by category UUID | All |
| `source_id` | string | Filter by source UUID | All |
| `debt_id` | string | Filter by debt UUID | All |
| `from_date` | ISO date | Start of date range | 14 days ago |
| `to_date` | ISO date | End of date range | Now |
| `window_days` | int | Show last N days | 14 |
| `sort` | string | `created_at_desc`, `created_at_asc`, `amount_desc`, `amount_asc` | `created_at_desc` |

**Example:**

text

```
GET /api/transactions?type=expense&category_id=uuid&window_days=30&sort=amount_desc
```

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "txn_id": "uuid (shared for paired transfers)",
    "user_id": "uuid",
    "txn_type": "expense",
    "category_id": "uuid",
    "category_name": "Food & Dining",
    "source_id": "uuid",
    "source_name": "HDFC Bank",
    "partition_id": "uuid or null",
    "partition_name": "My Salary or null",
    "destination_source_id": null,
    "destination_name": null,
    "amount": 45000,
    "description": "Dinner at Taj",
    "debt_id": null,
    "coupon_id": null,
    "is_sync": false,
    "created_at": "2026-01-15T20:30:00",
    "updated_at": "2026-01-15T20:30:00",
    "deleted_at": null
  }
]
```

> **Amount:** ₹450.00 = `45000` paise.
> 

---

### **`GET /api/transactions/tithes`**

Get all transactions with "Tithe" category.

**Response:** Same as transactions list, filtered to Tithe category only.

---

### **`GET /api/transactions/stats`**

Category-wise transaction count and total amount for a given month.

**Query Parameters:**

| **Param** | **Type** | **Default** |
| --- | --- | --- |
| `month` | int | Current month |
| `year` | int | Current year |

**Response (200):**

json

```
[
  {
    "category_id": "uuid",
    "category_name": "Food & Dining",
    "emoji": "🍕",
    "color": "#EF4444",
    "count": 8,
    "total_amount": 245000
  }
]
```

---

### **`GET /api/transactions/<id>`**

Get a single transaction.

---

### **`POST /api/transactions`**

**Regular Transaction:**

json

```
{
  "txn_type": "expense",
  "amount": 45000,
  "source_id": "source-uuid",
  "category_id": "category-uuid",
  "partition_id": "partition-uuid (optional)",
  "description": "Dinner at Taj",
  "debt_id": "debt-uuid (optional, for debt_in/debt_out)",
  "coupon_id": "coupon-uuid (optional)"
}
```

**Transfer (between sources):**

json

```
{
  "txn_type": "transfer",
  "amount": 1000000,
  "source_id": "hdfc-uuid",
  "destination_source_id": "sbi-uuid",
  "description": "Moving funds"
}
```

Creates **two paired transactions** with the same `txn_id`.

**Automatic side effects:**

- `debt_in`/`debt_out` with `debt_id`: Automatically updates `debt.paid_amount` and `debt.emis_paid`
- `coupon_id` provided: Automatically reduces `coupon.remaining_amount`
- Category count incremented
- Source count incremented
- Partition count incremented

**Response (201):**

json

```
{
  "message": "Transaction created",
  "id": "uuid",
  "txn_id": "shared-uuid"
}
```

---

### **`PUT /api/transactions/<id>`**

Update a transaction. **Automatically reverses and re-applies**:

- Debt reconciliation
- Coupon usage
- Category/Source/Partition counts

**Body (partial):**

json

```
{
  "amount": 50000,
  "description": "Updated description"
}
```

---

### **`DELETE /api/transactions/<id>` (Soft Delete)**

Soft delete. **Automatically reverses**:

- Debt reconciliation (adds amount back to debt)
- Coupon usage (restores remaining amount)
- Decrements all counts

---

### **`DELETE /api/transactions/<id>/hard` (Admin Hard Delete)**

Permanently deletes the transaction. Same reversals as soft delete, then row is removed.

---

## **5. DEBTS**

### **`GET /api/debts`**

List debts with optional filters.

**Query Parameters:**

| **Param** | **Type** | **Description** |
| --- | --- | --- |
| `type` | string | `i_owe` or `lent_to` |
| `is_active` | string | `true` or `false` |

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "debt_type": "i_owe",
    "person_name": "Rahul",
    "description": "Personal loan",
    "amount": 5000000,
    "paid_amount": 1500000,
    "remaining_amount": 3500000,
    "emoji": "👤",
    "due_date": "2026-06-15T00:00:00",
    "emi_amount": 500000,
    "emi_frequency": "monthly",
    "emi_day": 5,
    "total_emis": 10,
    "emis_paid": 3,
    "is_active": true,
    "created_at": "2026-01-01T12:00:00"
  }
]
```

> `remaining_amount` is a **computed property** = `amount - paid_amount`.
> 

---

### **`POST /api/debts`**

**Regular Debt:**

json

```
{
  "debt_type": "i_owe",
  "person_name": "Rahul",
  "description": "Personal loan",
  "amount": 5000000,
  "emoji": "👤",
  "due_date": "2026-06-15T00:00:00"
}
```

**EMI Debt:**

json

```
{
  "debt_type": "i_owe",
  "person_name": "HDFC Bank",
  "description": "Home loan",
  "amount": 500000000,
  "emoji": "🏠",
  "emi_amount": 2500000,
  "emi_frequency": "monthly",
  "emi_day": 5,
  "total_emis": 240,
  "emis_paid": 0
}
```

> EMI fields are optional. When `emi_amount` is set, the system tracks EMI progress automatically when `debt_out` transactions are created with this `debt_id`.
> 

---

### **`PUT /api/debts/<id>`**

Update any field. All fields optional.

---

### **`DELETE /api/debts/<id>`**

| **Condition** | **Behavior** |
| --- | --- |
| No linked transactions | Hard delete |
| Has linked transactions | Soft delete + `is_active = false` |

---

## **6. COUPONS**

### **`GET /api/coupons`**

List coupons.

**Query Parameters:**

| **Param** | **Type** |
| --- | --- |
| `is_active` | `true` or `false` |

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "name": "Amazon Gift Card",
    "description": "Birthday gift",
    "amount": 200000,
    "remaining_amount": 50000,
    "card_number": "AMZN-1234",
    "expiry_date": "2026-12-31T00:00:00",
    "is_used": false,
    "is_active": true,
    "created_at": "2026-01-01T12:00:00"
  }
]
```

---

### **`POST /api/coupons`**

json

```
{
  "name": "Amazon Gift Card",
  "description": "Birthday gift",
  "amount": 200000,
  "card_number": "AMZN-1234",
  "expiry_date": "2026-12-31T00:00:00"
}
```

> `remaining_amount` defaults to `amount` if not provided.
> 

---

### **`PUT /api/coupons/<id>`**

Update any field.

---

### **`DELETE /api/coupons/<id>` (Soft Delete)**

Sets `deleted_at` and `is_active = false`.

---

### **`DELETE /api/coupons/<id>/hard` (Admin)**

Permanently deletes the coupon.

---

## **7. BUDGETS**

### **`GET /api/budgets`**

**Query Parameters:**

| **Param** | **Type** |
| --- | --- |
| `is_settled` | `true` or `false` |

**Response (200):**

json

```
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "source_id": "uuid",
    "category_id": "uuid or null",
    "amount": 300000,
    "description": "Dinner date at Taj",
    "budget_date": "2026-01-20T19:00:00",
    "is_settled": false,
    "settled_at": null,
    "created_at": "2026-01-15T12:00:00"
  }
]
```

---

### **`POST /api/budgets`**

Block an amount from a source for a planned expense.

json

```
{
  "source_id": "hdfc-uuid",
  "category_id": "food-uuid",
  "amount": 300000,
  "description": "Dinner date at Taj",
  "budget_date": "2026-01-20T19:00:00"
}
```

---

### **`PUT /api/budgets/<id>`**

Update budget. Set `"is_settled": true` to mark as settled (auto-sets `settled_at`).

---

### **`DELETE /api/budgets/<id>` (Hard Delete)**

Permanently deletes the budget. **The blocked amount is automatically released** back to the source (simply by removing the budget — no transaction is created).

---

## **8. NOTIFICATIONS**

Temporary cache for SMS notifications. Keeps history via `is_accepted`/`is_ignored` flags.

### **`GET /api/notifications`**

Get unhandled notifications (not accepted, not ignored).

**Response (200):**

json

```
[
  {
    "id": 1,
    "bank_name": "HDFC Bank",
    "amount": 250000,
    "type": "credit",
    "raw_message": "Your a/c XX1234 credited with ₹2,500",
    "is_accepted": false,
    "is_ignored": false,
    "created_at": "2026-01-15T10:30:00"
  }
]
```

---

### **`POST /api/notifications`**

Cache a new notification (typically from SMS parser).

json

```
{
  "bank_name": "HDFC Bank",
  "amount": 250000,
  "type": "credit",
  "raw_message": "Your a/c XX1234 credited with ₹2,500"
}
```

---

### **`DELETE /api/notifications/<id>`**

Dismiss a notification (sets `is_ignored = true`).

---

## **9. AMOUNT CONVENTION**

**All amounts are in PAISE (integer).**

| **Rupees** | **Paise** |
| --- | --- |
| ₹100 | 10000 |
| ₹1,000 | 100000 |
| ₹10,000 | 1000000 |
| ₹1,00,000 | 10000000 |

> Divide by 100 for display. Multiply by 100 for storage.
> 

---

## **10. ERROR RESPONSE FORMAT**

All errors follow this format:

json

```
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**

| **Code** | **Meaning** |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (e.g., modifying system category) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |

---

## **11. AUTO-RECONCILIATION**

These actions happen automatically:

| **Trigger** | **Effect** |
| --- | --- |
| Create `debt_in`/`debt_out` with `debt_id` | `debt.paid_amount` increases, `emis_paid` increases if EMI |
| Delete transaction linked to debt | `debt.paid_amount` decreases, debt restored |
| Create transaction with `coupon_id` | `coupon.remaining_amount` decreases |
| Delete transaction with coupon | `coupon.remaining_amount` restored |
| Delete budget | Blocked amount released to source |
| Delete category/source (count > 0) | Soft delete only |
| Delete category/source (count == 0) | Hard delete |

---

## **12. SYSTEM CATEGORIES**

Created automatically on registration:

| **Name** | **`is_system`** | **`is_default`** | **Deletable** |
| --- | --- | --- | --- |
| Food & Dining | `false` | `false` | Yes |
| Transport | `false` | `false` | Yes |
| Shopping | `false` | `false` | Yes |
| Bills & Utilities | `false` | `false` | Yes |
| Entertainment | `false` | `false` | Yes |
| Healthcare | `false` | `false` | Yes |
| Salary | `false` | `false` | Yes |
| Side Gig | `false` | `false` | Yes |
| **Tithe** | `true` | `false` | **No** |
| **Others** | `true` | `true` | **No** |