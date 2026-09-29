import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Building, Copy, XCircle, Receipt, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";

interface BuyAccessCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "confirm" | "loading" | "payment" | "txnId" | "verifying" | "failed";

export function BuyAccessCodeDialog({ open, onOpenChange }: BuyAccessCodeDialogProps) {
  const [step, setStep] = useState<Step>("form");

  const getAutoFilledData = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return {
        fullName: currentUser.name || "",
        email: currentUser.email || ""
      };
    } catch {
      return { fullName: "", email: "" };
    }
  };

  const [formData, setFormData] = useState(() => getAutoFilledData());
  const [accessCode, setAccessCode] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const BANKS = [
    {
      id: "moniepoint",
      bank: "Moniepoint MFB",
      number: "6801794446",
      name: "SPORTY INTERNET LTD.FRA | MONIE POINT",
    },
    {
      id: "sterling",
      bank: "Sterling Bank",
      number: "5299450355",
      name: "MFY / SPORTY INTERNET LTD-FRA",
    },
  ] as const;

  const ROTATION_KEY = "cp_pay_account_rotation";
  const [bankIndex, setBankIndex] = useState(0);
  const activeBank = BANKS[bankIndex];

  useEffect(() => {
    if (open) {
      setFormData(getAutoFilledData());
      // Paystack-style rotation: show a different payment account each session
      let next = 0;
      try {
        next = parseInt(localStorage.getItem(ROTATION_KEY) || "0", 10) || 0;
      } catch {
        next = 0;
      }
      const idx = ((next % BANKS.length) + BANKS.length) % BANKS.length;
      setBankIndex(idx);
      try {
        localStorage.setItem(ROTATION_KEY, String((idx + 1) % BANKS.length));
      } catch {
        /* ignore */
      }
    }
  }, [open]);


  const handlePayClick = () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setStep("confirm");
  };

  const handleConfirmEmail = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("payment");
    }, 2000);
  };

  const handlePaymentComplete = () => {
    setStep("txnId");
  };

  const handleSubmitTxnId = () => {
    const trimmed = transactionId.trim();
    if (trimmed.length < 6) {
      toast.error("Please enter a valid Payment Transaction ID");
      return;
    }
    setStep("verifying");
    toast.success("Transaction ID submitted. Verifying your payment...");
    setTimeout(() => {
      setStep("failed");
      toast.error("No payment received");
    }, 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleClose = () => {
    setStep("form");
    setFormData({ fullName: "", email: "" });
    setAccessCode("");
    setTransactionId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-[360px] rounded-3xl max-h-[90dvh] overflow-y-auto">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Buy Access Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Auto-filled user details card */}
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Your Details (Auto-filled)</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Full Name</p>
                  <p className="font-semibold text-foreground">{formData.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Email Address</p>
                  <p className="font-semibold text-foreground">{formData.email || "—"}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-2xl font-bold text-primary">₦7,000</span>
                </div>
              </div>

              <Button
                onClick={handlePayClick}
                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
              >
                Pay Now
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Confirm Your Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                  <p className="font-semibold text-lg">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-semibold text-lg">{formData.email}</p>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount</span>
                    <span className="text-2xl font-bold text-primary">₦7,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  ⚠️ Please confirm your details are correct before proceeding to payment.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("form")}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl"
                >
                  Edit Details
                </Button>
                <Button
                  onClick={handleConfirmEmail}
                  className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
                >
                  Confirm & Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Preparing Payment Account...</h3>
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          </div>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Complete Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">Secure Bank Transfer · NIBSS Verified</p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Auto-confirmation in 1–3 minutes</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                This payment account is assigned to your session. Pay only to the account shown below.
              </p>



              <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pay To</p>
                    <p className="font-bold text-sm leading-tight">{activeBank.bank}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">VERIFIED</span>
                </div>

                <div className="p-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeBank.number)}
                    className="w-full text-left flex items-center justify-between bg-muted/40 hover:bg-muted/70 active:bg-muted transition-colors rounded-xl p-3 border border-border/40"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Account Number</p>
                      <p className="font-mono font-black text-lg tracking-wider text-foreground">{activeBank.number}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-[11px] font-bold">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeBank.name)}
                    className="w-full text-left flex items-center justify-between bg-muted/40 hover:bg-muted/70 active:bg-muted transition-colors rounded-xl p-3 border border-border/40"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Account Name</p>
                      <p className="font-bold text-sm">{activeBank.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-[11px] font-bold">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </div>
                  </button>

                  <div className="rounded-xl p-3 border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Exact Amount</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">REQUIRED</span>
                    </div>
                    <p className="font-black text-2xl text-primary leading-tight mt-0.5">₦7,000<span className="text-sm text-muted-foreground font-bold">.00</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">How to pay</p>
                {[
                  "Open your banking app and select Transfer",
                  "Enter the account details above",
                  "Send exactly ₦7,000 — no more, no less",
                  "Tap the button below after payment",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-xs text-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handlePaymentComplete}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I have completed payment
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                🔒 Encrypted · Your details are never stored
              </p>
            </div>
          </>
        )}

        {step === "txnId" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold leading-tight">Submit Payment Transaction ID</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      One last step to receive your Access Code
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To confirm and match your transfer to your account, please send us the
                      <span className="font-semibold text-foreground"> Payment Transaction ID </span>
                      (also called Reference, Session ID, or Receipt Number) from your bank app.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Once submitted, our system will begin the automatic checkout and verification of your ₦7,000 payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Where to find it</p>
                {[
                  "Open your bank app and go to Transaction History",
                  "Tap the ₦7,000 transfer you just sent",
                  "Copy the Transaction ID / Reference / Session ID",
                  "Paste it below and tap Submit",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-xs text-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Transaction ID</label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 1000000123456789"
                  className="h-12 rounded-xl font-mono tracking-wider text-sm"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground">Enter the exact reference from your bank receipt.</p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">
                  Your submission is secure and used only to confirm your payment.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("payment")}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitTxnId}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                >
                  Submit & Start Checkout
                </Button>
              </div>
            </div>
          </>
        )}



        {step === "verifying" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Checking for your payment...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we verify your payment</p>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center space-y-4 py-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">No Payment Found!</DialogTitle>
            </DialogHeader>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-6">
              <p className="text-sm text-red-900 dark:text-red-200 mb-4 font-semibold">
                Please make payment with the exact amount of ₦7,000
              </p>
              <p className="text-xs text-red-800 dark:text-red-300 mb-3">
                Common reasons for payment verification failure:
              </p>
              <ul className="text-xs text-red-800 dark:text-red-300 text-left space-y-2">
                <li>• Payment has not been completed</li>
                <li>• Incorrect payment amount (must be exactly ₦7,000)</li>
                <li>• Network delay in processing payment</li>
                <li>• Payment sent to wrong account</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 py-6 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep("payment")}
                className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
