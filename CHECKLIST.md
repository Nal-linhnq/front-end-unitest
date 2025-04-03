# Test Case Coverage for `src/counter.ts` function

- Test Case 1: Should initialize counter to 0

- Test Case 2: Should update counter on click

- Test Case 3: Should increase counter correctly on multiple clicks

# Test Case Coverage for `src/services/payment.service.ts` function

- Test Case 1: Should return all payment methods when totalPrice is 200,000

- Test Case 2: Should remove paypay and aupay method when totalPrice is 600,000

- Test Case 3: Should remove aupay method when totalPrice is 400,000

- Test Case 4: Should call window.open with correct URL in payViaLink

# Test Case Coverage for `src/services/payment.service.ts` function

- Test Case 1: Should throw an error if no items are provided in the order

- Test Case 2: Should throw an error if any item has an invalid price or quantity

- Test Case 3: Should apply coupon discount and update totalPrice

- Test Case 4: Should not apply coupon if there is an error fetching the coupon

- Test Case 5: Should return error if invalid coupon

- Test Case 6: Should return totalPrice = 0 if discount greater than totalPrice

- Test Case 7: Should create an order and call payViaLink

- Test Case 8: Should return error 'Error creating order' when creating the order
