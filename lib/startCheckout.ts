/**
 * Client-side: creează comanda Paynet pentru `productId` și trimite browserul
 * la portalul de plată. Returnează un mesaj de eroare dacă nu a reușit
 * (la succes pagina pleacă, deci nu se mai întoarce nimic util).
 */
export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const GENERIC_ERROR = 'Nu s-a putut genera link-ul de plată. Te rugăm să încerci din nou.';

export async function startCheckout(
  productId: string,
  customer: CheckoutCustomer,
): Promise<string | null> {
  try {
    const res = await fetch('/api/paynet/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, customer }),
    });
    const json = await res.json();
    console.log('PAYNET_CREATE_RESPONSE', json);

    if (!json.error && json.ok && json.paynet_redirect_action && json.paynet_redirect_params) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = json.paynet_redirect_action;
      Object.entries(json.paynet_redirect_params as Record<string, string>).forEach(
        ([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        },
      );
      document.body.appendChild(form);
      form.submit();
      return null;
    }
    return json.details || json.error || GENERIC_ERROR;
  } catch (e) {
    console.error('CHECKOUT_ERROR', e);
    return 'A apărut o eroare de rețea. Te rugăm să încerci din nou.';
  }
}
