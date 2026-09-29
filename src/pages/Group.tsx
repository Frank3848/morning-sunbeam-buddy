 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { ArrowLeft, MessageCircle, Send } from "lucide-react";
 
 const Group = () => {
   const navigate = useNavigate();
 
   const socialChannels = [
     {
       name: "WhatsApp Channel",
       description: "Join our official WhatsApp channel for updates and support",
       icon: MessageCircle,
       color: "bg-[#25D366]",
       link: "https://whatsapp.com/channel/0029VbE3nJL2ZjCgJVtsx63O"
     },
     {
       name: "Telegram Channel",
       description: "Follow us on Telegram for news and announcements",
       icon: Send,
       color: "bg-[#0088cc]",
        link: "https://t.me/cashpaylimited"
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
             <h1 className="text-lg font-semibold">Community</h1>
             <p className="text-xs text-muted-foreground">Join our social channels</p>
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
                 <MessageCircle className="w-8 h-8 text-primary" />
               </div>
               <h2 className="text-xl font-bold mb-2">Stay Connected</h2>
               <p className="text-sm text-muted-foreground">
                 Join our community channels for instant updates, support, and exclusive offers
               </p>
             </div>
           </Card>
 
           {/* Social Channels */}
           <div className="space-y-3">
             <h3 className="text-sm font-semibold px-1">Our Channels</h3>
             {socialChannels.map((channel) => (
               <Card
                 key={channel.name}
                 onClick={() => window.open(channel.link, "_blank")}
                 className="p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
               >
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center flex-shrink-0`}>
                     <channel.icon className="w-6 h-6 text-white" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-semibold text-foreground">{channel.name}</h4>
                     <p className="text-xs text-muted-foreground line-clamp-2">{channel.description}</p>
                   </div>
                   <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 flex-shrink-0" />
                 </div>
               </Card>
             ))}
           </div>
 
           {/* Info Note */}
           <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
             <p className="text-xs text-muted-foreground text-center">
               💡 Tip: Enable notifications to never miss important updates and promotions from CashPay
             </p>
           </div>
         </div>
       </main>
     </div>
   );
 };
 
 export default Group;