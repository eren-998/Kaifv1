-- Create the conversations table
/*
# [Create Table: conversations]
This script creates the `conversations` table to store the metadata for each chat session, including the user it belongs to and its title.

## Query Description: [This operation creates a new table named `conversations` for storing chat history. It is a non-destructive, structural change and is safe to run on a new or existing database. It will not affect any existing data as the table is new.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Can be dropped)

## Structure Details:
- Table: `public.conversations`
- Columns: `id`, `user_id`, `title`, `created_at`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (New policies will be added)
- Auth Requirements: Policies will link to `auth.users`

## Performance Impact:
- Indexes: Primary key on `id`, Foreign key on `user_id`
- Triggers: None
- Estimated Impact: Low, as it's a new table.
*/
create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    created_at timestamptz not null default now()
);

-- Add comments to the conversations table
comment on table public.conversations is 'Stores the metadata for each chat conversation.';
comment on column public.conversations.user_id is 'The user who owns the conversation.';
comment on column public.conversations.title is 'A short title for the conversation, usually the first message.';

-- Enable Row Level Security for conversations
alter table public.conversations enable row level security;

-- Create RLS policies for conversations
/*
# [Create RLS Policy: conversations_select]
Allows users to select only their own conversations.

## Query Description: [This policy ensures that users can only read conversations that they have created. It is a critical security measure to enforce data privacy between users.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (Policy can be dropped)
*/
create policy "Allow select for own conversations"
on public.conversations for select
using (auth.uid() = user_id);

/*
# [Create RLS Policy: conversations_insert]
Allows users to insert new conversations for themselves.

## Query Description: [This policy allows authenticated users to create new conversations, automatically linking them to their own user ID. It is a standard and safe operation.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Policy can be dropped)
*/
create policy "Allow insert for own conversations"
on public.conversations for insert
with check (auth.uid() = user_id);

/*
# [Create RLS Policy: conversations_delete]
Allows users to delete their own conversations.

## Query Description: [This policy permits users to delete conversations they own. While this is a destructive action for the user's own data, it does not pose a risk to other users' data.]

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (Policy can be dropped)
*/
create policy "Allow delete for own conversations"
on public.conversations for delete
using (auth.uid() = user_id);


-- Create the messages table
/*
# [Create Table: messages]
This script creates the `messages` table to store individual chat messages, linking them to a conversation.

## Query Description: [This operation creates a new table named `messages`. It is a non-destructive, structural change. It includes a foreign key to the `conversations` table, so the `conversations` table must exist first.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Can be dropped)

## Structure Details:
- Table: `public.messages`
- Columns: `id`, `conversation_id`, `user_id`, `content`, `is_user`, `created_at`, `type`, `audio_url`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (New policies will be added)
- Auth Requirements: Policies will link to `auth.users`

## Performance Impact:
- Indexes: Primary key on `id`, Foreign key on `conversation_id`
- Triggers: None
- Estimated Impact: Low, as it's a new table.
*/
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    content text,
    is_user boolean not null,
    created_at timestamptz not null default now(),
    type text not null default 'text',
    audio_url text
);

-- Add comments to the messages table
comment on table public.messages is 'Stores individual messages within a conversation.';
comment on column public.messages.type is 'The type of message, e.g., ''text'' or ''audio''.';
comment on column public.messages.audio_url is 'URL to the stored audio file if the message type is audio.';

-- Enable Row Level Security for messages
alter table public.messages enable row level security;

-- Create RLS policies for messages
/*
# [Create RLS Policy: messages_select]
Allows users to select messages from conversations they own.

## Query Description: [This policy ensures that users can only read messages belonging to their own conversations, enforcing privacy.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (Policy can be dropped)
*/
create policy "Allow select for messages in own conversations"
on public.messages for select
using (exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
));

/*
# [Create RLS Policy: messages_insert]
Allows users to insert messages into their own conversations.

## Query Description: [This policy allows users to add new messages to conversations they own. It verifies ownership before allowing the insert.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Policy can be dropped)
*/
create policy "Allow insert for messages in own conversations"
on public.messages for insert
with check (
  auth.uid() = user_id and
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  )
);
