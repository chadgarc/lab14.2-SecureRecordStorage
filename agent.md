# Secure Record Storage Lab - Agent Guide

## Lab Overview
Implement authorization logic in a Notes API to ensure users can only access and manage their own notes.

## Objectives

### Task 1: Associate Notes with Users
- [ ] **Update Note Model** (`models/Note.js`)
  - Add `user` field to Note schema
  - Type: `Schema.Types.ObjectId`
  - Ref: `'User'`
  - Required: `true`

- [ ] **Modify Create Note Route** (`routes/api/notes.js` - POST `/`)
  - Associate new note with currently logged-in user
  - Save `req.user._id` to note's `user` field

### Task 2: Implement Ownership-Based Authorization
- [ ] **Filter Get All Notes** (`routes/api/notes.js` - GET `/`)
  - Return only notes where `user` field matches `req.user._id`

- [ ] **Secure Update Note** (`routes/api/notes.js` - PUT `/:id`)
  - Find note by ID
  - Check if `note.user` matches `req.user._id`
  - If match: proceed with update
  - If no match: return 403 Forbidden with message "User is not authorized to update this note."

- [ ] **Secure Delete Note** (`routes/api/notes.js` - DELETE `/:id`)
  - Find note by ID
  - Check if `note.user` matches `req.user._id`
  - If match: delete note
  - If no match: return 403 Forbidden with appropriate error message

- [ ] **(Optional) Secure Get Single Note** (`routes/api/notes.js` - GET `/:id`)
  - Apply same ownership check as update/delete

## Acceptance Criteria Checklist

### Note Model Configuration (10 pts)
- [ ] Note schema includes `user` field
- [ ] Field type is `Schema.Types.ObjectId`
- [ ] Field has `ref: 'User'`
- [ ] Field has `required: true`

### Create Endpoint - POST /api/notes (10 pts)
- [ ] Endpoint creates new note
- [ ] Note's `user` field is assigned `req.user._id`
- [ ] Association is correct and persistent

### Read Endpoint - GET /api/notes (10 pts)
- [ ] Returns only notes owned by authenticated user
- [ ] Filtering is consistent and correct
- [ ] No notes from other users are returned

### Update/Delete Endpoints - PUT & DELETE /api/notes/:id (20 pts)
- [ ] PUT route checks ownership before update
- [ ] PUT returns 403 for non-owners
- [ ] DELETE route checks ownership before delete
- [ ] DELETE returns 403 for non-owners
- [ ] Both routes allow access for owners
- [ ] Error messages are appropriate

## Files to Modify
1. `models/Note.js` - Add user field to schema
2. `routes/api/notes.js` - Implement all authorization logic

## Testing Checklist
- [ ] Create notes as different users - verify ownership assignment
- [ ] Get all notes as User A - verify only User A's notes returned
- [ ] Get all notes as User B - verify only User B's notes returned
- [ ] Update own note - verify success
- [ ] Update another user's note - verify 403 Forbidden
- [ ] Delete own note - verify success
- [ ] Delete another user's note - verify 403 Forbidden
- [ ] (Optional) Get single note - verify ownership check

## Grading Breakdown
| Criteria | Points |
|----------|--------|
| Note Model Configuration | 10 |
| Create Endpoint (POST) | 10 |
| Read Endpoint (GET all) | 10 |
| Update/Delete Endpoints | 20 |
| **Total** | **50** |