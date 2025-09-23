/*
# [SECURITY] Enable RLS and Define Policies for Chat
This migration secures the chat functionality by enabling Row Level Security (RLS) on the `conversations` and `messages` tables. It adds policies to ensure that users can only access their own data, preventing unauthorized access to private conversations.

## Query Description:
This script performs the following actions:
1.  Enables Row Level Security on the `conversations` table.
2.  Creates policies for `SELECT`, `INSERT`, and `DELETE` on `conversations` so users can only manage their own conversations.
3.  Enables Row Level Security on the `messages` table.
4.  Creates policies for `SELECT`, `INSERT`, and `DELETE` on `messages` so users can only manage messages within their own conversations.

**This is a critical security update. Without these policies, any user could read, create, or delete any other user's chat history.** There is no risk to existing data as this only adds security rules.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true (by disabling RLS and dropping policies)

## Structure Details:
- Tables affected: `conversations`, `messages`
- Operations: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `CREATE POLICY`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies rely on `auth.uid()` to identify the current user.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS adds a small overhead to queries, but it is essential for security. The policies are optimized to use the user's ID.
*/

-- 1. Enable RLS for the conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for the conversations table
-- Users can view their own conversations
CREATE POLICY "Allow individual read access on conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create new conversations for themselves
CREATE POLICY "Allow individual insert access on conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Allow individual delete access on conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);


-- 3. Enable RLS for the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for the messages table
-- Users can view messages in conversations they own
CREATE POLICY "Allow individual read access on messages"
ON public.messages
FOR SELECT
USING ( (SELECT user_id FROM public.conversations WHERE id = messages.conversation_id) = auth.uid() );

-- Users can insert messages into conversations they own
CREATE POLICY "Allow individual insert access on messages"
ON public.messages
FOR INSERT
WITH CHECK ( (SELECT user_id FROM public.conversations WHERE id = messages.conversation_id) = auth.uid() );

-- Users can delete messages from conversations they own
CREATE POLICY "Allow individual delete access on messages"
ON public.messages
FOR DELETE
USING ( (SELECT user_id FROM public.conversations WHERE id = messages.conversation_id) = auth.uid() );
