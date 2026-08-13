import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    getDefaultPaymentAccount,
    createPaymentAccount,
    updatePaymentAccount,
    removeQrCode,
} from '@/config/api/paymentReceiving.api';
import type { PaymentReceivingPayload } from '@/config/api/paymentReceiving.api';
import { uploadImage } from '@/config/api/upload.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { LoaderCircle, ImagePlus, Trash2 } from 'lucide-react';
import { getAssetUrl } from '@/Utils/constant';

// Mirrors src/paymentReceiving/paymentReceivingValidation.js on the backend.
const paymentReceivingSchema = z
    .object({
        accountName: z.string().trim().min(1, { message: 'Account name is required.' }),
        upiId: z.string().trim().optional(),
        bankName: z.string().trim().optional(),
        accountNumber: z.string().trim().optional(),
        ifscCode: z.string().trim().optional(),
        branch: z.string().trim().optional(),
        qrCode: z.string().trim().optional(),
        isDefault: z.boolean(),
    })
    .refine((d) => !!(d.upiId || d.accountNumber || d.qrCode), {
        message: 'Provide at least one payment method: UPI ID, bank account number, or QR code.',
        path: ['upiId'],
    });

type PaymentReceivingFormValues = z.infer<typeof paymentReceivingSchema>;

const emptyDefaults: PaymentReceivingFormValues = {
    accountName: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    qrCode: '',
    isDefault: true,
};

const PaymentReceivingPage = () => {
    const queryClient = useQueryClient();
    const qrInputRef = useRef<HTMLInputElement | null>(null);
    const [removeQrDialogOpen, setRemoveQrDialogOpen] = useState(false);

    const { data: account, isLoading, error } = useQuery({
        queryKey: ['payment-receiving'],
        queryFn: getDefaultPaymentAccount,
        retry: false,
    });

    // Only "no account configured yet" (404) should fall through to the
    // create form — any other failure (network, 500) is a real error.
    const isNotConfigured = axios.isAxiosError(error) && error.response?.status === 404;
    const isRealError = !!error && !isNotConfigured;

    const form = useForm<PaymentReceivingFormValues>({
        resolver: zodResolver(paymentReceivingSchema),
        defaultValues: emptyDefaults,
    });

    useEffect(() => {
        if (!account) return;
        form.reset({
            accountName: account.accountName ?? '',
            upiId: account.upiId ?? '',
            bankName: account.bankName ?? '',
            accountNumber: account.accountNumber ?? '',
            ifscCode: account.ifscCode ?? '',
            branch: account.branch ?? '',
            qrCode: account.qrCode ?? '',
            isDefault: account.isDefault ?? true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?._id]);

    // Two-step QR code flow: step 1 uploads the image and stores the
    // returned URL on the form (this mutation); step 2 is the form's own
    // "Save Changes" submit, which persists that URL onto the account via
    // create/updatePaymentAccount. Selecting a new image does NOT save by
    // itself — you still have to hit Save Changes.
    const qrCodeMutation = useMutation({
        mutationFn: (file: File) => uploadImage(file, 'qrcode'),
        onSuccess: (data) => {
            form.setValue('qrCode', data.url, { shouldDirty: true, shouldValidate: true });
            toast.success('QR code uploaded', { description: 'Click "Save Changes" to apply it.' });
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error('QR code upload failed', {
                description: err.response?.data?.message ?? 'Something went wrong.',
            });
        },
    });

    const handleQrCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) qrCodeMutation.mutate(file);
        if (qrInputRef.current) qrInputRef.current.value = '';
    };

    const removeQrMutation = useMutation({
        mutationFn: () => removeQrCode(account!._id),
        onSuccess: (updated) => {
            queryClient.setQueryData(['payment-receiving'], updated);
            form.setValue('qrCode', '', { shouldDirty: true });
            setRemoveQrDialogOpen(false);
            toast.success('QR code removed', {
                description: 'It no longer appears on the public donate page.',
            });
        },
        onError: (err: AxiosError<{ message: string }>) => {
            setRemoveQrDialogOpen(false);
            toast.error('Failed to remove QR code', {
                description: err.response?.data?.message ?? 'Something went wrong.',
            });
        },
    });

    const handleRemoveQrCode = () => {
        if (account?.qrCode && account.qrCode === form.getValues('qrCode')) {
            setRemoveQrDialogOpen(true);
        } else {
            // Not yet persisted — just uploaded locally, nothing to delete server-side.
            form.setValue('qrCode', '', { shouldDirty: true, shouldValidate: true });
        }
    };

    const buildPayload = (values: PaymentReceivingFormValues): PaymentReceivingPayload => ({
        accountName: values.accountName,
        upiId: values.upiId || undefined,
        bankName: values.bankName || undefined,
        accountNumber: values.accountNumber || undefined,
        ifscCode: values.ifscCode || undefined,
        branch: values.branch || undefined,
        qrCode: values.qrCode || undefined,
        isDefault: values.isDefault,
    });

    const mutation = useMutation({
        mutationFn: (values: PaymentReceivingFormValues) =>
            account
                ? updatePaymentAccount(account._id, buildPayload(values))
                : createPaymentAccount(buildPayload(values)),
        onSuccess: (updated) => {
            queryClient.setQueryData(['payment-receiving'], updated);
            toast.success(account ? 'Payment details updated' : 'Payment details saved', {
                description: 'Campaigns will use this account to receive donations.',
            });
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error('Failed to save payment details', {
                description: err.response?.data?.message ?? 'Something went wrong. Please try again.',
            });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading payment details...
            </div>
        );
    }

    if (isRealError) {
        return (
            <p className="py-24 text-center text-sm text-red-500">
                Couldn't load payment receiving details. Check your connection and try again.
            </p>
        );
    }

    const qrCodeValue = form.watch('qrCode');

    return (
        <div>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Payment Accounts</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6 max-w-3xl space-y-4">
                <div>
                    <h1 className="text-xl font-bold">Payment Accounts</h1>
                    <p className="text-sm text-muted-foreground">
                        The QR code, UPI ID, and bank details donors see when contributing. Every campaign
                        currently shares this one default account.
                    </p>
                </div>

                {isNotConfigured && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        No payment receiving account has been configured yet. Fill in the details below and
                        save — campaigns can't be created until one exists.
                    </p>
                )}

                <div className="rounded-xl border bg-card">
                    <div className="px-6 py-5">
                        <h2 className="text-sm font-semibold">Account Details</h2>
                    </div>

                    <Separator />

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                            <div className="px-6 py-6 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="accountName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NGO Main Account" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="upiId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>UPI ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ngo@upi" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* QR code — two-step: upload now (stores the URL on the form),
                                    then "Save Changes" below actually persists it to the account. */}
                                <div>
                                    <p className="text-sm font-medium mb-2">QR Code</p>
                                    <div className="flex items-center gap-4">
                                        {qrCodeValue ? (
                                            <img
                                                src={getAssetUrl(qrCodeValue)}
                                                alt="Payment QR code"
                                                className="h-20 w-20 rounded-md object-cover border"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                                                <ImagePlus className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={qrCodeMutation.isPending}
                                                    onClick={() => qrInputRef.current?.click()}
                                                >
                                                    {qrCodeMutation.isPending && (
                                                        <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />
                                                    )}
                                                    {qrCodeValue ? 'Replace' : 'Upload'}
                                                </Button>
                                                {qrCodeValue && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                        disabled={removeQrMutation.isPending}
                                                        onClick={handleRemoveQrCode}
                                                    >
                                                        {removeQrMutation.isPending ? (
                                                            <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />
                                                        ) : (
                                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                        )}
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                JPG, PNG, WEBP · Max 5MB
                                            </span>
                                        </div>
                                        <input
                                            ref={qrInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleQrCodeChange}
                                        />
                                    </div>
                                    <FormMessage>{form.formState.errors.qrCode?.message}</FormMessage>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="State Bank of India" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1234567890123" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ifscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IFSC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SBIN0001234" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="branch"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Branch</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Main Branch" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end px-6 py-4">
                                <Button
                                    type="submit"
                                    variant="theme"
                                    size="sm"
                                    disabled={mutation.isPending || qrCodeMutation.isPending}
                                >
                                    {mutation.isPending && <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            <AlertDialog open={removeQrDialogOpen} onOpenChange={setRemoveQrDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove the payment QR code?</AlertDialogTitle>
                        <AlertDialogDescription>
                            It will immediately disappear from the public donate page. Donors will still be able to
                            pay via UPI or bank transfer if those are configured.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removeQrMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => removeQrMutation.mutate()}
                            disabled={removeQrMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {removeQrMutation.isPending ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PaymentReceivingPage;
