import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import useSWR from "swr";
import { Reveal } from "@/components/Reveal";
import { getCampaignOptions } from "@/config/api/campaign.api";
import { submitDonation } from "@/config/api/donation.api";
import { getPaymentReceivingAccount } from "@/config/api/paymentReceiving.api";
import { getAssetUrl } from "@/Utils/constant";
import type { AxiosError } from "axios";

type PaymentMethod = "" | "qr" | "upi" | "bank";

// Indian PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F) — mirrors the backend's validation.
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function FileUpload({ file, onChange, accept = "image/*" }: { file: File | null; onChange: (f: File | null) => void; accept?: string }) {
  const inputId = useState(() => `file-${Math.random().toString(36).slice(2)}`)[0];
  return (
    <div
      className={`file-upload border-2 border-dashed border-[#111111]/[0.1] rounded-xl p-6 text-center cursor-pointer ${file ? "has-file" : ""}`}
      onClick={() => document.getElementById(inputId)?.click()}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div>
          <Icon icon="lucide:check-circle-2" className="w-8 h-8 text-accent mx-auto block mb-2" />
          <p className="text-sm font-medium text-[#111111]">{file.name}</p>
          <p className="text-[10px] text-[#111111]/35 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="text-[10px] text-accent mt-2 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <Icon icon="lucide:upload-cloud" className="w-8 h-8 text-[#111111]/20 mx-auto block mb-2" />
          <p className="text-sm text-[#111111]/40">Click to upload screenshot</p>
          <p className="text-[10px] text-[#111111]/25 mt-1">JPG, PNG up to 5MB</p>
        </div>
      )}
    </div>
  );
}

export function DonatePage() {
  const [searchParams] = useSearchParams();
  const preselectedCampaignId = searchParams.get("campaignId") ?? "";

  const { data: campaignOptions } = useSWR("campaign-options", getCampaignOptions);
  const { data: paymentAccount } = useSWR("payment-account", getPaymentReceivingAccount);

  const [publicPermission, setPublicPermission] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [upiFile, setUpiFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ displayName: string; amount: string; campaign: string; method: string } | null>(null);

  const [fullName, setFullName] = useState("Anonymous");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [campaignId, setCampaignId] = useState(preselectedCampaignId);
  const [qrReference, setQrReference] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [is80GApplicable, setIs80GApplicable] = useState(false);
  const [panNumber, setPanNumber] = useState("");

  const copyText = (text: string | undefined, field: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500);
  };

  const upiPayLink = paymentAccount?.upiId
    ? `upi://pay?pa=${encodeURIComponent(paymentAccount.upiId)}&pn=${encodeURIComponent("Proyakh Social Foundation")}`
    : undefined;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const file = payment === "qr" ? qrFile : payment === "upi" ? upiFile : payment === "bank" ? bankFile : null;
    if (!payment) {
      setSubmitError("Please select a payment method.");
      return;
    }
    if (!file) {
      setSubmitError("Please upload your payment screenshot / proof.");
      return;
    }
    if (!campaignId) {
      setSubmitError("Please select a campaign to support.");
      return;
    }
    if (is80GApplicable && !PAN_REGEX.test(panNumber)) {
      setSubmitError("Please enter a valid PAN number (e.g. ABCDE1234F) to claim 80G tax exemption.");
      return;
    }

    const transactionId = payment === "qr" ? qrReference : payment === "upi" ? upiReference : bankReference;
    // None of the three methods collect a separate transfer date in this
    // form — the payment just happened, so today's date is what the
    // backend records.
    const paymentDate = new Date().toISOString().slice(0, 10);
    const displayName = publicPermission ? fullName : "Anonymous";

    setSubmitting(true);
    try {
      await submitDonation({
        campaignId,
        name: displayName,
        email,
        phone,
        amount: Number(amount),
        transactionId,
        paymentDate,
        paymentScreenshot: file,
        is80GApplicable,
        panNumber: is80GApplicable ? panNumber : undefined,
      });

      const selectedCampaign = campaignOptions?.find((c) => c._id === campaignId);
      setSummary({
        displayName,
        amount: `₹${Number(amount).toLocaleString("en-IN")}`,
        campaign: selectedCampaign?.title ?? "",
        method: payment === "qr" ? "QR Code" : payment === "upi" ? "UPI" : "Bank Transfer",
      });
      setSubmitted(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setSubmitError(axiosErr.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmitError(null);
    setPayment("");
    setQrFile(null);
    setUpiFile(null);
    setBankFile(null);
    setPublicPermission(false);
    setFullName("Anonymous");
    setPhone("");
    setEmail("");
    setAmount("");
    setCampaignId("");
    setQrReference("");
    setUpiReference("");
    setBankReference("");
    setIs80GApplicable(false);
    setPanNumber("");
  };

  return (
    <>
      <section className="bg-warm pt-36 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; DONATE NOW
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Make Your
            <br />
            <span className="text-accent">Contribution.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Complete your payment using the details below, then submit the form to help us verify and record your
            donation.
          </Reveal>
        </div>
      </section>

      {/* ===== PAYMENT DETAILS ===== */}
      <section className="bg-warm-alt py-20 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <Reveal as="p" className="label-text text-accent mb-6">
                ●&nbsp; STEP 1 — MAKE YOUR PAYMENT
              </Reveal>
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[32px] md:text-[44px] text-[#111111] leading-[1.1] tracking-tight mb-4">
                Payment Methods
              </Reveal>
              <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
                Choose any of the methods below to make your contribution.
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Reveal className="bg-warm border border-[#111111]/[0.07] rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="lucide:smartphone" className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-[#111111] mb-2">UPI Payment</h3>
                <p className="text-xs text-[#111111]/35 mb-6 leading-relaxed">Pay instantly using any UPI app</p>

                <div className="bg-warm-alt rounded-lg p-5">
                  <p className="text-xs text-[#111111]/30 mb-2">UPI ID</p>
                  <div className="flex items-center gap-2 mb-5">
                    <p className="flex-1 text-left text-sm sm:text-base font-mono font-medium text-[#111111] break-all">
                      {paymentAccount?.upiId ?? "—"}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(paymentAccount?.upiId, "upi")}
                      disabled={!paymentAccount?.upiId}
                      title="Copy UPI ID"
                      className={`copy-btn w-9 h-9 shrink-0 rounded-sm border border-[#111111]/[0.08] flex items-center justify-center text-[#111111]/50 disabled:opacity-50 ${copiedField === "upi" ? "copied" : ""}`}
                    >
                      <Icon icon={copiedField === "upi" ? "lucide:check" : "lucide:copy"} className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-[#111111]/[0.08]" />
                    <span className="text-[10px] tracking-widest text-[#111111]/30">OR SCAN QR</span>
                    <div className="flex-1 h-px bg-[#111111]/[0.08]" />
                  </div>

                  {paymentAccount?.qrCode ? (
                    <img
                      src={getAssetUrl(paymentAccount.qrCode)}
                      alt="Donation QR code"
                      className="w-44 h-44 mx-auto rounded-xl object-contain border border-[#111111]/[0.08] bg-white"
                    />
                  ) : (
                    <div className="qr-placeholder w-44 h-44 mx-auto rounded-xl flex items-center justify-center border-2 border-dashed border-[#111111]/[0.1]">
                      <div className="text-center">
                        <Icon icon="lucide:qr-code" className="w-10 h-10 text-[#111111]/12 mx-auto block mb-2" />
                        <p className="text-[10px] text-[#111111]/20">QR code not available yet</p>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-[#111111]/30 mt-4">Scan with any UPI app to donate instantly</p>
                </div>

                <a
                  href={upiPayLink}
                  aria-disabled={!paymentAccount?.upiId}
                  className={`md:hidden mt-5 btn-press bg-accent text-white text-sm font-medium px-6 py-3 rounded-sm inline-flex items-center justify-center gap-2 w-full transition-all duration-400 ${paymentAccount?.upiId ? "hover:bg-[#d93a56]" : "opacity-50 pointer-events-none"}`}
                >
                  <Icon icon="lucide:smartphone" className="w-4 h-4" />
                  <span>Pay via UPI App</span>
                  <span>→</span>
                </a>
              </Reveal>

              <Reveal className="reveal-delay-1 bg-warm border border-[#111111]/[0.07] rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="lucide:landmark" className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-[#111111] mb-2">Bank Transfer</h3>
                <p className="text-xs text-[#111111]/35 mb-6 leading-relaxed">Transfer directly to our bank account</p>
                <div className="bg-warm-alt rounded-lg p-5 text-left">
                  {(
                    [
                      ["ACCOUNT NAME", paymentAccount?.accountName],
                      ["BANK NAME", paymentAccount?.bankName],
                      ["ACCOUNT NO.", paymentAccount?.accountNumber],
                      ["IFSC CODE", paymentAccount?.ifscCode],
                      ["BRANCH", paymentAccount?.branch],
                    ] as const
                  ).map(([label, value], i, arr) => (
                    <div
                      key={label}
                      className={`bank-detail-row rounded px-3 py-2.5 flex items-center justify-between gap-3 ${i < arr.length - 1 ? "mb-1" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#111111]/30">{label}</p>
                        <p className="text-xs font-medium text-[#111111] break-all">{value ?? "—"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(value, label)}
                        disabled={!value}
                        title={`Copy ${label.toLowerCase()}`}
                        className={`copy-btn w-7 h-7 shrink-0 rounded-sm border border-[#111111]/[0.08] flex items-center justify-center text-[#111111]/40 disabled:opacity-30 ${copiedField === label ? "copied" : ""}`}
                      >
                        <Icon icon={copiedField === label ? "lucide:check" : "lucide:copy"} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal className="reveal-delay-3 mt-6 text-center">
              <div className="inline-flex items-start gap-3 bg-warm border border-[#111111]/[0.06] rounded-lg px-5 py-4 max-w-xl">
                <Icon icon="lucide:info" className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-[#111111]/35 leading-relaxed text-left">
                  For UPI, you can use any app like Google Pay, PhonePe, or Paytm.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== DONATION FORM ===== */}
      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <Reveal as="p" className="label-text text-accent mb-6">
                ●&nbsp; STEP 2 — SUBMIT YOUR DETAILS
              </Reveal>
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[32px] md:text-[44px] text-[#111111] leading-[1.1] tracking-tight mb-4">
                Already Made Your Payment?
              </Reveal>
              <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
                Fill out the form below so our team can verify and record your contribution.
              </Reveal>
            </div>

            <Reveal className="bg-warm-alt border border-[#111111]/[0.07] rounded-2xl p-8 md:p-12">
              {submitted && summary ? (
                <div className="form-success text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <Icon icon="lucide:check-circle-2" className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#111111] mb-3">Donation Details Submitted!</h3>
                  <p className="text-sm text-[#111111]/40 leading-relaxed mb-4 max-w-sm mx-auto">
                    Thank you for your contribution. Our team will verify your payment and update the campaign progress.
                  </p>
                  <div className="bg-warm border border-[#111111]/[0.06] rounded-lg p-5 max-w-sm mx-auto mb-6 text-left">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#111111]/35">Display Name</span>
                        <span className="text-xs font-medium text-[#111111]">{summary.displayName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#111111]/35">Amount</span>
                        <span className="text-xs font-medium text-[#111111]">{summary.amount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#111111]/35">Campaign</span>
                        <span className="text-xs font-medium text-[#111111]">{summary.campaign}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#111111]/35">Payment Method</span>
                        <span className="text-xs font-medium text-[#111111]">{summary.method}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#111111]/35">Status</span>
                        <span className="text-xs font-medium text-accent">Pending Verification</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-6 py-3 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400"
                  >
                    Submit Another Donation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block label-text text-[#111111]/40 mb-2">
                      FULL NAME <span className="text-accent">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="form-input flex-1 px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                        placeholder="Enter your full name"
                      />
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div
                          onClick={() =>
                            setPublicPermission((v) => {
                              const next = !v;
                              setFullName(next ? "" : "Anonymous");
                              return next;
                            })
                          }
                          className={`toggle-switch ${publicPermission ? "active" : ""}`}
                          title="Permission to display your name publicly"
                        ></div>
                        <div className="text-right">
                          <p className="text-[10px] text-[#111111]/30 leading-tight">
                            Display name
                            <br />
                            publicly?
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#111111]/25 mt-2 ml-0.5">
                      If enabled, your name will appear on our supporters page. If disabled, you'll be listed as
                      "Anonymous".
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">
                        PHONE NUMBER <span className="text-accent">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">
                        EMAIL ADDRESS <span className="text-accent">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block label-text text-[#111111]/40 mb-2">
                      DONATION AMOUNT (₹) <span className="text-accent">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                      placeholder="Enter amount (e.g., 500)"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block label-text text-[#111111]/40 mb-2">
                      CAMPAIGN SUPPORTED <span className="text-accent">*</span>
                    </label>
                    <select
                      required
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none appearance-none"
                    >
                      <option value="" disabled>
                        {campaignOptions ? "Select a campaign" : "Loading campaigns..."}
                      </option>
                      {campaignOptions?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={() =>
                          setIs80GApplicable((v) => {
                            const next = !v;
                            if (!next) setPanNumber("");
                            return next;
                          })
                        }
                        className={`toggle-switch ${is80GApplicable ? "active" : ""}`}
                        title="Claim 80G tax exemption"
                      ></div>
                      <p className="text-sm text-[#111111]/60">Claim 80G tax exemption</p>
                    </div>
                    <p className="text-[10px] text-[#111111]/25 mt-2 ml-0.5">
                      Donations to Proyakh Social Foundation are eligible for tax exemption under Section 80G. Enable
                      this and provide your PAN to receive an 80G receipt.
                    </p>
                    {is80GApplicable && (
                      <div className="mt-4">
                        <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                          PAN NUMBER <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          maxLength={10}
                          className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none uppercase"
                          placeholder="ABCDE1234F"
                        />
                        {panNumber && !PAN_REGEX.test(panNumber) && (
                          <p className="text-[10px] text-red-500 mt-1.5">Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <label className="block label-text text-[#111111]/40 mb-3">
                      PAYMENT METHOD <span className="text-accent">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        ["qr", "lucide:qr-code", "QR Code"],
                        ["upi", "lucide:smartphone", "UPI"],
                        ["bank", "lucide:landmark", "Bank Transfer"],
                      ] as const).map(([value, icon, label]) => (
                        <div
                          key={value}
                          onClick={() => setPayment(value)}
                          className={`payment-option border border-[#111111]/[0.08] rounded-xl p-4 text-center ${payment === value ? "selected" : ""}`}
                        >
                          <div className="payment-radio w-5 h-5 rounded-full border-2 border-[#111111]/[0.15] relative mx-auto mb-2 transition-all duration-300"></div>
                          <Icon icon={icon} className="w-5 h-5 text-[#111111]/40 mx-auto block mb-1.5" />
                          <p className="text-sm font-medium text-[#111111]/60">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`dynamic-fields ${payment ? "open" : ""}`}>
                    {payment === "qr" && (
                      <div className="border-t border-[#111111]/[0.05] pt-5">
                        <p className="label-text text-[#111111]/30 mb-4">QR CODE PAYMENT DETAILS</p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              UPI / TRANSACTION REFERENCE NUMBER <span className="text-accent">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={qrReference}
                              onChange={(e) => setQrReference(e.target.value)}
                              className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                              placeholder="Enter UPI Transaction ID or Reference"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              PAYMENT SCREENSHOT / PROOF <span className="text-accent">*</span>
                            </label>
                            <FileUpload file={qrFile} onChange={setQrFile} />
                          </div>
                        </div>
                      </div>
                    )}
                    {payment === "upi" && (
                      <div className="border-t border-[#111111]/[0.05] pt-5">
                        <p className="label-text text-[#111111]/30 mb-4">UPI PAYMENT DETAILS</p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              UPI TRANSACTION REFERENCE <span className="text-accent">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={upiReference}
                              onChange={(e) => setUpiReference(e.target.value)}
                              className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                              placeholder="Enter 12-digit UPI Transaction ID"
                            />
                            <p className="text-[10px] text-[#111111]/25 mt-1.5">Usually starts with your UPI app name</p>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              PAYMENT SCREENSHOT / PROOF <span className="text-accent">*</span>
                            </label>
                            <FileUpload file={upiFile} onChange={setUpiFile} />
                          </div>
                        </div>
                      </div>
                    )}
                    {payment === "bank" && (
                      <div className="border-t border-[#111111]/[0.05] pt-5">
                        <p className="label-text text-[#111111]/30 mb-4">BANK TRANSFER DETAILS</p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              TRANSACTION / REFERENCE NUMBER <span className="text-accent">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={bankReference}
                              onChange={(e) => setBankReference(e.target.value)}
                              className="form-input w-full px-4 py-3 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none"
                              placeholder="Enter bank transaction or UTR number"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111]/30 uppercase tracking-widest mb-2">
                              PAYMENT PROOF (SCREENSHOT / RECEIPT) <span className="text-accent">*</span>
                            </label>
                            <FileUpload file={bankFile} onChange={setBankFile} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-10">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-press bg-accent text-white text-sm font-medium px-8 py-4 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 w-full sm:w-auto disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Icon icon="lucide:loader-2" className="w-4 h-4 inline-block animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Donation Details <span className="inline-block ml-1">→</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-[#111111]/25 mt-3">Your details will be sent to our admin for verification.</p>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-warm-alt py-24 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; THE PROCESS
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[32px] md:text-[40px] text-[#111111] leading-[1.15] tracking-tight">
              What Happens After You Submit?
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { n: "01", title: "Make Payment", desc: "Complete your donation using QR, UPI, or bank transfer." },
              { n: "02", title: "Submit Form", desc: "Fill in your details and payment reference." },
              { n: "03", title: "We Verify", desc: "Our team cross-checks your payment and details." },
              { n: "04", title: "Recorded", desc: "Your donation is added to the campaign progress." },
            ].map((s, i) => (
              <Reveal key={s.n} className={`text-center ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-5 mx-auto cursor-default transition-transform duration-400 hover:scale-110 hover:bg-accent hover:border-accent">
                  <span className="font-sans font-semibold text-accent text-sm transition-colors duration-400">{s.n}</span>
                </div>
                <h3 className="font-serif text-lg text-[#111111] mb-2">{s.title}</h3>
                <p className="text-sm text-[#111111]/40 leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRIVACY NOTE ===== */}
      <section className="bg-warm py-24 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Reveal className="bg-warm-alt border border-[#111111]/[0.07] rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <Icon icon="lucide:shield-check" className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-[#111111] mb-2">Your Privacy Matters</h3>
                  <p className="text-sm text-[#111111]/40 leading-relaxed">
                    Your phone number, email, payment screenshots, and transaction references are{" "}
                    <strong className="text-[#111111]/55">never displayed publicly</strong>. Only your display name
                    (or "Anonymous"), donation amount, campaign, and date may appear on our supporters page — and only
                    if you enable the public display option.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
