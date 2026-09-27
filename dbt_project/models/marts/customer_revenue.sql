with paid_orders as (
    select *
    from {{ ref('stg_orders') }}
    where status = 'paid'
),

aggregated as (
    select
        user_id,
        count(*) as order_count,
        sum(amount) as total_revenue,
        avg(amount) as avg_order_value,
        max(order_date) as last_order_date
    from paid_orders
    group by user_id
)

select
    u.user_id,
    u.full_name,
    u.country,
    coalesce(a.order_count, 0) as order_count,
    coalesce(a.total_revenue, 0) as total_revenue,
    coalesce(a.avg_order_value, 0) as avg_order_value,
    a.last_order_date
from {{ ref('stg_users') }} u
left join aggregated a using (user_id)
