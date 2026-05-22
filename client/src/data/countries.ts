/**
 * data/countries.ts
 * Remittance corridors with exchange rates, delivery methods,
 * and supported banks/mobile money providers.
 */

export interface Country {
  code:       string;       // ISO 3166-1 alpha-2
  name:       string;
  flag:       string;       // emoji flag
  currency:   string;       // ISO 4217
  symbol:     string;       // currency symbol
  rateUSDC:   number;       // 1 USDC → local currency (mock; replace with live API)
  rateEURC?:  number;       // 1 EURC → local currency
  methods:    DeliveryMethod[];
  banks?:     string[];
  mobileMoney?: string[];
  feePercent: number;       // transfer fee %
  minUSDC:    number;       // minimum transfer in USDC
}

export interface DeliveryMethod {
  id:    "bank" | "mobile";
  label: string;
  icon:  string;
}

export const COUNTRIES: Country[] = [
  {
    code: "NG", name: "Nigeria",       flag: "🇳🇬", currency: "NGN", symbol: "₦",
    rateUSDC: 1590, rateEURC: 1728,
    feePercent: 0.8, minUSDC: 1,
    methods: [
      { id: "bank",   label: "Bank Account",  icon: "🏦" },
      { id: "mobile", label: "Mobile Money",  icon: "📱" },
    ],
    banks:       ["GTBank", "Access Bank", "First Bank", "Zenith Bank", "OPay", "Kuda"],
    mobileMoney: ["OPay", "PalmPay", "Kuda"],
  },
  {
    code: "KE", name: "Kenya",         flag: "🇰🇪", currency: "KES", symbol: "KSh",
    rateUSDC: 128, rateEURC: 139,
    feePercent: 0.8, minUSDC: 1,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "M-Pesa",       icon: "📱" },
    ],
    banks:       ["Equity Bank", "KCB", "Cooperative Bank", "Standard Chartered"],
    mobileMoney: ["M-Pesa", "Airtel Money"],
  },
  {
    code: "GH", name: "Ghana",         flag: "🇬🇭", currency: "GHS", symbol: "GH₵",
    rateUSDC: 12.5, rateEURC: 13.6,
    feePercent: 0.8, minUSDC: 1,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "Mobile Money", icon: "📱" },
    ],
    banks:       ["GCB Bank", "Ecobank", "Fidelity Bank"],
    mobileMoney: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"],
  },
  {
    code: "SN", name: "Senegal",       flag: "🇸🇳", currency: "XOF", symbol: "CFA",
    rateUSDC: 610, feePercent: 1.0, minUSDC: 5,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "Wave / Orange", icon: "📱" },
    ],
    mobileMoney: ["Wave", "Orange Money"],
  },
  {
    code: "CM", name: "Cameroon",      flag: "🇨🇲", currency: "XAF", symbol: "FCFA",
    rateUSDC: 618, feePercent: 1.0, minUSDC: 5,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "Mobile Money", icon: "📱" },
    ],
    mobileMoney: ["MTN MoMo", "Orange Money"],
  },
  {
    code: "TZ", name: "Tanzania",      flag: "🇹🇿", currency: "TZS", symbol: "TSh",
    rateUSDC: 2540, feePercent: 0.9, minUSDC: 2,
    methods: [
      { id: "mobile", label: "M-Pesa / Tigo", icon: "📱" },
    ],
    mobileMoney: ["M-Pesa", "Tigo Pesa", "Airtel Money"],
  },
  {
    code: "UG", name: "Uganda",        flag: "🇺🇬", currency: "UGX", symbol: "USh",
    rateUSDC: 3720, feePercent: 0.9, minUSDC: 2,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "Mobile Money", icon: "📱" },
    ],
    mobileMoney: ["MTN MoMo", "Airtel Money"],
  },
  {
    code: "ZA", name: "South Africa",  flag: "🇿🇦", currency: "ZAR", symbol: "R",
    rateUSDC: 18.4, feePercent: 0.8, minUSDC: 5,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
    ],
    banks: ["FNB", "Standard Bank", "Absa", "Nedbank", "Capitec"],
  },
  {
    code: "GB", name: "United Kingdom",flag: "🇬🇧", currency: "GBP", symbol: "£",
    rateUSDC: 0.79, feePercent: 0.5, minUSDC: 10,
    methods: [{ id: "bank", label: "Bank Transfer (Faster Payments)", icon: "🏦" }],
    banks: ["Barclays", "HSBC", "Lloyds", "Monzo", "Revolut"],
  },
  {
    code: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$",
    rateUSDC: 1.0, feePercent: 0.3, minUSDC: 1,
    methods: [{ id: "bank", label: "ACH / Wire Transfer", icon: "🏦" }],
    banks: ["Chase", "Bank of America", "Wells Fargo", "Chime", "Cash App"],
  },
  {
    code: "EU", name: "Europe (SEPA)", flag: "🇪🇺", currency: "EUR", symbol: "€",
    rateUSDC: 0.92, feePercent: 0.4, minUSDC: 5,
    methods: [{ id: "bank", label: "SEPA Transfer", icon: "🏦" }],
  },
  {
    code: "IN", name: "India",         flag: "🇮🇳", currency: "INR", symbol: "₹",
    rateUSDC: 83.4, feePercent: 0.8, minUSDC: 2,
    methods: [
      { id: "bank",   label: "Bank / UPI", icon: "🏦" },
      { id: "mobile", label: "UPI / Paytm", icon: "📱" },
    ],
    mobileMoney: ["Paytm", "PhonePe", "Google Pay"],
  },
  {
    code: "CA", name: "Canada",        flag: "🇨🇦", currency: "CAD", symbol: "CA$",
    rateUSDC: 1.37, feePercent: 0.5, minUSDC: 10,
    methods: [{ id: "bank", label: "Interac / Wire", icon: "🏦" }],
  },
  {
    code: "AU", name: "Australia",     flag: "🇦🇺", currency: "AUD", symbol: "A$",
    rateUSDC: 1.55, feePercent: 0.5, minUSDC: 10,
    methods: [{ id: "bank", label: "PayID / BSB", icon: "🏦" }],
  },
  {
    code: "PH", name: "Philippines",   flag: "🇵🇭", currency: "PHP", symbol: "₱",
    rateUSDC: 57.2, feePercent: 0.8, minUSDC: 2,
    methods: [
      { id: "bank",   label: "Bank Account", icon: "🏦" },
      { id: "mobile", label: "GCash / Maya", icon: "📱" },
    ],
    mobileMoney: ["GCash", "Maya"],
  },
  {
    code: "MX", name: "Mexico",        flag: "🇲🇽", currency: "MXN", symbol: "MX$",
    rateUSDC: 17.1, feePercent: 0.7, minUSDC: 5,
    methods: [
      { id: "bank",   label: "CLABE / SPEI", icon: "🏦" },
    ],
  },
  {
    code: "BR", name: "Brazil",        flag: "🇧🇷", currency: "BRL", symbol: "R$",
    rateUSDC: 5.1, feePercent: 0.7, minUSDC: 5,
    methods: [
      { id: "bank",   label: "PIX / TED", icon: "🏦" },
      { id: "mobile", label: "PIX",       icon: "📱" },
    ],
  },
  {
    code: "PK", name: "Pakistan",      flag: "🇵🇰", currency: "PKR", symbol: "₨",
    rateUSDC: 278, feePercent: 0.9, minUSDC: 2,
    methods: [
      { id: "bank",   label: "Bank Transfer", icon: "🏦" },
      { id: "mobile", label: "JazzCash / Easypaisa", icon: "📱" },
    ],
    mobileMoney: ["JazzCash", "Easypaisa"],
  },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
