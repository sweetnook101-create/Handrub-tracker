# Security Specification - HygieneLog

## Data Invariants
1. A location must be created by an authenticated user.
2. A usage log must reference a valid location ID.
3. `volumeRemaining` must be between 0 and `bottleCapacity`.
4. `usageAmount` must be >= 0.
5. Users can only edit locations they created (or all staff can edit if we assume hospital staff are all in one team - for now I'll stick to "authenticated staff").
6. Timestamps must be server-validated.

## The "Dirty Dozen" Payloads (Deny cases)
1. Unauthenticated creation of a location.
2. Setting `volumeRemaining` > 500 (standard bottle max).
3. Negative `volumeRemaining`.
4. Updating `createdBy` field after creation.
5. Fake `timestamp` (client-drifted).
6. Admin-level field modifications (e.g. `isVerified` on a user object if it existed).
7. Usage log for a non-existent location (enforced by application logic and `exists` in rules).
8. Injecting 1MB junk string into `name`.
9. Changing `locationId` of a log after creation (immutable linkage).
10. Anonymous user access (all hospital staff must be signed in).
11. Reading PII of other staff (if we had staff profiles).
12. Deleting logs (logs should be permanent for audit).

## Test Runner Plan
I will use the `firestore.rules` file to enforce these.
