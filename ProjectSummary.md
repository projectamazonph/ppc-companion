# ppc-companion Vercel Deployment Fix

## Summary of Issues Fixed

### 1. TypeScript Error in curriculum API (src/app/api/curriculum/route.ts)

**Problem:** The build was failing due to multiple TypeScript errors:
- Function signature expecting `NextRequest` but using `Request` (type mismatch)
- Calling `.catch()` on a value that could be `NextResponse` (which doesn't have `.catch()` method)
- Role comparison against string "blocked" doesn't match actual user role types

**Solution:** Rewrote the curriculum endpoint to:
- Use proper `NextRequest` import and typing
- Check auth user with `getAuthUser()` function instead of `requireAuth()`
- Use proper role comparison: `user.role !== "BLOCKED"` (uppercase to match auth-server.ts)
- Filter trial modules using `TRIAL_MODULE_IDS.includes(m.id)`

### 2. Missing Field in Module Type (src/lib/course-data.ts)

**Problem:** The `Module` type was missing the `objective` field that the frontend expects, causing the API response to fail type checking.

**Solution:** Added the missing `objective?: string` field to the Module type:
```ts
export type Module = {
  id: string;
  code: string;
  title: string;
  content: ModuleSection[];
  exercises?: Exercise[];
  objective?: string; // Added this missing field
};
```

### 3. AuthServer Role Mismatch (src/lib/auth-server.ts)

**Problem:** Inconsistent naming between auth-server.ts and frontend store.ts:
- auth-server.ts uses uppercase: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "BLOCKED"
- store.ts uses lowercase: "student" | "instructor" | "admin" | "guest"

**Solution:** Updated the curriculum endpoint to use the proper uppercase role constants that match the auth-server.ts interface.

## Root Cause Analysis
The ppc-companion app was failing to build on Vercel due to mismatched data shapes between backend API responses and frontend expectations. This included:
- Incorrect Next.js API types in the curriculum endpoint
- Missing fields in course data that the frontend required
- Inconsistent role naming conventions

## Files Modified

1. **`src/app/api/curriculum/route.ts`** - Fixed TypeScript errors and auth logic
2. **`src/lib/course-data.ts`** - Added missing `objective` field to Module type

## Fix Applied

The curriculum API now correctly:
- Returns full phases for authenticated users with non-blocked roles
- Provides only first 2 trial modules (m1-1, m1-2) for unauthenticated/blocked users
- Matches the expected data shape that frontend components require
- Uses consistent uppercase role naming matching the auth system

This resolves the TypeScript compilation errors and allows the build to complete successfully, enabling the Vercel deployment to proceed without type checking failures.