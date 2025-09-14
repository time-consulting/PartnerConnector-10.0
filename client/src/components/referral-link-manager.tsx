import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/toast-noop";
import { 
  Copy, 
  QrCode, 
  Share, 
  Download, 
  Edit3, 
  Calendar, 
  Link2, 
  Eye,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
  Clock,
  Shield,
  Sparkles,
  Smartphone,
  Mail,
  MessageSquare,
  Globe
} from "lucide-react";

interface ReferralLink {
  id: string;
  name: string;
  url: string;
  shortCode: string;
  clicks: number;
  conversions: number;
  created: Date;
  expires?: Date;
  isActive: boolean;
  trackingEnabled: boolean;
  campaignName?: string;
}

interface ReferralLinkManagerProps {
  userReferralCode: string;
  links: ReferralLink[];
  onCreateLink: (data: any) => Promise<void>;
  onUpdateLink: (id: string, data: any) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
}

export default function ReferralLinkManager({ userReferralCode, links, onCreateLink, onUpdateLink, onDeleteLink }: ReferralLinkManagerProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<ReferralLink | null>(null);
  
  // Create Link Form State
  const [newLinkName, setNewLinkName] = useState("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newExpiryDays, setNewExpiryDays] = useState("");
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const primaryReferralUrl = `${baseUrl}/signup?ref=${userReferralCode}`;

  const copyToClipboard = (text: string, label: string = "Link") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const generateQRCode = (url: string) => {
    // Generate QR code data URL (mock implementation)
    const qrData = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="160" height="160" fill="black" opacity="0.1"/><text x="100" y="100" text-anchor="middle" fill="black" font-size="12">QR Code for: ${url.substring(0, 30)}...</text></svg>`;
    return qrData;
  };

  const handleCreateLink = async () => {
    if (!newLinkName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a link name",
        variant: "destructive",
      });
      return;
    }

    try {
      const expiryDate = newExpiryDays ? new Date(Date.now() + parseInt(newExpiryDays) * 24 * 60 * 60 * 1000) : undefined;
      
      await onCreateLink({
        name: newLinkName,
        campaignName: newCampaignName || undefined,
        expires: expiryDate,
        trackingEnabled,
      });

      setNewLinkName("");
      setNewCampaignName("");
      setNewExpiryDays("");
      setShowCreateDialog(false);
      
      toast({
        title: "Link Created",
        description: "Your new referral link has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create referral link",
        variant: "destructive",
      });
    }
  };

  const getConversionRate = (clicks: number, conversions: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';
  };

  const getStatusBadge = (link: ReferralLink) => {
    if (!link.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (link.expires && new Date() > link.expires) return <Badge variant="destructive">Expired</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>;
  };

  const shareOptions = [
    { name: "Email", icon: Mail, action: "email" },
    { name: "SMS", icon: MessageSquare, action: "sms" },
    { name: "WhatsApp", icon: MessageSquare, action: "whatsapp" },
    { name: "LinkedIn", icon: Globe, action: "linkedin" },
    { name: "Twitter", icon: Globe, action: "twitter" },
  ];

  const handleShare = (action: string, url: string) => {
    const message = `Join our partner network and start earning commissions! Use my referral link: ${url}`;
    
    switch (action) {
      case 'email':
        window.open(`mailto:?subject=Join Our Partner Network&body=${encodeURIComponent(message)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
        break;
    }
    
    toast({
      title: "Shared!",
      description: `Opened ${action} to share your referral link`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Referral Link */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Your Primary Referral Link
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Main
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <div className="flex-1 text-sm font-mono text-gray-700 break-all">
              {primaryReferralUrl}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(primaryReferralUrl, "Primary link")}
                data-testid="button-copy-primary-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQRDialog('primary')}
                data-testid="button-qr-primary"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {shareOptions.map((option) => (
              <Button
                key={option.action}
                size="sm"
                variant="outline"
                onClick={() => handleShare(option.action, primaryReferralUrl)}
                className="flex flex-col items-center gap-1 h-auto py-2"
                data-testid={`button-share-${option.action}`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-xs">{option.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Links Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Custom Referral Links
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-link">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Referral Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkName">Link Name *</Label>
                    <Input
                      id="linkName"
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                      placeholder="e.g., LinkedIn Campaign, Email Newsletter"
                      data-testid="input-link-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignName">Campaign Name (Optional)</Label>
                    <Input
                      id="campaignName"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="e.g., Q1-2024-Growth"
                      data-testid="input-campaign-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDays">Expires After (Days)</Label>
                    <Select value={newExpiryDays} onValueChange={setNewExpiryDays}>
                      <SelectTrigger data-testid="select-expiry">
                        <SelectValue placeholder="Never expires" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Never expires</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tracking">Enable click tracking</Label>
                    <Switch
                      id="tracking"
                      checked={trackingEnabled}
                      onCheckedChange={setTrackingEnabled}
                      data-testid="switch-tracking"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      data-testid="button-cancel-create"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateLink}
                      data-testid="button-confirm-create"
                    >
                      Create Link
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No custom links created yet</p>
              <p className="text-sm">Create targeted links for different campaigns and track their performance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border rounded-lg p-4" data-testid={`link-${link.id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{link.name}</h4>
                      {link.campaignName && (
                        <p className="text-sm text-gray-600">Campaign: {link.campaignName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(link)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLink(link)}
                        data-testid={`button-edit-${link.id}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
                    <div className="flex-1 text-sm font-mono text-gray-700 break-all">
                      {link.url}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link.url)}
                      data-testid={`button-copy-${link.id}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>
                        <span className="font-semibold">{link.clicks}</span> clicks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span>
                        <span className="font-semibold">{link.conversions}</span> conversions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>
                        <span className="font-semibold">{getConversionRate(link.clicks, link.conversions)}%</span> rate
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">
                        {link.created.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {link.expires && (
                    <div className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Expires: {link.expires.toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!showQRDialog} onOpenChange={() => setShowQRDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-white p-4 border rounded-lg inline-block">
              <img 
                src={generateQRCode(showQRDialog === 'primary' ? primaryReferralUrl : links.find(l => l.id === showQRDialog)?.url || '')} 
                alt="QR Code" 
                className="w-48 h-48"
                data-testid="qr-code-image"
              />
            </div>
            <p className="text-sm text-gray-600">
              Scan this QR code to access your referral link
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" data-testid="button-download-qr">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" data-testid="button-share-qr">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}