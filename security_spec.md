# Security Spec

## 1. Data Invariants
- An item in `/users/{userId}/learnedItems` must belong to the authenticated user `{userId}`.
- All documents in `/cachedExercises` must be writable only by admins (or server-side process, not users).
- `createdAt` and `updatedAt` timestamps must strictly rely on `request.time`.
- Document IDs for `/users/{userId}/learnedItems` must match the item structure.

## 2. Dirty Dozen Payloads
1. User A tries to read User B's learned items.
2. User A tries to write to User B's learned items.
3. Authenticated user tries to write to `/cachedExercises`.
4. User tries to create an entry in `/users/{userId}/learnedItems` without all required fields.
5. User tries to create an entry with a `learnedAt` in the future.
6. User tries to inject a massive string (1MB) into a field.
7. Authenticated user tries to delete an item in `/cachedExercises`.
8. Unauthenticated user tries to read from `/users/{userId}/learnedItems`.
9. User tries to set `ownerId` to someone else in `/users/{userId}/learnedItems`.
10. Anonymous user tries to read `/users/{userId}/learnedItems`.
11. Admin attempts to read/write all collections (Admin special case).
12. User tries to modify immutable field `learnedAt` after creation.

## 3. Test Runner (firestore.rules.test.ts)
(This would be a test script verifying the above 12 payloads fail as expected.)
