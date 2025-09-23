/*
# Create Chat History Tables
This migration sets up the necessary tables to store chat conversations and individual messages, enabling persistent chat history for users.

## Query Description:
This script creates two new tables: `conversations` and `messages`.
- `conversations`: Stores a record for each chat session, linked to a user.
- `messages`: Stores individual messages within each conversation, including text content and optional audio URLs.
It also enables Row Level Security (RLS) on these tables to ensure users can only access their own data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Can be reversed by dropping the tables)

## Structure Details:
- **New Table:** `public.conversations`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to `auth.users`)
  - `title` (text)
  - `created_at` (timestamptz)
- **New Table:** `public.messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to `conversations`)
  - `user_id` (uuid, foreign key to `auth.users`)
  - `content` (text)
  - `is_user` (boolean)
  - `type` (text, 'text' or 'audio')
  - `audio_url` (text, nullable)
  - `created_at` (timestamptz)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes, new policies are created to restrict access.
  - Users can only manage and view their own conversations.
  - Users can only manage and view messages within their own conversations.
- Auth Requirements: User must be authenticated.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed automatically.
- Triggers: None.
- Estimated Impact: Low. These queries are fast and only affect new tables.
*/

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text,
    is_user boolean NOT NULL DEFAULT false,
    type text NOT NULL DEFAULT 'text'::text,
    audio_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for conversations
CREATE POLICY "Allow select for owner" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for owner" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow delete for owner" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- 4. RLS Policies for messages
CREATE POLICY "Allow select for owner" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for owner" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
