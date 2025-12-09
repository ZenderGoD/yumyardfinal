type UpiPayload = {
  payeeVpa: string;
  payeeName?: string;
  amount: number;
  note?: string;
};

export const buildUpiDeepLink = ({ payeeVpa, payeeName, amount, note }: UpiPayload) => {
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName ?? "Cafe",
    am: amount.toFixed(2),
    cu: "INR",
  });
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
};

