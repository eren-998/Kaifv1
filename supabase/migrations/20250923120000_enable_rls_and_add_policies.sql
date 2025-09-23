/*
# [SECURITY] Enable RLS and Add Policies for Chat
This migration secures the chat functionality by enabling Row Level Security (RLS) on the `conversations` and `messages` tables. It adds policies to ensure that users can only access their own data, preventing unauthorized access to other users' private conversations.

## Query Description:
This is a critical security update. It restricts data access based on the currently authenticated user's ID. Without this, any user could potentially read, update, or delete any other user's chat history. No data will be lost, but access will be strictly enforced.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Affects tables: `public.conversations`, `public.messages`
- Enables Row Level Security on both tables.
- Adds policies for SELECT, INSERT, UPDATE, DELETE operations.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. New policies are created to enforce data isolation between users.
- Auth Requirements: Policies rely on `auth.uid()` to identify the current user.

## Performance Impact:
- Estimated Impact: Negligible. RLS checks are highly optimized.
*/

-- 1. Enable RLS on the conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for the conversations table
-- Users can view their own conversations
CREATE POLICY "Allow individual read access on conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Allow individual insert access on conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Allow individual update access on conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Allow individual delete access on conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);


-- 3. Enable RLS on the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for the messages table
-- Users can view messages in their conversations
CREATE POLICY "Allow individual read access on messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create messages in their own conversations
CREATE POLICY "Allow individual insert access on messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages
CREATE POLICY "Allow individual update access on messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Allow individual delete access on messages"
ON public.messages
FOR DELETE
USING (auth.uid() = user_id);
