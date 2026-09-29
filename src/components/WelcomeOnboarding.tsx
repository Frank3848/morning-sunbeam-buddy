import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface WelcomeOnboardingProps {
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    icon: Gift,
    badge: "🎉 Welcome Gift",
    title: "Congratulations! Your ₦500,000 Welcome Bonus Has Been Credited!",
    subtitle: "Your CashPay account is now fully set up and ready to use. Your welcome bonus has been added to your wallet.",
    highlight: "₦500,000.00",
    highlightLabel: "Credited to your wallet",
    points: [
      "✅ Your account is verified and active",
      "✅ Welcome bonus of ₦500,000 has been credited",
      "✅ You are ready to transact and earn more",
    ],
    gradientStyle: "linear-gradient(135deg, hsl(158 64% 32%) 0%, hsl(158 54% 48%) 100%)",
  },
  {
    id: 2,
    icon: TrendingUp,
    badge: "💰 How You Earn",
    title: "Here's How You Can Earn Even More on CashPay",
    subtitle: "CashPay is a 100% legitimate platform built to reward you for every transaction you make.",
    highlight: "Multiple Ways to Earn",
    highlightLabel: "Grow your balance every day",
    points: [
      "🎯 Win up to ₦50,000 in weekly cash rewards",
      "📱 Buy airtime & data at discounted rates",
      "👥 Refer friends and earn referral bonuses",
    ],
    gradientStyle: "linear-gradient(135deg, hsl(210 80% 40%) 0%, hsl(200 70% 50%) 100%)",
  },
  {
    id: 3,
    icon: ShieldCheck,
    badge: "🔐 You're Protected",
    title: "CashPay is 100% Legit, Safe & Fully Secure",
    subtitle: "Your funds and personal data are always protected with bank-level security standards.",
    highlight: "Bank-Level Security",
    highlightLabel: "Your money is 100% safe with us",
    points: [
      "🔒 Your connection to CashPay is encrypted",
      "🏦 Funds are secured with access code protection",
      "⚡ Instant withdrawals directly to your bank account",
    ],
    gradientStyle: "linear-gradient(135deg, hsl(270 60% 38%) 0%, hsl(280 50% 52%) 100%)",
  },
];

const WelcomeOnboarding = ({ userName, onComplete }: WelcomeOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [claimed, setClaimed] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep === 0 && !claimed) {
      setClaimed(true);
      return;
    }
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
    >
      <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{ background: step.gradientStyle }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 blur-xl" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* Step progress dots */}
          <div className="flex items-center gap-2 mb-4 relative z-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-white" : i < currentStep ? "w-4 bg-white/70" : "w-4 bg-white/30"
                }`}
              />
            ))}
          </div>

          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 relative z-10" style={{ background: "rgba(255,255,255,0.2)" }}>
            {step.badge}
          </span>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/75 mb-0.5">Step {currentStep + 1} of {steps.length}</p>
              <p className="text-base font-bold text-white leading-tight">
                {currentStep === 0 ? `Welcome, ${userName}! 👋` : step.badge}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <h2 className="text-sm font-bold text-foreground leading-snug mb-2">
            {step.title}
          </h2>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {step.subtitle}
          </p>

          {/* Highlight Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 text-center">
            {currentStep === 0 && claimed ? (
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">Bonus Successfully Claimed!</span>
              </div>
            ) : (
              <p className="text-xl font-extrabold text-primary mb-0.5">{step.highlight}</p>
            )}
            <p className="text-xs text-muted-foreground">{step.highlightLabel}</p>
          </div>

          {/* Points */}
          <ul className="space-y-2 mb-5">
            {step.points.map((point, i) => (
              <li key={i} className="text-xs text-foreground bg-muted/50 rounded-xl px-3 py-2 leading-relaxed">
                {point}
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            onClick={handleNext}
            className="w-full h-12 font-bold text-sm rounded-2xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            {currentStep === 0 && !claimed ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Claim My ₦500,000 Bonus
              </span>
            ) : isLast ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Proceed to My Dashboard
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          {currentStep > 0 && !isLast && (
            <button
              onClick={onComplete}
              className="w-full mt-2 text-xs text-muted-foreground text-center py-2"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboarding;
