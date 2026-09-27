select
    user_id,
    trim(full_name) as full_name,
    lower(email) as email,
    country,
    created_at
from {{ source('raw', 'users') }}
