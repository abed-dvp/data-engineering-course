select
    order_id,
    user_id,
    order_date,
    amount::numeric(10,2) as amount,
    lower(status) as status
from {{ source('raw', 'orders') }}
