# Story: Checkout
As a shopper I want to pay for my order so that it ships.

## Acceptance criteria
- AC1: A valid email and quantity 1 shows "Payment accepted: $20.00"
- AC2: An invalid email shows "Please enter a valid email"
- AC3: Quantity 0 shows "Quantity must be between 1 and 10"
- AC4: Quantity 11 shows "Quantity must be between 1 and 10"
- AC5: Coupon SAVE10 with quantity 2 makes the total 36.00
- AC6: Cancel shows "Order cancelled"
