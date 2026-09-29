import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, MessageCircle, Send, Headphones } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();

  const contactOptions = [
    {
      name: "WhatsApp Support",
      description: "Chat with us instantly on WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      action: () => window.open("https://whatsapp.com/channel/0029VbE3nJL2ZjCgJVtsx63O", "_blank")
    },
    {
      name: "Telegram Support",
      description: "Message us on Telegram for quick help",
      icon: Send,
      color: "bg-[#0088cc]",
      action: () => window.open("https://t.me/cashpaylimited", "_blank")
    },
    {
      name: "Call Us",
      description: "+224 30-1645-6210",
      icon: Phone,
      color: "bg-primary",
      action: () => window.open("tel:+2243016456210", "_blank")
    },
    {
      name: "Email Support",
      description: "cashpay203@gmail.com",
      icon: Mail,
      color: "bg-destructive",
      action: () => window.open("mailto:cashpay203@gmail.com", "_blank")
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Support</h1>
            <p className="text-xs text-muted-foreground">We're here to help</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Welcome Card */}
          <Card className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">24/7 Customer Support</h2>
              <p className="text-sm text-muted-foreground">
                Our support team is always ready to assist you with any questions or issues
              </p>
            </div>
          </Card>

          {/* Contact Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold px-1">Contact Us</h3>
            {contactOptions.map((option) => (
              <Card
                key={option.name}
                onClick={option.action}
                className="p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center flex-shrink-0`}>
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{option.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{option.description}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>

          {/* Operating Hours */}
          <Card className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-2">Operating Hours</h4>
              <p className="text-xs text-muted-foreground">
                Monday - Sunday: 24 hours
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Response time: Within 5 minutes
              </p>
            </div>
          </Card>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              💡 For faster support, please have your account email ready when contacting us
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
