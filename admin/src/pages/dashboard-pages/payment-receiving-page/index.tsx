import { useState } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { getDefaultPaymentAccount } from '@/config/api/paymentReceiving.api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { LoaderCircle, ImageOff, Copy, Check, Landmark, QrCode, Wallet } from 'lucide-react';
import { getAssetUrl } from '@/Utils/constant';

// Read-only by design: these details are fixed and can only be changed by
// re-running backend/scripts/seedPaymentReceiving.js on the server, so
// nobody can tamper with the NGO's bank/UPI details through the app.

const CopyableField = ({ label, value }: { label: string; value?: string | null }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {value ? (
                <button
                    type="button"
                    onClick={handleCopy}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                    <span className="text-sm font-medium truncate">{value}</span>
                    {copied ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    )}
                </button>
            ) : (
                <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-2.5">Not set</p>
            )}
        </div>
    );
};

const PaymentReceivingPage = () => {
    const { data: account, isLoading, error } = useQuery({
        queryKey: ['payment-receiving'],
        queryFn: getDefaultPaymentAccount,
        retry: false,
    });

    const isNotConfigured = axios.isAxiosError(error) && error.response?.status === 404;
    const isRealError = !!error && !isNotConfigured;

    if (isRealError) {
        toast.error("Couldn't load payment receiving details.");
    }

    return (
        <div>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Payment Accounts</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6 w-full max-w-5xl space-y-4">
                <div>
                    <h1 className="text-xl font-bold">Payment Accounts</h1>
                    <p className="text-sm text-muted-foreground">
                        Fixed payment details shown to donors.
                    </p>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
                        <LoaderCircle className="animate-spin h-4 w-4" />
                        Loading payment details...
                    </div>
                )}

                {isRealError && (
                    <p className="py-12 text-center text-sm text-red-500">
                        Couldn't load payment receiving details. Check your connection and try again.
                    </p>
                )}

                {isNotConfigured && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        No payment receiving account has been configured yet. Set the PAYMENT_* variables in
                        the backend's .env and run <code>npm run seed:payment</code> to create one — campaigns
                        can't be created until one exists.
                    </p>
                )}

                {account && (
                    <div className="rounded-2xl border bg-card overflow-hidden">
                        <div className="px-6 py-5 border-b bg-muted/20">
                            <h2 className="text-sm font-semibold">{account?.accountName}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Default receiving account</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: QR code */}
                            <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 md:border-r">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <QrCode className="h-3.5 w-3.5" />
                                    SCAN TO PAY
                                </div>
                                {account?.qrCode ? (
                                    <div className="rounded-2xl border-4 border-white shadow-md shadow-black/5 ring-1 ring-border p-2 bg-white">
                                        <img
                                            src={getAssetUrl(account.qrCode)}
                                            alt="Payment QR code"
                                            className="h-56 w-56 rounded-lg object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-56 w-56 rounded-2xl border border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <ImageOff className="h-6 w-6" />
                                        <span className="text-xs">QR code not set</span>
                                    </div>
                                )}
                                {account?.upiId && (
                                    <p className="text-xs text-muted-foreground text-center max-w-[220px]">
                                        Donors can scan this code with any UPI app to pay instantly.
                                    </p>
                                )}
                            </div>

                            {/* Right: UPI + bank details */}
                            <div className="px-6 py-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                                        <Wallet className="h-3.5 w-3.5" />
                                        UPI
                                    </div>
                                    <CopyableField label="UPI ID" value={account?.upiId} />
                                </div>

                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                                        <Landmark className="h-3.5 w-3.5" />
                                        BANK DETAILS
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <CopyableField label="Bank Name" value={account?.bankName} />
                                        <CopyableField label="Branch" value={account?.branch} />
                                        <CopyableField label="Account Number" value={account?.accountNumber} />
                                        <CopyableField label="IFSC Code" value={account?.ifscCode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentReceivingPage;
