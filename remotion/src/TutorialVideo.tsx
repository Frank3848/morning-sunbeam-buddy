import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800", "900"], subsets: ["latin"] });

// Brand
const BRAND = {
  bg: "#0B1220",
  bg2: "#101A2E",
  card: "#FFFFFF",
  cardSoft: "#F4F7FB",
  primary: "#10B981",
  primaryDark: "#059669",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  gold: "#F59E0B",
};

// ───────── Persistent background ─────────
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 20;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${BRAND.bg} 0%, ${BRAND.bg2} 100%)`, fontFamily }}>
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.25), transparent 60%)",
        top: -200 + drift, left: -150,
      }} />
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 60%)",
        bottom: -150 - drift, right: -120,
      }} />
    </AbsoluteFill>
  );
};

// ───────── Phone frame wrapper ─────────
const PhoneFrame: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  return (
    <div style={{
      width: 360, height: 740, borderRadius: 44, background: "#000",
      padding: 10, boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.08)",
      position: "relative",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 36, overflow: "hidden",
        background: BRAND.cardSoft, position: "relative",
      }}>
        {/* Status bar */}
        <div style={{
          height: 32, display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 18px", fontSize: 11, fontWeight: 700, color: BRAND.text, background: "#fff",
        }}>
          <span>9:41</span>
          <span>{title ?? "CashPay"}</span>
          <span>100%</span>
        </div>
        {children}
      </div>
    </div>
  );
};

// ───────── Cursor / tap indicator ─────────
const Tap: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  if (f < 0) return null;
  const ringScale = interpolate(f, [0, 25], [0.4, 2], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(f, [0, 25], [0.7, 0], { extrapolateRight: "clamp" });
  const dotScale = spring({ frame: f, fps, config: { damping: 8, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${ringScale})`,
        width: 60, height: 60, borderRadius: "50%", border: `3px solid ${BRAND.primary}`, opacity: ringOpacity,
      }} />
      <div style={{
        transform: `translate(-50%,-50%) scale(${dotScale})`,
        width: 28, height: 28, borderRadius: "50%", background: BRAND.primary,
        boxShadow: `0 0 20px ${BRAND.primary}`,
      }} />
    </div>
  );
};

// ───────── Chapter title card ─────────
const ChapterCard: React.FC<{ chapter: string; title: string; subtitle: string }> = ({ chapter, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 14 } });
  const s2 = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const s3 = spring({ frame: frame - 16, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <Backdrop />
      <div style={{ textAlign: "center", padding: 60, position: "relative", zIndex: 2 }}>
        <div style={{
          opacity: s1, transform: `translateY(${interpolate(s1, [0, 1], [30, 0])}px)`,
          display: "inline-block", padding: "8px 20px", background: BRAND.primary,
          color: "#fff", borderRadius: 999, fontSize: 22, fontWeight: 800, letterSpacing: 2, marginBottom: 30,
        }}>{chapter}</div>
        <div style={{
          opacity: s2, transform: `translateY(${interpolate(s2, [0, 1], [40, 0])}px)`,
          color: "#fff", fontSize: 78, fontWeight: 900, lineHeight: 1.05, marginBottom: 20,
        }}>{title}</div>
        <div style={{
          opacity: s3, transform: `translateY(${interpolate(s3, [0, 1], [30, 0])}px)`,
          color: "rgba(255,255,255,0.65)", fontSize: 30, fontWeight: 500,
        }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────── Caption banner ─────────
const Caption: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div style={{
      position: "absolute", bottom: 80, left: "50%",
      transform: `translate(-50%, ${interpolate(s, [0, 1], [40, 0])}px)`,
      opacity: s, padding: "16px 28px", borderRadius: 16,
      background: "rgba(15,23,42,0.92)", color: "#fff", fontSize: 26, fontWeight: 700,
      maxWidth: 600, textAlign: "center", fontFamily,
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      border: `1px solid ${BRAND.primary}`,
    }}>{text}</div>
  );
};

// ============= INTRO =============
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSpring = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const titleSpring = spring({ frame: frame - 12, fps, config: { damping: 14 } });
  const subSpring = spring({ frame: frame - 22, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <Backdrop />
      <div style={{ textAlign: "center", padding: 60, zIndex: 2 }}>
        <div style={{
          transform: `scale(${logoSpring})`, opacity: logoSpring,
          width: 160, height: 160, margin: "0 auto 30px",
          borderRadius: 40, background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 84, fontWeight: 900, color: "#fff",
          boxShadow: `0 20px 60px ${BRAND.primary}80`,
        }}>₦</div>
        <div style={{
          opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0,1],[30,0])}px)`,
          color: "#fff", fontSize: 86, fontWeight: 900, letterSpacing: -2,
        }}>CashPay</div>
        <div style={{
          opacity: subSpring, transform: `translateY(${interpolate(subSpring, [0,1],[20,0])}px)`,
          color: BRAND.primary, fontSize: 34, fontWeight: 700, marginTop: 12,
        }}>How-To Guide</div>
        <div style={{
          opacity: subSpring, color: "rgba(255,255,255,0.6)", fontSize: 24, marginTop: 24, fontWeight: 500,
        }}>Buy Access Code · Withdraw · Airtime · Data</div>
      </div>
    </AbsoluteFill>
  );
};

// ============= ACCESS CODE FLOW =============
// Step 1: Dashboard with highlight on "Buy Access Code"
const AccessStep1: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame>
        <div style={{ padding: 16, fontFamily }}>
          {/* balance card */}
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
            borderRadius: 20, padding: 18, color: "#fff",
          }}>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Available Balance</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>₦500,000.00</div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 6 }}>Welcome bonus credited 🎉</div>
          </div>
          {/* quick actions grid */}
          <div style={{ marginTop: 16, fontWeight: 800, fontSize: 13, color: BRAND.text }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 10 }}>
            {[
              { l: "Transfer", c: "#3B82F6" },
              { l: "Buy Code", c: BRAND.primary, highlight: true },
              { l: "Airtime", c: "#F59E0B" },
              { l: "Data", c: "#8B5CF6" },
            ].map((a, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: "12px 6px",
                textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                border: a.highlight ? `2px solid ${BRAND.primary}` : "1px solid #eef2f7",
                transform: a.highlight ? `scale(${pulse})` : "scale(1)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: a.c, margin: "0 auto 6px",
                }} />
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.text }}>{a.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontWeight: 800, fontSize: 13, color: BRAND.text }}>Recent Activity</div>
          {[1,2].map(i => (
            <div key={i} style={{
              marginTop: 8, background: "#fff", borderRadius: 12, padding: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.text }}>Welcome Bonus</div>
                <div style={{ fontSize: 9, color: BRAND.muted }}>Today</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.primary }}>+₦500,000</div>
            </div>
          ))}
        </div>
        {/* Tap on "Buy Code" — position relative to phone (PhoneFrame width 360) */}
        <Tap x={170} y={195} delay={20} />
      </PhoneFrame>
      <Caption text="Tap 'Buy Access Code' on the dashboard" delay={6} />
    </AbsoluteFill>
  );
};

// Step 2: Payment instructions sheet (matches in-app Moniepoint preview)
const AccessStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheet = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Payment Instructions">
        <div style={{ padding: 14, fontFamily,
          transform: `translateY(${interpolate(sheet, [0,1],[200,0])}px)`, opacity: sheet }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary}15, #3B82F615)`,
            borderRadius: 16, padding: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 16,
              }}>🏦</div>
              <div>
                <div style={{ fontSize: 9, color: BRAND.muted, fontWeight: 600 }}>Bank Name</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.text }}>Moniepoint MFB</div>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: 10, marginTop: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 9, color: BRAND.muted }}>Account Number</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.text, letterSpacing: 1 }}>6801794446</div>
              </div>
              <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 800 }}>COPY</div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: 10, marginTop: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 9, color: BRAND.muted }}>Account Name</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: BRAND.text }}>SPORTY INTERNET LTD.FRA | MONIE POINT</div>
              </div>
              <div style={{ fontSize: 10, color: BRAND.primary, fontWeight: 800 }}>COPY</div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: 10, marginTop: 8,
            }}>
              <div style={{ fontSize: 9, color: BRAND.muted }}>Amount to Pay</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.primary }}>₦7,000</div>
            </div>
          </div>

          <div style={{
            marginTop: 10, background: "#FEF3C7", border: "1px solid #FDE68A",
            borderRadius: 10, padding: 10, fontSize: 9, color: "#92400E", lineHeight: 1.4,
          }}>
            ⚠️ Send the exact amount, then tap "I have completed payment".
          </div>

          <div style={{
            marginTop: 10, background: BRAND.primary, color: "#fff", textAlign: "center",
            padding: "12px 0", borderRadius: 12, fontWeight: 800, fontSize: 13,
          }}>I have completed payment</div>
        </div>
        <Tap x={180} y={640} delay={40} />
      </PhoneFrame>
      <Caption text="Transfer ₦7,000 to the account, then confirm" delay={10} />
    </AbsoluteFill>
  );
};

// Step 3: Success
const AccessStep3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const check = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  const text = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Payment Successful">
        <div style={{ padding: 30, fontFamily, height: "calc(100% - 32px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            background: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${check})`,
            boxShadow: `0 0 60px ${BRAND.primary}80`,
          }}>
            <div style={{ color: "#fff", fontSize: 70, fontWeight: 900 }}>✓</div>
          </div>
          <div style={{
            opacity: text, transform: `translateY(${interpolate(text,[0,1],[20,0])}px)`,
            marginTop: 24, fontSize: 22, fontWeight: 900, color: BRAND.text,
          }}>Access Code Activated</div>
          <div style={{
            opacity: text, marginTop: 8, fontSize: 12, color: BRAND.muted, textAlign: "center",
          }}>Your withdrawals are now unlocked.<br/>Your access code has been sent to your email.</div>
          <div style={{
            opacity: text, marginTop: 20, padding: "12px 24px", borderRadius: 14,
            background: "#fff", border: `2px dashed ${BRAND.primary}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 9, color: BRAND.muted, fontWeight: 700, letterSpacing: 1 }}>YOUR ACCESS CODE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.primary, letterSpacing: 4, marginTop: 2 }}>123456</div>
          </div>
        </div>
      </PhoneFrame>
      <Caption text="Done! Your access code is active for life" delay={6} />
    </AbsoluteFill>
  );
};

// ============= AIRTIME / DATA FLOW =============
const AirtimeStep1: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame>
        <div style={{ padding: 16, fontFamily }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
            borderRadius: 20, padding: 18, color: "#fff",
          }}>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Available Balance</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>₦500,000.00</div>
          </div>
          <div style={{ marginTop: 16, fontWeight: 800, fontSize: 13, color: BRAND.text }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 10 }}>
            {[
              { l: "Transfer", c: "#3B82F6" },
              { l: "Buy Code", c: BRAND.primary },
              { l: "Airtime", c: "#F59E0B", highlight: true },
              { l: "Data", c: "#8B5CF6" },
            ].map((a, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: "12px 6px",
                textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                border: a.highlight ? `2px solid ${BRAND.gold}` : "1px solid #eef2f7",
                transform: a.highlight ? `scale(${pulse})` : "scale(1)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: a.c, margin: "0 auto 6px",
                }} />
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.text }}>{a.l}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, background: "#fff", borderRadius: 14, padding: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7" }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800 }}>Top up in seconds</div>
              <div style={{ fontSize: 9, color: BRAND.muted }}>MTN · Airtel · Glo · 9mobile</div>
            </div>
          </div>
        </div>
        <Tap x={260} y={195} delay={20} />
      </PhoneFrame>
      <Caption text="Tap 'Airtime' (or 'Data') from quick actions" delay={6} />
    </AbsoluteFill>
  );
};

const AirtimeStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheet = spring({ frame, fps, config: { damping: 18 } });
  const typed = Math.min(11, Math.max(0, frame - 18));
  const phone = "08123456789".slice(0, typed);
  const amountAppear = spring({ frame: frame - 40, fps, config: { damping: 14 } });
  const networks = ["MTN", "Airtel", "Glo", "9mobile"];
  const selected = 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Buy Airtime">
        <div style={{ padding: 16, fontFamily,
          transform: `translateY(${interpolate(sheet,[0,1],[200,0])}px)`, opacity: sheet }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Select Network</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {networks.map((n, i) => (
              <div key={n} style={{
                flex: 1, padding: "10px 0", textAlign: "center", borderRadius: 10,
                background: i === selected ? BRAND.primary : "#fff",
                color: i === selected ? "#fff" : BRAND.text, fontSize: 10, fontWeight: 800,
                border: i === selected ? "none" : "1px solid #e2e8f0",
              }}>{n}</div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Phone Number</div>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 14, marginTop: 6,
            border: "1px solid #e2e8f0", fontSize: 18, fontWeight: 800, color: BRAND.text,
            letterSpacing: 1,
          }}>{phone}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span></div>

          <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Amount</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 6 }}>
            {[100, 200, 500, 1000, 2000, 5000].map((a, i) => (
              <div key={a} style={{
                padding: "12px 0", textAlign: "center", borderRadius: 10,
                background: a === 1000 ? BRAND.primary : "#fff",
                color: a === 1000 ? "#fff" : BRAND.text,
                fontSize: 12, fontWeight: 800, border: a === 1000 ? "none" : "1px solid #e2e8f0",
                opacity: amountAppear,
                transform: `translateY(${interpolate(amountAppear,[0,1],[20,0])}px) scale(${a===1000 ? 1 + Math.sin(frame/6)*0.02 : 1})`,
              }}>₦{a.toLocaleString()}</div>
            ))}
          </div>
          <div style={{
            marginTop: 18, background: BRAND.primary, color: "#fff", textAlign: "center",
            padding: "14px 0", borderRadius: 14, fontWeight: 800, fontSize: 14,
            opacity: amountAppear,
          }}>Buy Airtime</div>
        </div>
        <Tap x={180} y={620} delay={70} />
      </PhoneFrame>
      <Caption text="Pick network, enter number, choose amount" delay={8} />
    </AbsoluteFill>
  );
};

const AirtimeStep3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const check = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  const text = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Top-up Successful">
        <div style={{ padding: 30, fontFamily, height: "calc(100% - 32px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            background: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${check})`, boxShadow: `0 0 60px ${BRAND.primary}80`,
          }}>
            <div style={{ color: "#fff", fontSize: 70, fontWeight: 900 }}>✓</div>
          </div>
          <div style={{ opacity: text, marginTop: 24, fontSize: 22, fontWeight: 900, color: BRAND.text }}>
            ₦1,000 Airtime Sent
          </div>
          <div style={{ opacity: text, marginTop: 8, fontSize: 12, color: BRAND.muted, textAlign: "center" }}>
            MTN · 0812 345 6789<br/>Delivered instantly
          </div>
          <div style={{
            opacity: text, marginTop: 22, width: "100%",
            background: BRAND.cardSoft, borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: BRAND.muted }}>Reference</span>
              <span style={{ fontWeight: 800, color: BRAND.text }}>CP-AT-7821</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
              <span style={{ color: BRAND.muted }}>Status</span>
              <span style={{ fontWeight: 800, color: BRAND.primary }}>Completed</span>
            </div>
          </div>
        </div>
      </PhoneFrame>
      <Caption text="Same flow works for Data bundles" delay={6} />
    </AbsoluteFill>
  );
};

const WithdrawStep1: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame>
        <div style={{ padding: 16, fontFamily }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
            borderRadius: 20, padding: 18, color: "#fff",
          }}>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Available Balance</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>₦500,000.00</div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 6 }}>Ready for withdrawal</div>
          </div>
          <div style={{ marginTop: 16, fontWeight: 800, fontSize: 13, color: BRAND.text }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 10 }}>
            {[
              { l: "Transfer", c: "#3B82F6", highlight: true },
              { l: "Buy Code", c: BRAND.primary },
              { l: "Airtime", c: "#F59E0B" },
              { l: "Data", c: "#8B5CF6" },
            ].map((a, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: "12px 6px",
                textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                border: a.highlight ? `2px solid #3B82F6` : "1px solid #eef2f7",
                transform: a.highlight ? `scale(${pulse})` : "scale(1)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: a.c, margin: "0 auto 6px",
                }} />
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.text }}>{a.l}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, background: "#fff", borderRadius: 14, padding: 14,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: BRAND.text }}>Withdraw once your code is active</div>
              <div style={{ fontSize: 9, color: BRAND.muted }}>Send to any Nigerian bank account</div>
            </div>
            <div style={{ fontSize: 18 }}>🏦</div>
          </div>
        </div>
        <Tap x={83} y={195} delay={20} />
      </PhoneFrame>
      <Caption text="Tap 'Transfer' to start your withdrawal" delay={6} />
    </AbsoluteFill>
  );
};

const WithdrawStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheet = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Transfer Funds">
        <div style={{
          padding: 16, fontFamily,
          transform: `translateY(${interpolate(sheet,[0,1],[200,0])}px)`, opacity: sheet,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Amount</div>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 14, marginTop: 6,
            border: "1px solid #e2e8f0", fontSize: 18, fontWeight: 800, color: BRAND.text,
          }}>₦50,000</div>
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Bank</div>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 14, marginTop: 6,
            border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 700, color: BRAND.text,
          }}>Kuda Bank</div>
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Account Number</div>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 14, marginTop: 6,
            border: "1px solid #e2e8f0", fontSize: 18, fontWeight: 800, color: BRAND.text,
            letterSpacing: 1,
          }}>1234567890</div>
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: BRAND.muted }}>Access Code</div>
          <div style={{
            background: "#ECFDF5", borderRadius: 12, padding: 14, marginTop: 6,
            border: `1px solid ${BRAND.primary}`, fontSize: 18, fontWeight: 900, color: BRAND.primary,
            letterSpacing: 1,
          }}>• • • • • • • •</div>
          <div style={{
            marginTop: 18, background: BRAND.primary, color: "#fff", textAlign: "center",
            padding: "14px 0", borderRadius: 14, fontWeight: 800, fontSize: 14,
          }}>Send Money</div>
        </div>
        <Tap x={180} y={640} delay={72} />
      </PhoneFrame>
      <Caption text="Enter amount, bank, account number and your access code" delay={8} />
    </AbsoluteFill>
  );
};

const WithdrawStep3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const check = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  const text = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <PhoneFrame title="Withdrawal Successful">
        <div style={{ padding: 30, fontFamily, height: "calc(100% - 32px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            background: BRAND.primary, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${check})`, boxShadow: `0 0 60px ${BRAND.primary}80`,
          }}>
            <div style={{ color: "#fff", fontSize: 70, fontWeight: 900 }}>✓</div>
          </div>
          <div style={{ opacity: text, marginTop: 24, fontSize: 22, fontWeight: 900, color: BRAND.text }}>
            ₦50,000 Sent Successfully
          </div>
          <div style={{ opacity: text, marginTop: 8, fontSize: 12, color: BRAND.muted, textAlign: "center" }}>
            Kuda Bank · 1234567890<br/>Processed and completed
          </div>
          <div style={{
            opacity: text, marginTop: 22, width: "100%",
            background: BRAND.cardSoft, borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: BRAND.muted }}>Reference</span>
              <span style={{ fontWeight: 800, color: BRAND.text }}>CP-WD-9021</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
              <span style={{ color: BRAND.muted }}>Status</span>
              <span style={{ fontWeight: 800, color: BRAND.primary }}>Completed</span>
            </div>
          </div>
        </div>
      </PhoneFrame>
      <Caption text="Your withdrawal is complete" delay={6} />
    </AbsoluteFill>
  );
};

// ============= OUTRO =============
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 14 } });
  const s2 = spring({ frame: frame - 12, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <Backdrop />
      <div style={{ textAlign: "center", padding: 60, zIndex: 2 }}>
        <div style={{
          opacity: s1, transform: `scale(${s1})`,
          fontSize: 90, fontWeight: 900, color: "#fff", letterSpacing: -2,
        }}>You're set 🚀</div>
        <div style={{
          opacity: s2, marginTop: 18, fontSize: 30, color: "rgba(255,255,255,0.8)", fontWeight: 600,
        }}>Fast · Secure · Nigerian</div>
        <div style={{
          opacity: s2, marginTop: 40, display: "inline-block",
          padding: "16px 36px", borderRadius: 999,
          background: BRAND.primary, color: "#fff", fontSize: 28, fontWeight: 800,
          boxShadow: `0 12px 40px ${BRAND.primary}80`,
        }}>cashpay.app</div>
      </div>
    </AbsoluteFill>
  );
};

export const TutorialVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={75}><Intro /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

        <TransitionSeries.Sequence durationInFrames={70}>
          <ChapterCard chapter="PART 1" title="Buy Access Code" subtitle="Unlock withdrawals in 60s" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={90}><AccessStep1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={105}><AccessStep2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={80}><AccessStep3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={70}>
          <ChapterCard chapter="PART 2" title="Withdraw Funds" subtitle="Send money to your bank in a few steps" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={90}><WithdrawStep1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={120}><WithdrawStep2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={85}><WithdrawStep3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={70}>
          <ChapterCard chapter="PART 3" title="Airtime & Data" subtitle="Top up any Nigerian network" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={90}><AirtimeStep1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={130}><AirtimeStep2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 16 })} />

        <TransitionSeries.Sequence durationInFrames={85}><AirtimeStep3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={90}><Outro /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
