-- Atomic payment update/delete RPCs.
-- Keeps payment mutation + dependent loan/installment recalculations consistent.

create or replace function public.update_payment_atomic(
  p_payment_id uuid,
  p_payment_amount numeric,
  p_payment_date date,
  p_payee_id uuid default null,
  p_installment_id uuid default null,
  p_proof_url text default null,
  p_notes text default null
)
returns public.payments
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_old_payment public.payments%rowtype;
  v_updated_payment public.payments%rowtype;
  v_loan public.loan_entries%rowtype;
  v_new_amount_remaining numeric(12,2);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_payment_amount is null or p_payment_amount <= 0 then
    raise exception 'Payment amount must be greater than 0';
  end if;

  select * into v_old_payment
  from public.payments
  where id = p_payment_id
    and owner_user_id = v_user_id
  for update;

  if not found then
    raise exception 'Payment not found or not owned by user';
  end if;

  select * into v_loan
  from public.loan_entries
  where id = v_old_payment.transaction_id
    and owner_user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transaction not found or not owned by user';
  end if;

  update public.payments
  set
    payment_amount = p_payment_amount,
    payment_date = p_payment_date,
    payee_id = p_payee_id,
    installment_id = p_installment_id,
    proof_url = p_proof_url,
    notes = p_notes
  where id = p_payment_id
    and owner_user_id = v_user_id
  returning * into v_updated_payment;

  v_new_amount_remaining := greatest(
    0,
    coalesce(v_loan.amount_remaining, 0) + coalesce(v_old_payment.payment_amount, 0) - p_payment_amount
  );

  update public.loan_entries
  set amount_remaining = v_new_amount_remaining
  where id = v_loan.id
    and owner_user_id = v_user_id;

  -- Recompute old installment (if changed away from it)
  if v_old_payment.installment_id is not null
     and (p_installment_id is distinct from v_old_payment.installment_id) then
    update public.installments i
    set
      amount_paid = coalesce(s.total_paid, 0),
      status = case
        when coalesce(s.total_paid, 0) >= i.amount_due then 'PAID'::public.installment_status
        when i.due_date < current_date then 'OVERDUE'::public.installment_status
        when i.status = 'SKIPPED' then 'SKIPPED'::public.installment_status
        else 'UNPAID'::public.installment_status
      end,
      paid_date = case when coalesce(s.total_paid, 0) >= i.amount_due then current_date else null end
    from (
      select installment_id, sum(payment_amount) as total_paid
      from public.payments
      where installment_id = v_old_payment.installment_id
        and owner_user_id = v_user_id
      group by installment_id
    ) s
    where i.id = v_old_payment.installment_id
      and i.owner_user_id = v_user_id;

    if not found then
      update public.installments
      set amount_paid = 0,
          status = case
            when due_date < current_date then 'OVERDUE'::public.installment_status
            when status = 'SKIPPED' then 'SKIPPED'::public.installment_status
            else 'UNPAID'::public.installment_status
          end,
          paid_date = null
      where id = v_old_payment.installment_id
        and owner_user_id = v_user_id;
    end if;
  end if;

  -- Recompute current installment (if any)
  if p_installment_id is not null then
    update public.installments i
    set
      amount_paid = coalesce(s.total_paid, 0),
      status = case
        when coalesce(s.total_paid, 0) >= i.amount_due then 'PAID'::public.installment_status
        when i.due_date < current_date then 'OVERDUE'::public.installment_status
        when i.status = 'SKIPPED' then 'SKIPPED'::public.installment_status
        else 'UNPAID'::public.installment_status
      end,
      paid_date = case when coalesce(s.total_paid, 0) >= i.amount_due then p_payment_date else null end
    from (
      select installment_id, sum(payment_amount) as total_paid
      from public.payments
      where installment_id = p_installment_id
        and owner_user_id = v_user_id
      group by installment_id
    ) s
    where i.id = p_installment_id
      and i.owner_user_id = v_user_id;
  end if;

  return v_updated_payment;
end;
$$;

create or replace function public.delete_payment_atomic(
  p_payment_id uuid
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_payment public.payments%rowtype;
  v_loan public.loan_entries%rowtype;
  v_new_amount_remaining numeric(12,2);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id
    and owner_user_id = v_user_id
  for update;

  if not found then
    raise exception 'Payment not found or not owned by user';
  end if;

  select * into v_loan
  from public.loan_entries
  where id = v_payment.transaction_id
    and owner_user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transaction not found or not owned by user';
  end if;

  delete from public.payments
  where id = p_payment_id
    and owner_user_id = v_user_id;

  v_new_amount_remaining := greatest(
    0,
    coalesce(v_loan.amount_remaining, 0) + coalesce(v_payment.payment_amount, 0)
  );

  update public.loan_entries
  set amount_remaining = v_new_amount_remaining
  where id = v_loan.id
    and owner_user_id = v_user_id;

  if v_payment.installment_id is not null then
    update public.installments i
    set
      amount_paid = coalesce(s.total_paid, 0),
      status = case
        when coalesce(s.total_paid, 0) >= i.amount_due then 'PAID'::public.installment_status
        when i.due_date < current_date then 'OVERDUE'::public.installment_status
        when i.status = 'SKIPPED' then 'SKIPPED'::public.installment_status
        else 'UNPAID'::public.installment_status
      end,
      paid_date = case when coalesce(s.total_paid, 0) >= i.amount_due then current_date else null end
    from (
      select installment_id, sum(payment_amount) as total_paid
      from public.payments
      where installment_id = v_payment.installment_id
        and owner_user_id = v_user_id
      group by installment_id
    ) s
    where i.id = v_payment.installment_id
      and i.owner_user_id = v_user_id;

    if not found then
      update public.installments
      set amount_paid = 0,
          status = case
            when due_date < current_date then 'OVERDUE'::public.installment_status
            when status = 'SKIPPED' then 'SKIPPED'::public.installment_status
            else 'UNPAID'::public.installment_status
          end,
          paid_date = null
      where id = v_payment.installment_id
        and owner_user_id = v_user_id;
    end if;
  end if;

  return p_payment_id;
end;
$$;
