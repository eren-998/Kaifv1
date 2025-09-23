/*
# [Feature] Chat History
This migration introduces tables to store user conversations and messages, enabling persistent chat history.

## Query Description:
- **conversations Table**: Stores a record for each chat session, linked to a user.
- **messages Table**: Stores individual messages within each conversation.
- **RLS Policies**: Row-Level Security is enabled to ensure users can only access their own conversations and messages.
- **Foreign Keys**: Establishes relationships between users, conversations, and messages.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with data loss)

## Structure Details:
- **New Tables**: `public.conversations`, `public.messages`
- **New Columns**:
  - `conversations`: `id`, `user_id`, `title`, `created_at`
  - `messages`: `id`, `conversation_id`, `user_id`, `content`, `is_user`, `type`, `audio_url`, `created_at`

## Security Implications:
- RLS Status: Enabled on both new tables.
- Policy Changes: New policies are created to restrict access to data based on the authenticated user's ID.
- Auth Requirements: Users must be authenticated to create or read chat history.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default.
- Triggers: None.
- Estimated Impact: Low. Queries will be scoped to the authenticated user, which is efficient.
*/

-- 1. Create conversations table
CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Create messages table
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    is_user boolean NOT NULL,
    type text NOT NULL DEFAULT 'text'::text,
    audio_url text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for conversations
CREATE POLICY "Allow users to view their own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create their own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create RLS policies for messages
CREATE POLICY "Allow users to view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create their own messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);
