export interface FedaPayParams {
  amount: number
  description: string
  customerName: string
  customerPhone: string
  callbackUrl: string
}

export async function createFedaPayTransaction({
  amount,
  description,
  customerName,
  customerPhone,
  callbackUrl,
}: FedaPayParams) {
  const response = await fetch('https://api.fedapay.com/v1/transactions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description,
      amount,
      currency: { iso: 'XOF' },
      callback_url: callbackUrl,
      customer: {
        firstname: customerName,
        phone_number: { number: customerPhone, country: 'CI' },
      },
    }),
  })
  return response.json()
}
