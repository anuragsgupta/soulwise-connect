# Community Edit/Delete Features - Testing Guide

## ✅ Features to Test

### 1. Institute Filtering
**Test**: Only see posts from your institute
- Log in as a student from Institute A
- Create a post
- Log in as a student from Institute B (different institute)
- Verify you DON'T see Institute A's post
- Create a post in Institute B
- Log back into Institute A account
- Verify you DON'T see Institute B's post

**Expected**: Each institute's community is completely isolated

---

### 2. Create Posts & Replies
**Test**: Basic creation with institute tagging
- Create a new post with title, content, and category
- Verify post appears in the list
- Add a reply to the post
- Verify reply appears under the post
- Check that all posts/replies include your `instituteId` in the database

**Expected**: All content is tagged with the user's institute

---

### 3. Edit Your Own Posts
**Test**: Edit post functionality
- Create a post
- Click the three-dot menu (⋮) on your post
- Select "Edit"
- Modify the title, content, or category
- Click "Save Changes"
- Verify the post updates immediately
- Refresh the page and verify changes persisted

**Expected**: Post content updates successfully, saved to database

---

### 4. Edit Your Own Replies
**Test**: Edit reply functionality
- Create a reply on any post
- Click the three-dot menu (⋮) on your reply
- Select "Edit"
- Modify the content
- Click "Save"
- Verify the reply updates immediately
- Refresh and verify persistence

**Expected**: Reply content updates successfully

---

### 5. Delete Your Own Posts
**Test**: Delete post with confirmation
- Create a post
- Click the three-dot menu (⋮)
- Select "Delete"
- Verify confirmation dialog appears
- Click "Delete" to confirm
- Verify post disappears from the list
- Verify all replies under that post also disappear
- Refresh and confirm deletion persisted

**Expected**: Post and all its replies are permanently removed

---

### 6. Delete Your Own Replies
**Test**: Delete reply with confirmation
- Create a reply
- Click the three-dot menu (⋮) on your reply
- Select "Delete"
- Verify confirmation dialog appears
- Click "Delete" to confirm
- Verify reply disappears
- Verify the post's reply count decrements by 1
- Refresh and confirm deletion persisted

**Expected**: Reply removed, reply count updated

---

### 7. Authorization: Cannot Edit Others' Posts
**Test**: Verify edit restrictions
- Log in as User A, create a post
- Log in as User B (same institute)
- Find User A's post
- Verify you DON'T see the three-dot menu (⋮)
- Try to manually call the API to edit (should fail with 404/401)

**Expected**: No edit/delete UI for posts you don't own, API rejects unauthorized edits

---

### 8. Authorization: Cannot Delete Others' Posts
**Test**: Verify delete restrictions
- Log in as User A, create a post
- Log in as User B (same institute)
- Find User A's post
- Verify you DON'T see delete option
- Try to manually call DELETE API (should fail)

**Expected**: No delete UI for others' content, API rejects unauthorized deletions

---

### 9. Cancel Edit Operations
**Test**: Edit cancellation
- Start editing a post
- Click "Cancel"
- Verify original content remains unchanged
- Start editing a reply
- Click "Cancel"
- Verify original content remains unchanged

**Expected**: Cancel button discards changes, original content intact

---

### 10. Cancel Delete Operations
**Test**: Delete cancellation
- Click delete on a post
- In the confirmation dialog, click "Cancel"
- Verify post remains in the list
- Repeat for replies

**Expected**: Cancel button prevents deletion

---

## API Endpoints to Verify

### GET `/api/community-memory?instituteId=INSTITUTE_123&limit=50`
- Returns only posts/replies from INSTITUTE_123
- Properly filters by instituteId

### PATCH `/api/community-memory`
```json
{
  "type": "post",
  "id": "post-123",
  "authorId": "user-abc",
  "title": "Updated Title",
  "content": "Updated content",
  "category": "Mental Health"
}
```
- Updates post if authorId matches
- Returns 404 if not the author

### DELETE `/api/community-memory?type=post&id=post-123&authorId=user-abc`
- Deletes post if authorId matches
- Returns 404 if not the author
- Cascades to delete all replies

---

## Database Verification

After testing, verify in DynamoDB:

1. **Posts have `instituteId`**:
   ```json
   {
     "id": "post-123",
     "title": "My Post",
     "instituteId": "INSTITUTE_123",
     "authorId": "user-abc"
   }
   ```

2. **Replies have `instituteId`**:
   ```json
   {
     "id": "reply-456",
     "postId": "post-123",
     "content": "My reply",
     "instituteId": "INSTITUTE_123",
     "authorId": "user-xyz"
   }
   ```

3. **Deleted items are gone**:
   - Check that deleted posts don't exist in the table
   - Check that replies cascade-deleted with their parent posts

---

## Expected Behaviors Summary

✅ **Institute Isolation**: Complete data separation by institute
✅ **Edit Functionality**: Inline editing for posts and replies
✅ **Delete Functionality**: Confirmation dialog, cascade delete for posts
✅ **Authorization**: Only authors can modify their content
✅ **UI/UX**: Clean dropdown menus, inline forms, professional dialogs
✅ **Persistence**: All changes save to DynamoDB correctly
✅ **Error Handling**: Graceful handling of unauthorized attempts

---

## Common Issues to Check

1. **Edit button not appearing**: Verify `user.userId` matches `post.authorId`
2. **Institute filter not working**: Check `user.instituteId` is being sent in API call
3. **Delete not working**: Verify authorId is correctly passed in DELETE request
4. **Changes not persisting**: Check DynamoDB permissions and API responses
5. **Reply count not updating**: Verify cascade logic in `deleteCommunityReply`

---

## Next Steps

After testing is complete:
1. ✅ Verify all features work as expected
2. ✅ Check error handling for edge cases
3. ✅ Monitor DynamoDB for correct data structure
4. ✅ Consider adding loading states during edit/delete operations
5. ✅ Add success/error toast notifications (already implemented)

Happy testing! 🎉
