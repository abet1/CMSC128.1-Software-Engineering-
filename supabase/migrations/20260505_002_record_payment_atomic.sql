-- Atomic payment recording RPC for loan tracker.
-- This keeps payment insert + loan balance + installment update in one transaction.

create or replace function public.record_payment_atomic(
  p_transaction_id uuid,
  p_payment_amount numeric,
  p_payment_date date default current_date,
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
  v_loan public.loan_entries%rowtype;
  v_payment public.payments%rowtype;
  v_installment public.installments%rowtype;
  v_new_amount_remaining numeric(12,2);
  v_new_installment_paid numeric(12,2);
  v_installment_status public.installment_status;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_payment_amount is null or p_payment_amount <= 0 then
    raise exception 'Payment amount must be greater than 0';
  end if;

  select *
  into v_loan
  from public.loan_entries
  where id = p_transaction_id
    and owner_user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transaction not found or not owned by user';
  end if;

  v_new_amount_remaining := greatest(0, coalesce(v_loan.amount_remaining, 0) - p_payment_amount);

  insert into public.payments (
    owner_user_id,
    transaction_id,
    payee_id,
    installment_id,
    payment_amount,
    payment_date,
    proof_url,
    notes
  ) values (
    v_user_id,
    p_transaction_id,
    p_payee_id,
    p_installment_id,
    p_payment_amount,
    coalesce(p_payment_date, current_date),
    p_proof_url,
    p_notes
  )
  returning * into v_payment;

  update public.loan_entries
  set amount_remaining = v_new_amount_remaining
  where id = p_transaction_id
    and owner_user_id = v_user_id;

  if p_installment_id is not null then
    select *
    into v_installment
    from public.installments
    where id = p_installment_id
      and owner_user_id = v_user_id
    for update;

    if not found then
      raise exception 'Installment not found or not owned by user';
    end if;

    v_new_installment_paid := coalesce(v_installment.amount_paid, 0) + p_payment_amount;
    if v_new_installment_paid >= coalesce(v_installment.amount_due, 0) then
      v_installment_status := 'PAID';
    elsif v_installment.due_date < current_date then
      v_installment_status := 'OVERDUE';
    else
      v_installment_status := 'UNPAID';
    end if;

    update public.installments
    set
      amount_paid = v_new_installment_paid,
      status = v_installment_status,
      paid_date = case when v_installment_status = 'PAID' then coalesce(p_payment_date, current_date) else null end
    where id = p_installment_id
      and owner_user_id = v_user_id;
  end if;

  return v_payment;
end;
$$;
